import {
  CreditCard,
  IndianRupee,
  KeyRound,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { FulfillButton } from "@/components/fulfill-button";
import { Reveal } from "@/components/motion";
import { razorpayConfigured, shiprocketConfigured } from "@/lib/config";
import { formatDate, formatINR } from "@/lib/money";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Atelier Dashboard — AURELLE" };

function PaymentBadge({ status }: { status: string }) {
  const cls =
    status === "paid"
      ? "border-gold/50 bg-gold/10 text-goldlight"
      : status === "failed"
        ? "border-red-500/40 bg-red-500/5 text-red-400"
        : "border-gold/20 text-greige";
  return (
    <span className={`whitespace-nowrap border px-2.5 py-1 text-[9.5px] uppercase tracking-[0.16em] ${cls}`}>
      {status}
    </span>
  );
}

function OrderBadge({ status }: { status: string }) {
  const cls =
    status === "delivered"
      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
      : status === "shipped"
        ? "border-gold/50 bg-gold/10 text-goldlight"
        : status === "cancelled"
          ? "border-red-500/40 bg-red-500/5 text-red-400"
          : "border-gold/20 text-greige";
  return (
    <span className={`whitespace-nowrap border px-2.5 py-1 text-[9.5px] uppercase tracking-[0.16em] ${cls}`}>
      {status}
    </span>
  );
}

function FulfillmentBadge({ status }: { status: string }) {
  const cls =
    status === "awb_assigned"
      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
      : status === "booked"
        ? "border-gold/50 bg-gold/10 text-goldlight"
        : status === "failed"
          ? "border-red-500/40 bg-red-500/5 text-red-400"
          : "border-gold/20 text-greige";
  return (
    <span className={`whitespace-nowrap border px-2.5 py-1 text-[9.5px] uppercase tracking-[0.16em] ${cls}`}>
      {status === "awb_assigned" ? "AWB assigned" : status}
    </span>
  );
}

export default async function AdminPage() {
  const { orders, counts } = await listOrders();
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const awaitingShipment = paidOrders.filter((o) => !o.awbCode).length;
  const shipped = orders.filter((o) => o.awbCode).length;

  const rzp = razorpayConfigured();
  const sr = shiprocketConfigured();

  const stats = [
    { icon: IndianRupee, label: "Revenue (paid)", value: formatINR(revenue) },
    { icon: ShoppingBag, label: "Orders", value: String(orders.length) },
    { icon: Truck, label: "Shipments live", value: String(shipped) },
    { icon: PackageCheck, label: "Needs fulfilment", value: String(awaitingShipment) },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-18">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
              AURELLE · Back Office
            </p>
            <h1 className="mt-2 font-serif text-4xl font-light text-ivory md:text-5xl">
              Atelier <span className="gold-text italic">dashboard</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`flex items-center gap-2 border px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] ${
                rzp ? "border-emerald-500/40 text-emerald-400" : "border-gold/25 text-greige"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Razorpay {rzp ? "· live" : "· demo"}
            </span>
            <span
              className={`flex items-center gap-2 border px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] ${
                sr ? "border-emerald-500/40 text-emerald-400" : "border-gold/25 text-greige"
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              Shiprocket {sr ? "· live" : "· demo"}
            </span>
          </div>
        </div>
      </Reveal>

      {/* Stats */}
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08}>
            <div className="border border-gold/12 bg-coal/70 px-6 py-6">
              <stat.icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
              <p className="mt-4 font-serif text-3xl text-ivory">{stat.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-greige">
                {stat.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Integrations note */}
      {(!rzp || !sr) && (
        <Reveal className="mt-6">
          <div className="flex flex-wrap items-start gap-4 border border-gold/20 bg-umber/40 px-6 py-5">
            <KeyRound className="mt-1 h-5 w-5 shrink-0 text-gold" />
            <div className="text-sm leading-relaxed text-greige">
              <p className="text-cream">Running in sandbox mode.</p>
              <p className="mt-1">
                {!rzp && (
                  <>
                    Set <span className="font-mono text-goldlight">RAZORPAY_KEY_ID</span> and{" "}
                    <span className="font-mono text-goldlight">RAZORPAY_KEY_SECRET</span> for live payments.{" "}
                  </>
                )}
                {!sr && (
                  <>
                    Set <span className="font-mono text-goldlight">SHIPROCKET_EMAIL</span> and{" "}
                    <span className="font-mono text-goldlight">SHIPROCKET_PASSWORD</span> (plus optional{" "}
                    <span className="font-mono text-goldlight">SHIPROCKET_PICKUP_LOCATION</span>) for live
                    shipment booking. Orders already flow end-to-end in demo form.
                  </>
                )}
              </p>
            </div>
          </div>
        </Reveal>
      )}

      {/* Orders table */}
      <Reveal className="mt-10" delay={0.1}>
        <div className="border border-gold/12 bg-coal/70">
          <div className="flex items-center justify-between border-b border-gold/12 px-6 py-5">
            <h2 className="font-serif text-xl text-cream">Orders</h2>
            <span className="text-[11px] uppercase tracking-[0.2em] text-greige">
              Latest {orders.length}
            </span>
          </div>
          {orders.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-greige">
              No orders yet — place one from the storefront to see the full pipeline.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gold/10 text-[10px] uppercase tracking-[0.2em] text-greige">
                    <th className="px-6 py-4 font-medium">Order</th>
                    <th className="px-4 py-4 font-medium">Customer</th>
                    <th className="px-4 py-4 font-medium">Items</th>
                    <th className="px-4 py-4 font-medium">Total</th>
                    <th className="px-4 py-4 font-medium">Payment</th>
                    <th className="px-4 py-4 font-medium">Order</th>
                    <th className="px-4 py-4 font-medium">Fulfilment</th>
                    <th className="px-4 py-4 font-medium">AWB / Courier</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/8">
                  {orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-gold/[0.03]">
                      <td className="px-6 py-4">
                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="font-mono text-[13px] text-goldlight hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-greige/70">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-cream">{order.customerName}</p>
                        <p className="text-[11px] text-greige/70">
                          {order.city}, {order.state}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-cream/80">{counts.get(order.id) ?? 0}</td>
                      <td className="px-4 py-4 font-medium text-cream">{formatINR(order.total)}</td>
                      <td className="px-4 py-4">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-4 py-4">
                        <OrderBadge status={order.status} />
                      </td>
                      <td className="px-4 py-4">
                        <FulfillmentBadge status={order.fulfillmentStatus} />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-mono text-[12px] text-cream/80">{order.awbCode ?? "—"}</p>
                        <p className="text-[11px] text-greige/70">{order.courierName ?? ""}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/orders/${order.orderNumber}`}
                            className="border border-gold/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-greige transition-colors hover:border-gold hover:text-goldlight"
                          >
                            View
                          </Link>
                          {order.paymentStatus === "paid" && !order.awbCode && (
                            <FulfillButton orderNumber={order.orderNumber} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
