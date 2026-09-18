import { razorpayConfigured } from "@/lib/config";
import { finalizePaidOrder, getOrderWithItems } from "@/lib/orders";
import { verifyPaymentSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

type VerifyBody = {
  orderNumber?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  demo?: boolean;
};

export async function POST(request: Request) {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const orderNumber = body.orderNumber;
  if (!orderNumber) {
    return Response.json({ error: "orderNumber is required." }, { status: 400 });
  }

  const found = await getOrderWithItems(orderNumber);
  if (!found) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }
  const { order, items } = found;

  // Idempotent — refreshing the success page never double-charges or double-ships.
  if (order.paymentStatus === "paid") {
    return Response.json({
      ok: true,
      already: true,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      awb: order.awbCode,
      courier: order.courierName,
    });
  }

  if (order.razorpayOrderId) {
    // Live Razorpay order — signature verification is mandatory.
    if (!razorpayConfigured()) {
      return Response.json(
        { error: "Razorpay is not configured on the server." },
        { status: 400 },
      );
    }
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    if (
      razorpayOrderId !== order.razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    ) {
      return Response.json(
        { error: "Payment signature verification failed. Your amount was not captured." },
        { status: 400 },
      );
    }
    const { shipment } = await finalizePaidOrder(order, items, {
      method: "razorpay",
      razorpayPaymentId,
    });
    return Response.json({
      ok: true,
      orderNumber: order.orderNumber,
      paymentStatus: "paid",
      fulfillmentStatus: shipment?.fulfillmentStatus ?? "failed",
      awb: shipment?.awb ?? null,
      courier: shipment?.courier ?? null,
    });
  }

  // Demo order — only honoured while no live Razorpay keys are configured.
  if (razorpayConfigured()) {
    return Response.json(
      { error: "This store is in live mode; demo payments are disabled." },
      { status: 400 },
    );
  }
  if (!body.demo) {
    return Response.json({ error: "Missing demo confirmation." }, { status: 400 });
  }
  const { shipment } = await finalizePaidOrder(order, items, { method: "demo" });
  return Response.json({
    ok: true,
    orderNumber: order.orderNumber,
    paymentStatus: "paid",
    fulfillmentStatus: shipment?.fulfillmentStatus ?? "failed",
    awb: shipment?.awb ?? null,
    courier: shipment?.courier ?? null,
  });
}
