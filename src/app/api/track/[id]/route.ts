import { db } from "@/db";
import { orders } from "@/db/schema";
import { liveTracking } from "@/lib/shiprocket";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const key = decodeURIComponent(id).trim();
  if (!key) {
    return Response.json({ error: "Provide an order number or AWB code." }, { status: 400 });
  }
  const [order] = await db
    .select()
    .from(orders)
    .where(or(eq(orders.orderNumber, key), eq(orders.awbCode, key)))
    .limit(1);
  if (!order) {
    return Response.json(
      { error: "We could not find a shipment with that reference." },
      { status: 404 },
    );
  }
  const tracking = await liveTracking(order);
  return Response.json({
    orderNumber: order.orderNumber,
    city: order.city,
    state: order.state,
    ...tracking,
  });
}
