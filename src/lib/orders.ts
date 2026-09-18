import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orderItems,
  orders,
  products,
  type OrderItemRow,
  type OrderRow,
} from "@/db/schema";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  generateOrderNumber,
} from "./config";
import { getRazorpay } from "./razorpay";
import { fulfillOrder, type ShipmentResult } from "./shiprocket";

export class CheckoutError extends Error {}

export type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
};

export function validateCustomer(c: CheckoutCustomer): void {
  if (!c.name || c.name.trim().length < 3) throw new CheckoutError("Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email ?? "")) throw new CheckoutError("Please enter a valid email address.");
  if ((c.phone ?? "").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").length !== 10)
    throw new CheckoutError("Please enter a valid 10-digit phone number.");
  if (!c.address || c.address.trim().length < 8) throw new CheckoutError("Please enter a complete street address.");
  if (!c.city?.trim()) throw new CheckoutError("Please enter your city.");
  if (!c.state?.trim()) throw new CheckoutError("Please select your state.");
  if (!/^\d{6}$/.test(c.pincode ?? "")) throw new CheckoutError("Please enter a valid 6-digit pincode.");
}

type MergeableItem = { slug: string; qty: number };

export async function createPendingOrder(
  customer: CheckoutCustomer,
  rawItems: MergeableItem[],
) {
  validateCustomer(customer);
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new CheckoutError("Your bag is empty.");
  }

  // Merge duplicate slugs, clamp quantities
  const merged = new Map<string, number>();
  for (const item of rawItems) {
    if (!item.slug) continue;
    const qty = Math.max(1, Math.min(10, Math.floor(Number(item.qty)) || 1));
    merged.set(item.slug, (merged.get(item.slug) ?? 0) + qty);
  }
  const slugs = [...merged.keys()];
  const rows = await db.select().from(products).where(inArray(products.slug, slugs));
  if (rows.length !== slugs.length) {
    throw new CheckoutError("Some pieces in your bag are no longer available.");
  }
  for (const product of rows) {
    const qty = merged.get(product.slug)!;
    if (product.stock < qty) {
      throw new CheckoutError(
        `Only ${product.stock} ${product.stock === 1 ? "piece" : "pieces"} of ${product.name} remain.`,
      );
    }
  }

  const lineItems = rows.map((product) => ({
    product,
    qty: merged.get(product.slug)!,
  }));
  const subtotal = lineItems.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const orderNumber = generateOrderNumber();

  const razorpay = getRazorpay();
  let razorpayOrderId: string | null = null;
  if (razorpay) {
    const rzpOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: orderNumber,
      notes: { brand: "AURELLE", orderNumber },
    });
    razorpayOrderId = rzpOrder.id;
  }

  const order = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(orders)
      .values({
        orderNumber,
        customerName: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.replace(/\D/g, "").slice(-10),
        address: customer.address.trim(),
        landmark: customer.landmark?.trim() || null,
        city: customer.city.trim(),
        state: customer.state.trim(),
        pincode: customer.pincode,
        subtotal,
        shipping,
        total,
        status: "created",
        paymentStatus: "pending",
        paymentMethod: razorpayOrderId ? "razorpay" : "demo",
        razorpayOrderId,
      })
      .returning();
    await tx.insert(orderItems).values(
      lineItems.map((l) => ({
        orderId: inserted.id,
        productId: l.product.id,
        name: l.product.name,
        sku: `AUR-${l.product.id}`,
        image: l.product.image,
        price: l.product.price,
        qty: l.qty,
      })),
    );
    return inserted;
  });

  return { order, razorpayOrderId };
}

export type OrderWithItems = { order: OrderRow; items: OrderItemRow[] };

export async function getOrderWithItems(orderNumber: string): Promise<OrderWithItems | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function listOrders(limit = 200) {
  const rows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
  if (rows.length === 0) return { orders: [], counts: new Map<number, number>() };
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((o) => o.id)));
  const counts = new Map<number, number>();
  for (const item of items) {
    counts.set(item.orderId, (counts.get(item.orderId) ?? 0) + item.qty);
  }
  return { orders: rows, counts };
}

export async function finalizePaidOrder(
  order: OrderRow,
  items: OrderItemRow[],
  payment: { method: "razorpay" | "demo"; razorpayPaymentId?: string | null },
): Promise<{ shipment: ShipmentResult | null }> {
  const now = new Date();
  await db
    .update(orders)
    .set({
      paymentStatus: "paid",
      status: "confirmed",
      paymentMethod: payment.method,
      razorpayPaymentId: payment.razorpayPaymentId ?? null,
      updatedAt: now,
    })
    .where(eq(orders.id, order.id));

  // Decrement stock (best effort, never below zero)
  for (const item of items) {
    if (!item.productId) continue;
    await db
      .update(products)
      .set({ stock: sql`GREATEST(${products.stock} - ${item.qty}, 0)` })
      .where(eq(products.id, item.productId));
  }

  // Fulfil via Shiprocket (best effort — the order stays confirmed even if this fails)
  let shipment: ShipmentResult | null = null;
  try {
    shipment = await fulfillOrder(order, items);
    await db
      .update(orders)
      .set({
        fulfillmentStatus: shipment.fulfillmentStatus,
        status: shipment.fulfillmentStatus === "awb_assigned" ? "shipped" : "confirmed",
        shiprocketOrderId: shipment.shiprocketOrderId,
        shiprocketShipmentId: shipment.shipmentId,
        awbCode: shipment.awb,
        courierName: shipment.courier,
        trackingUrl: shipment.awb
          ? `https://shiprocket.co/tracking/${shipment.awb}`
          : null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));
  } catch (error) {
    console.error("[fulfilment] failed for", order.orderNumber, error);
    await db
      .update(orders)
      .set({ fulfillmentStatus: "failed", updatedAt: new Date() })
      .where(eq(orders.id, order.id));
  }
  return { shipment };
}
