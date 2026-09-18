import { razorpayConfigured } from "@/lib/config";
import { CheckoutError, createPendingOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { customer, items } = (body ?? {}) as {
    customer?: Parameters<typeof createPendingOrder>[0];
    items?: Parameters<typeof createPendingOrder>[1];
  };

  if (!customer || !items) {
    return Response.json({ error: "Missing checkout details." }, { status: 400 });
  }

  try {
    const { order, razorpayOrderId } = await createPendingOrder(customer, items);
    const live = razorpayConfigured() && Boolean(razorpayOrderId);
    return Response.json({
      orderNumber: order.orderNumber,
      total: order.total,
      amountPaise: order.total * 100,
      currency: "INR",
      mode: live ? "razorpay" : "demo",
      razorpayOrderId,
      keyId: live ? process.env.RAZORPAY_KEY_ID : null,
      prefill: {
        name: order.customerName,
        email: order.email,
        contact: order.phone,
      },
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("[checkout] failed", error);
    }
    return Response.json(
      { error: "We could not create your order. Please try again." },
      { status: 500 },
    );
  }
}
