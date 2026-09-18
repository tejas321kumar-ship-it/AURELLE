import {
  SHIPROCKET_BASE,
  SHIPROCKET_PICKUP_LOCATION,
  SHIPROCKET_PICKUP_PINCODE,
  shiprocketConfigured,
} from "./config";
import type { OrderItemRow, OrderRow } from "@/db/schema";

/* ---------------------------------- auth ---------------------------------- */

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  
  if (!email || !password) {
    throw new Error("Shiprocket credentials not configured");
  }
  
  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      email,
      password,
    }),
  });
  if (!res.ok) throw new Error(`Shiprocket auth failed (${res.status})`);
  const json = (await res.json()) as { token?: string };
  if (!json.token) throw new Error("Shiprocket auth returned no token");
  tokenCache = { token: json.token, expiresAt: Date.now() + 8 * 24 * 3600 * 1000 };
  return json.token;
}

async function srFetch<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${SHIPROCKET_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 401 && retry) {
    await getToken(true);
    return srFetch<T>(path, init, false);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Shiprocket ${path} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/* --------------------------------- types ---------------------------------- */

export type ShipmentResult = {
  mode: "live" | "demo";
  shiprocketOrderId: string | null;
  shipmentId: string | null;
  awb: string | null;
  courier: string | null;
  fulfillmentStatus: "booked" | "awb_assigned";
  error?: string;
};

export type TrackingStep = {
  title: string;
  detail: string;
  location: string | null;
  at: string; // ISO
  state: "done" | "current" | "upcoming";
};

export type TrackingResult = {
  awb: string | null;
  courier: string | null;
  status: string;
  expectedDate: string | null;
  live: boolean;
  steps: TrackingStep[];
};

/* ------------------------------ create order ------------------------------ */

function splitName(full: string): [string, string] {
  const parts = full.trim().split(/\s+/);
  return [parts[0] ?? "Customer", parts.slice(1).join(" ") || "-"];
}

export async function fulfillOrder(
  order: OrderRow,
  items: OrderItemRow[],
): Promise<ShipmentResult> {
  if (!shiprocketConfigured()) {
    // Demo fulfilment — clearly identifiable AWB so it never collides with live data.
    const awb = `AUR${String(Date.now()).slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
    return {
      mode: "demo",
      shiprocketOrderId: null,
      shipmentId: null,
      awb,
      courier: "Aurelle Express (demo)",
      fulfillmentStatus: "awb_assigned",
    };
  }

  const [firstName, lastName] = splitName(order.customerName);
  const orderDate = new Date(order.createdAt)
    .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
    .replace(",", "");

  const payload = {
    order_id: order.orderNumber,
    order_date: orderDate.slice(0, 16),
    pickup_location: SHIPROCKET_PICKUP_LOCATION,
    comment: "AURELLE fine jewellery — handle with care, high value",
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.address,
    billing_address_2: order.landmark ?? "",
    billing_city: order.city,
    billing_pincode: order.pincode,
    billing_state: order.state,
    billing_country: "India",
    billing_email: order.email,
    billing_phone: order.phone.replace(/\D/g, "").slice(-10),
    shipping_is_billing: true,
    order_items: items.map((item) => ({
      name: item.name,
      sku: item.sku ?? `AUR-${item.productId ?? item.id}`,
      units: item.qty,
      selling_price: item.price,
      discount: 0,
    })),
    payment_method: "Prepaid",
    sub_total: order.subtotal,
    shipping_charges: order.shipping,
    total_discount: 0,
    length: 12,
    breadth: 10,
    height: 6,
    weight: Math.max(0.3, items.reduce((sum, i) => sum + i.qty, 0) * 0.25),
  };

  const created = await srFetch<{
    order_id?: number | string;
    shipment_id?: number | string;
  }>("/orders/create/adhoc", { method: "POST", body: JSON.stringify(payload) });

  const shipmentId = created.shipment_id ? String(created.shipment_id) : null;
  const shiprocketOrderId = created.order_id ? String(created.order_id) : null;

  if (!shipmentId) {
    throw new Error("Shiprocket did not return a shipment_id");
  }

  try {
    const awbRes = await srFetch<{
      awb_assign_status?: number;
      response?: { data?: { awb_code?: string | number; courier_name?: string } };
    }>("/courier/assign/awb", {
      method: "POST",
      body: JSON.stringify({ shipment_id: Number(shipmentId) }),
    });
    const data = awbRes.response?.data;
    if (data?.awb_code) {
      return {
        mode: "live",
        shiprocketOrderId,
        shipmentId,
        awb: String(data.awb_code),
        courier: data.courier_name ?? "Shiprocket courier",
        fulfillmentStatus: "awb_assigned",
      };
    }
    return {
      mode: "live",
      shiprocketOrderId,
      shipmentId,
      awb: null,
      courier: null,
      fulfillmentStatus: "booked",
    };
  } catch {
    // Order is created on Shiprocket; AWB can be assigned later from the admin panel.
    return {
      mode: "live",
      shiprocketOrderId,
      shipmentId,
      awb: null,
      courier: null,
      fulfillmentStatus: "booked",
    };
  }
}

/* -------------------------------- tracking -------------------------------- */

const SIM_STEPS: {
  title: string;
  detail: string;
  location: string | null;
  offsetH: number;
}[] = [
  { title: "Order confirmed", detail: "Payment received — your order is being prepared at the atelier.", location: "Jaipur Atelier", offsetH: 0 },
  { title: "Shipment booked", detail: `Booking created on Shiprocket from pickup pincode ${SHIPROCKET_PICKUP_PINCODE}.`, location: "Jaipur Atelier", offsetH: 2 },
  { title: "Courier assigned", detail: "AWB generated and handed to the courier partner.", location: "Jaipur Hub", offsetH: 6 },
  { title: "Picked up", detail: "Package collected by the courier partner.", location: "Jaipur Hub", offsetH: 20 },
  { title: "In transit", detail: "Shipment is moving through the network.", location: "Regional Hub", offsetH: 42 },
  { title: "Arrived at destination hub", detail: "Shipment reached the delivery city hub.", location: null, offsetH: 62 },
  { title: "Out for delivery", detail: "The courier is on the way to your doorstep.", location: null, offsetH: 80 },
  { title: "Delivered", detail: "Package delivered. AURELLE wishes you joy.", location: null, offsetH: 100 },
];

export function simulatedTracking(order: OrderRow): TrackingResult {
  const origin = new Date(order.createdAt).getTime();
  const paidBonus = order.paymentStatus === "paid" ? 0 : -24; // starts later if unpaid
  const now = Date.now();
  const steps: TrackingStep[] = SIM_STEPS.map((s) => {
    const at = new Date(origin + (s.offsetH + paidBonus) * 3600_000);
    return {
      title: s.title,
      detail: s.detail,
      location: s.location ?? order.city,
      at: at.toISOString(),
      state: "upcoming" as const,
    };
  });
  let current = -1;
  steps.forEach((s, i) => {
    if (new Date(s.at).getTime() <= now) {
      s.state = "done";
      current = i;
    }
  });
  if (current >= 0) steps[current].state = "current";
  const status = current >= 0 ? steps[current].title : "Order placed";
  const expected = new Date(origin + 100 * 3600_000).toISOString();
  return {
    awb: order.awbCode,
    courier: order.courierName ?? "Aurelle Express (demo)",
    status,
    expectedDate: expected,
    live: false,
    steps,
  };
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function liveTracking(order: OrderRow): Promise<TrackingResult> {
  if (!order.awbCode || order.awbCode.startsWith("AUR")) {
    return simulatedTracking(order);
  }
  try {
    const data = await srFetch<{
      tracking_data?: {
        track_status?: number;
        etd?: string;
        shipment_track?: { current_status?: string }[];
        shipment_track_activities?: {
          "date"?: string;
          status?: string;
          activity?: string;
          location?: string;
        }[];
      };
    }>(`/courier/track/awb/${encodeURIComponent(order.awbCode)}`);

    const td = data.tracking_data;
    const activities = [...(td?.shipment_track_activities ?? [])]
      .map((a) => ({
        title: titleCase(a.status ?? a.activity ?? "Update"),
        detail: a.activity ?? "",
        location: a.location ?? null,
        at: a["date"] ? new Date(a["date"].replace(" ", "T")).toISOString() : new Date().toISOString(),
      }))
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    if (activities.length === 0) return simulatedTracking(order);

    const steps: TrackingStep[] = activities.map((a, i) => ({
      ...a,
      state: i === activities.length - 1 ? "current" : "done",
    }));

    return {
      awb: order.awbCode,
      courier: order.courierName ?? "Shiprocket courier",
      status: td?.shipment_track?.[0]?.current_status ?? steps[steps.length - 1].title,
      expectedDate: td?.etd ? new Date(td.etd.replace(" ", "T")).toISOString() : null,
      live: true,
      steps,
    };
  } catch {
    return simulatedTracking(order);
  }
}

/* ----------------------------- serviceability ----------------------------- */

export type ServiceabilityResult = {
  serviceable: boolean;
  live: boolean;
  couriers: number;
  etaDays: string | null;
  etd: string | null;
};

export async function checkServiceability(pincode: string): Promise<ServiceabilityResult> {
  if (!shiprocketConfigured()) {
    return { serviceable: true, live: false, couriers: 3, etaDays: "3-5", etd: null };
  }
  const qs = new URLSearchParams({
    pickup_postcode: SHIPROCKET_PICKUP_PINCODE,
    delivery_postcode: pincode,
    weight: "0.3",
    cod: "0",
  });
  const json = await srFetch<{
    data?: {
      available_courier_companies?: { estimated_delivery_days?: string; etd?: string }[];
      blocked_courier_companies?: unknown[];
    };
  }>(`/courier/serviceability/?${qs.toString()}`);
  const couriers = json.data?.available_courier_companies ?? [];
  const fastest = couriers[0];
  return {
    serviceable: couriers.length > 0,
    live: true,
    couriers: couriers.length,
    etaDays: fastest?.estimated_delivery_days ?? null,
    etd: fastest?.etd ?? null,
  };
}
