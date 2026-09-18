"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  ChevronLeft,
  CreditCard,
  Gem,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatINR } from "@/lib/money";
import { DemoPaymentModal } from "./demo-payment-modal";
import { useCart } from "./providers";
import { Reveal } from "./motion";

/* ------------------------------ razorpay types ----------------------------- */

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string; backdrop_color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpaySuccess) => void | Promise<void>;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (
        event: string,
        callback: (response: { error?: { description?: string } }) => void,
      ) => void;
    };
  }
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* --------------------------------- checkout -------------------------------- */

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand",
  "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Puducherry", "Chandigarh",
];

const FREE_THRESHOLD = 5000;
const SHIPPING_FEE = 199;

type CheckoutResponse = {
  orderNumber: string;
  total: number;
  amountPaise: number;
  currency: string;
  mode: "razorpay" | "demo";
  razorpayOrderId: string | null;
  keyId: string | null;
  prefill: { name: string; email: string; contact: string };
  error?: string;
};

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

export function CheckoutClient() {
  const { items, subtotal, hydrated, clear, notify } = useCart();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});
  const [serverConfig, setServerConfig] = useState<{ razorpay: boolean; shiprocket: boolean } | null>(null);
  const [stage, setStage] = useState<"form" | "processing" | "paying" | "verifying">("form");
  const [pendingDemo, setPendingDemo] = useState<CheckoutResponse | null>(null);

  const shipping = subtotal >= FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((json) => setServerConfig({ razorpay: json.razorpay, shiprocket: json.shiprocket }))
      .catch(() => setServerConfig({ razorpay: false, shiprocket: false }));
  }, []);

  const lineItems = useMemo(
    () => items.map((i) => ({ slug: i.slug, qty: i.qty })),
    [items],
  );

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (form.name.trim().length < 3) next.name = "Full name, please.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = "Valid email required.";
    if (form.phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").length !== 10)
      next.phone = "10-digit number.";
    if (form.address.trim().length < 8) next.address = "Complete address, please.";
    if (!form.city.trim()) next.city = "Required.";
    if (!form.state) next.state = "Select state.";
    if (!/^\d{6}$/.test(form.pincode)) next.pincode = "6 digits.";
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handlePay() {
    if (!validate()) {
      notify("A few details need attention", "Please review the highlighted fields");
      return;
    }
    setStage("processing");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items: lineItems }),
      });
      const data = (await res.json()) as CheckoutResponse;
      if (!res.ok) {
        notify("Could not create your order", data.error ?? "Please try again");
        setStage("form");
        return;
      }
      if (data.mode === "demo") {
        setPendingDemo(data);
        setStage("paying");
        return;
      }
      await openRazorpay(data);
    } catch {
      notify("Something went wrong", "Please try again");
      setStage("form");
    }
  }

  async function openRazorpay(data: CheckoutResponse) {
    setStage("processing");
    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!loaded || !window.Razorpay || !data.keyId || !data.razorpayOrderId) {
      notify("Razorpay could not be loaded", "Check your connection and try again");
      setStage("form");
      return;
    }

    const rzp = new window.Razorpay({
      key: data.keyId,
      amount: data.amountPaise,
      currency: data.currency,
      name: "AURELLE Fine Jewellery",
      description: `Order ${data.orderNumber}`,
      order_id: data.razorpayOrderId,
      prefill: data.prefill,
      notes: { orderNumber: data.orderNumber },
      theme: { color: "#c9a05c", backdrop_color: "rgba(20,17,13,0.9)" },
      modal: {
        ondismiss: () => {
          setStage("form");
          notify("Payment window closed", `Order ${data.orderNumber} is saved as pending`);
        },
      },
      handler: async (response) => {
        setStage("verifying");
        await verifyPayment({
          orderNumber: data.orderNumber,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
    });
    rzp.on("payment.failed", (response) => {
      setStage("form");
      notify("Payment failed", response.error?.description ?? "No amount was captured");
    });
    rzp.open();
  }

  async function verifyPayment(payload: Record<string, unknown>) {
    try {
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        notify("Payment could not be confirmed", json.error ?? "Contact concierge with your order number");
        setStage("form");
        return;
      }
      clear();
      router.push(`/orders/${json.orderNumber}?success=1`);
    } catch {
      notify("Network error while confirming payment", "Your order is safe — check Track Order");
      setStage("form");
    }
  }

  /* ------------------------------ empty state ------------------------------ */

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 text-center">
        <Gem className="h-10 w-10 text-gold/50" />
        <h1 className="font-serif text-4xl font-light text-ivory">Your bag is empty</h1>
        <p className="max-w-sm text-sm text-greige">
          Add a piece or two before checking out — the atelier only ships what deserves a
          journey.
        </p>
        <Link
          href="/shop"
          className="mt-3 bg-gold px-9 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-ink hover:bg-goldlight"
        >
          Explore the Collection
        </Link>
      </div>
    );
  }

  const busy = stage === "processing" || stage === "verifying";

  return (
    <>
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
              Secure Checkout
            </p>
            <h1 className="mt-2 font-serif text-4xl font-light text-ivory md:text-5xl">
              Almost <span className="gold-text italic">yours</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-greige">
            <span className="border border-gold/40 px-3 py-1.5 text-goldlight">01 Details</span>
            <span className="text-gold/50">—</span>
            <span className="border border-gold/15 px-3 py-1.5">02 Payment</span>
            <span className="text-gold/50">—</span>
            <span className="border border-gold/15 px-3 py-1.5">03 Confirmation</span>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Form */}
        <Reveal delay={0.1}>
          <div className="space-y-9">
            <section>
              <h2 className="flex items-center gap-3 font-serif text-2xl font-light text-cream">
                <span className="font-sans text-[11px] tracking-[0.3em] text-gold">01</span>
                Contact
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name} className="sm:col-span-2">
                  <input
                    className="field"
                    placeholder="Aisha Kapoor"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input
                    className="field"
                    type="email"
                    placeholder="aisha@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input
                    className="field"
                    inputMode="tel"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    autoComplete="tel"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-3 font-serif text-2xl font-light text-cream">
                <span className="font-sans text-[11px] tracking-[0.3em] text-gold">02</span>
                Delivery address
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Street address" error={errors.address} className="sm:col-span-2">
                  <input
                    className="field"
                    placeholder="14, Rosewood Apartments, MG Road"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    autoComplete="street-address"
                  />
                </Field>
                <Field label="Landmark (optional)" className="sm:col-span-2">
                  <input
                    className="field"
                    placeholder="Opposite City Palace"
                    value={form.landmark}
                    onChange={(e) => set("landmark", e.target.value)}
                  />
                </Field>
                <Field label="City" error={errors.city}>
                  <input
                    className="field"
                    placeholder="Mumbai"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    autoComplete="address-level2"
                  />
                </Field>
                <Field label="State" error={errors.state}>
                  <select
                    className="field appearance-none"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                  >
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Pincode" error={errors.pincode}>
                  <input
                    className="field"
                    inputMode="numeric"
                    placeholder="400001"
                    value={form.pincode}
                    onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                    autoComplete="postal-code"
                  />
                </Field>
              </div>
              <p className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-greige">
                <Truck className="h-3.5 w-3.5 text-gold/70" />
                {serverConfig?.shiprocket
                  ? "Live fulfilment — your order will be created in Shiprocket on payment"
                  : "Fulfilment sandbox — set SHIPROCKET_EMAIL & SHIPROCKET_PASSWORD for live bookings"}
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-3 font-serif text-2xl font-light text-cream">
                <span className="font-sans text-[11px] tracking-[0.3em] text-gold">03</span>
                Payment
              </h2>
              <div className="mt-5 border border-gold/15 bg-umber/40 p-5">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-3 text-sm text-cream">
                    <CreditCard className="h-4.5 w-4.5 text-gold" />
                    {serverConfig?.razorpay
                      ? "Razorpay — UPI, cards, netbanking & wallets"
                      : "Demo gateway — Razorpay test experience"}
                  </p>
                  <span className="rounded-full border border-gold/25 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-gold/90">
                    {serverConfig?.razorpay ? "Live" : "Demo mode"}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-greige">
                  {serverConfig?.razorpay
                    ? "You will complete payment in Razorpay's secure window. Your order is confirmed and booked on Shiprocket the instant it succeeds."
                    : "No real money moves in demo mode. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to accept live payments — the flow stays identical."}
                </p>
              </div>

              <button
                onClick={handlePay}
                disabled={busy}
                className="mt-6 flex w-full items-center justify-center gap-3 bg-gold py-5 text-[13px] font-semibold uppercase tracking-[0.26em] text-ink transition-colors hover:bg-goldlight disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    {stage === "verifying" ? "Confirming payment…" : "Opening secure gateway…"}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Pay {formatINR(total)} securely
                  </>
                )}
              </button>
              <div className="mt-4 flex items-center justify-center gap-6 text-[10px] uppercase tracking-[0.18em] text-greige/70">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> 256-bit encrypted
                </span>
                <span>UPI</span>
                <span>Cards</span>
                <span>NetBanking</span>
                <span>Wallets</span>
              </div>
            </section>
          </div>
        </Reveal>

        {/* Summary */}
        <Reveal delay={0.2}>
          <aside className="h-fit border border-gold/15 bg-coal/70 lg:sticky lg:top-28">
            <div className="border-b border-gold/12 px-6 py-5">
              <h2 className="font-serif text-xl text-cream">Order Summary</h2>
            </div>
            <ul className="max-h-[320px] space-y-5 overflow-y-auto px-6 py-6">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-umber">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    <span className="absolute right-0 top-0 bg-ink/80 px-1.5 py-0.5 text-[10px] text-goldlight">
                      ×{item.qty}
                    </span>
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2">
                    <p className="font-serif text-[16px] leading-snug text-cream">{item.name}</p>
                    <p className="whitespace-nowrap text-sm text-goldlight">
                      {formatINR(item.price * item.qty)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-2.5 border-t border-gold/12 px-6 py-5 text-sm">
              <div className="flex justify-between text-greige">
                <span>Subtotal</span>
                <span className="text-cream">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-greige">
                <span>Insured shipping</span>
                <span className={shipping === 0 ? "text-goldlight" : "text-cream"}>
                  {shipping === 0 ? "Complimentary" : formatINR(shipping)}
                </span>
              </div>
              <div className="gold-rule my-4" />
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.24em] text-greige">Total</span>
                <span className="font-serif text-2xl text-goldlight">{formatINR(total)}</span>
              </div>
            </div>
            <div className="border-t border-gold/12 px-6 py-4">
              <p className="flex items-center gap-2 text-[11px] leading-relaxed text-greige">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold/70" />
                Includes hallmark certificate, authenticity card & signature gift box.
              </p>
            </div>
          </aside>
        </Reveal>
      </div>

      <Reveal className="mt-10">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-greige transition-colors hover:text-goldlight"
        >
          <ChevronLeft className="h-4 w-4" /> Continue shopping
        </Link>
      </Reveal>

      {/* Demo gateway modal */}
      {pendingDemo && stage === "paying" && (
        <DemoPaymentModal
          amountPaise={pendingDemo.amountPaise}
          orderNumber={pendingDemo.orderNumber}
          onCancel={() => {
            setPendingDemo(null);
            setStage("form");
            notify("Demo payment cancelled", `Order ${pendingDemo.orderNumber} is saved as pending`);
          }}
          onSuccess={async () => {
            setStage("verifying");
            setPendingDemo(null);
            await verifyPayment({ orderNumber: pendingDemo.orderNumber, demo: true });
          }}
        />
      )}

      {/* Verifying overlay */}
      {stage === "verifying" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[115] flex flex-col items-center justify-center gap-5 bg-ink/95 backdrop-blur"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30"
          >
            <Gem className="h-6 w-6 text-gold" />
          </motion.div>
          <p className="font-serif text-2xl font-light text-cream">Confirming your payment</p>
          <p className="max-w-xs text-center text-xs leading-relaxed text-greige">
            Verifying the signature, confirming your order, and booking your insured
            Shiprocket shipment. Hold on.
          </p>
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-greige/60">
            <BadgeCheck className="h-3.5 w-3.5" /> Do not close this window
          </p>
        </motion.div>
      )}
    </>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-2 block text-[10.5px] font-medium uppercase tracking-[0.22em] text-greige">
        {label}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-[11px] text-red-400">{error}</span>}
    </label>
  );
}
