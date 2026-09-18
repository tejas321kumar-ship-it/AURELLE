import { getOrderWithItems } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const found = await getOrderWithItems(orderNumber);
  if (!found) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }
  return Response.json(found);
}
