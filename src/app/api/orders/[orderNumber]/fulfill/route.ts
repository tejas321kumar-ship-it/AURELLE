import { db } from "@/db";
import { orders } from "@/db/schema";
import { getOrderWithItems } from "@/lib/orders";
import { fulfillOrder } from "@/lib/shiprocket";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const found = await getOrderWithItems(orderNumber);
  if (!found) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }
  const { order, items } = found;

  if (order.paymentStatus !== "paid") {
    return Response.json(
      { error: "Only paid orders can be fulfilled." },
      { status: 400 },
    );
  }
  if (order.awbCode) {
    return Response.json({
      ok: true,
      message: "Shipment already booked.",
      awb: order.awbCode,
      courier: order.courierName,
    });
  }

  try {
    const shipment = await fulfillOrder(order, items);
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
    return Response.json({
      ok: true,
      fulfillmentStatus: shipment.fulfillmentStatus,
      awb: shipment.awb,
      courier: shipment.courier,
    });
  } catch (error) {
    console.error("[fulfil route] failed", error);
    await db
      .update(orders)
      .set({ fulfillmentStatus: "failed", updatedAt: new Date() })
      .where(eq(orders.id, order.id));
    return Response.json(
      { error: "Shiprocket fulfilment failed. Check SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD." },
      { status: 502 },
    );
  }
}
