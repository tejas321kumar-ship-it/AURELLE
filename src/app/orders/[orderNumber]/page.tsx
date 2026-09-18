import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CreditCard, MapPin, PackageCheck, Truck } from "lucide-react";
import { OrderHero } from "@/components/order-hero";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { formatDate, formatINR } from "@/lib/money";
import { getOrderWithItems } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const [{ orderNumber }, query] = await Promise.all([params, searchParams]);
  const found = await getOrderWithItems(orderNumber);
  if (!found) notFound();
  const { order, items } = found;
  const justPaid = query.success === "1" && order.paymentStatus === "paid";

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-14 md:px-10 md:py-20">
      <OrderHero
        justPaid={justPaid}
        orderNumber={order.orderNumber}
        email={order.email}
        paymentStatus={order.paymentStatus}
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Items */}
        <div className="border border-gold/15 bg-coal/70">
          <div className="flex items-center justify-between border-b border-gold/12 px-6 py-5">
            <h2 className="font-serif text-xl text-cream">Your Pieces</h2>
            <span className="text-[11px] uppercase tracking-[0.2em] text-greige">
              {items.reduce((s, i) => s + i.qty, 0)} items · {formatDate(order.createdAt)}
            </span>
          </div>
          <ul className="divide-y divide-gold/8 px-6">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-5 py-5">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-umber">
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-lg text-cream">{item.name}</p>
                  <p className="mt-1 text-xs text-greige">
                    SKU {item.sku} · Qty {item.qty}
                  </p>
                </div>
                <p className="font-serif text-lg text-goldlight">
                  {formatINR(item.price * item.qty)}
                </p>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-gold/12 px-6 py-5 text-sm">
            <div className="flex justify-between text-greige">
              <span>Subtotal</span>
              <span className="text-cream">{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-greige">
              <span>Insured shipping</span>
              <span className="text-cream">
                {order.shipping === 0 ? "Complimentary" : formatINR(order.shipping)}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <span className="text-[11px] uppercase tracking-[0.24em] text-greige">Total paid</span>
              <span className="font-serif text-2xl text-goldlight">{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Delivery */}
          <div className="border border-gold/15 bg-coal/70">
            <div className="flex items-center gap-3 border-b border-gold/12 px-6 py-4">
              <MapPin className="h-4 w-4 text-gold" />
              <h2 className="font-serif text-lg text-cream">Delivering to</h2>
            </div>
            <div className="px-6 py-5 text-sm leading-relaxed text-greige">
              <p className="font-medium text-cream">{order.customerName}</p>
              <p className="mt-1.5">
                {order.address}
                {order.landmark ? `, ${order.landmark}` : ""}
              </p>
              <p>
                {order.city}, {order.state} — {order.pincode}
              </p>
              <p className="mt-1.5">+91 {order.phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="border border-gold/15 bg-coal/70">
            <div className="flex items-center gap-3 border-b border-gold/12 px-6 py-4">
              <CreditCard className="h-4 w-4 text-gold" />
              <h2 className="font-serif text-lg text-cream">Payment</h2>
            </div>
            <div className="space-y-2.5 px-6 py-5 text-sm">
              <div className="flex justify-between">
                <span className="text-greige">Status</span>
                <span
                  className={`border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                    order.paymentStatus === "paid"
                      ? "border-gold/50 bg-gold/10 text-goldlight"
                      : order.paymentStatus === "failed"
                        ? "border-red-500/40 text-red-400"
                        : "border-gold/20 text-greige"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-greige">Method</span>
                <span className="capitalize text-cream">{order.paymentMethod}</span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between gap-4">
                  <span className="text-greige">Razorpay payment</span>
                  <span className="break-all text-right text-cream/80">{order.razorpayPaymentId}</span>
                </div>
              )}
              {order.razorpayOrderId && (
                <div className="flex justify-between gap-4">
                  <span className="text-greige">Razorpay order</span>
                  <span className="break-all text-right text-cream/80">{order.razorpayOrderId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipment */}
          <div className="border border-gold/15 bg-coal/70">
            <div className="flex items-center gap-3 border-b border-gold/12 px-6 py-4">
              <Truck className="h-4 w-4 text-gold" />
              <h2 className="font-serif text-lg text-cream">Shipment · Shiprocket</h2>
            </div>
            <div className="space-y-2.5 px-6 py-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-greige">Courier</span>
                <span className="text-right text-cream">{order.courierName ?? "Assigning…"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-greige">AWB code</span>
                <span className="break-all text-right font-mono text-[13px] text-goldlight">
                  {order.awbCode ?? "Pending assignment"}
                </span>
              </div>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-lux mt-1 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold"
                >
                  View on Shiprocket <PackageCheck className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live timeline */}
      <div className="mt-8 border border-gold/15 bg-coal/70">
        <div className="border-b border-gold/12 px-6 py-5">
          <h2 className="font-serif text-xl text-cream">Journey of your order</h2>
        </div>
        <div className="px-6 py-6">
          <TrackingTimeline reference={order.orderNumber} />
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-5">
        <Link
          href="/track"
          className="border border-gold/40 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-goldlight transition-all hover:border-gold hover:bg-gold/10"
        >
          Track another shipment
        </Link>
        <Link
          href="/shop"
          className="group flex items-center gap-3 bg-gold px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-ink transition-colors hover:bg-goldlight"
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
