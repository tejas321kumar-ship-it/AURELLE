import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  const { orders: rows, counts } = await listOrders();
  return Response.json({
    orders: rows.map((order) => ({
      ...order,
      itemCount: counts.get(order.id) ?? 0,
    })),
  });
}
