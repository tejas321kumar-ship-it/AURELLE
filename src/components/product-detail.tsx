"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  ChevronDown,
  Gem,
  Loader2,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/lib/money";
import { ProductCard, type ProductDTO } from "./product-card";
import { useCart } from "./providers";
import { Reveal } from "./motion";

type Serviceability = {
  serviceable: boolean;
  live: boolean;
  couriers: number;
  etaDays: string | null;
  etd: string | null;
};

function PincodeCheck() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Serviceability | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    setError(null);
    setResult(null);
    if (!/^\d{6}$/.test(pincode)) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/serviceability?pincode=${pincode}`);
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "Could not check this pincode.");
      else setResult(json as Serviceability);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-gold/15 bg-umber/40 p-5">
      <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-gold">
        <MapPin className="h-3.5 w-3.5" /> Delivery promise
      </p>
      <div className="mt-3.5 flex">
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && check()}
          inputMode="numeric"
          placeholder="Enter pincode"
          className="field !border-r-0"
        />
        <button
          onClick={check}
          disabled={loading}
          className="shrink-0 border border-gold bg-gold px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-goldlight disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
        </button>
      </div>
      {error && <p className="mt-2.5 text-xs text-red-400">{error}</p>}
      {result && (
        <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-goldlight">
          <Truck className="mt-0.5 h-4 w-4 shrink-0" />
          {result.serviceable ? (
            <span>
              Delivering to {pincode} in{" "}
              <span className="font-semibold">
                {result.etaDays ? `${result.etaDays} days` : "3–5 days"}
              </span>
              {result.live
                ? ` · ${result.couriers} courier ${result.couriers === 1 ? "partner" : "partners"} available on Shiprocket`
                : " · fulfilled via Shiprocket"}
              , fully insured.
            </span>
          ) : (
            <span>
              This pincode is currently unserviceable — write to concierge@aurelle.in and
              we will arrange it by hand.
            </span>
          )}
        </p>
      )}
    </div>
  );
}

function Accordion({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gold/12">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.22em] text-cream">
          <Icon className="h-4 w-4 text-gold" /> {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-greige transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm leading-relaxed text-greige">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductDetail({
  product,
  description,
  metal,
  stone,
  related,
}: {
  product: ProductDTO & { stock: number };
  description: string;
  metal: string;
  stone: string;
  related: ProductDTO[];
}) {
  const { add, notify } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<"main" | "detail">("main");
  const soldOut = product.stock <= 0;

  function addToBag() {
    add(
      { slug: product.slug, name: product.name, price: product.price, image: product.image },
      qty,
    );
    notify(`${product.name} added to your bag`);
  }

  function buyNow() {
    add(
      { slug: product.slug, name: product.name, price: product.price, image: product.image },
      qty,
    );
    router.push("/checkout");
  }

  const save = product.compareAt ? product.compareAt - product.price : 0;

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-10 md:py-16">
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[10.5px] uppercase tracking-[0.24em] text-greige"
      >
        <span>Maison</span> <span className="mx-2 text-gold/60">/</span>
        <span>{product.category}</span> <span className="mx-2 text-gold/60">/</span>
        <span className="text-cream">{product.name}</span>
      </motion.nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-umber">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={`object-cover transition-transform duration-[2s] ${
                  view === "detail" ? "scale-[1.75] object-[center_30%]" : ""
                }`}
              />
            </motion.div>
            {save > 0 && (
              <span className="absolute left-4 top-4 bg-gold px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink">
                Save {formatINR(save)}
              </span>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            {(["main", "detail"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`relative h-20 w-16 overflow-hidden border transition-all ${
                  view === v ? "border-gold" : "border-gold/15 opacity-50 hover:opacity-80"
                }`}
                aria-label={v === "main" ? "Full view" : "Detail view"}
              >
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="64px"
                  className={`object-cover ${v === "detail" ? "scale-[1.75] object-[center_30%]" : ""}`}
                />
              </button>
            ))}
            <div className="ml-2 hidden items-end pb-1 sm:flex">
              <p className="text-[10px] uppercase tracking-[0.22em] text-greige">
                Full view · Detail view
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold">
            {product.category}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-light leading-tight text-ivory md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? "fill-gold text-gold" : "text-gold/25"}`}
              />
            ))}
            <span className="text-xs text-greige">
              {product.rating.toFixed(1)} · {product.reviews} reviews
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="font-serif text-3xl text-goldlight">{formatINR(product.price)}</span>
            {product.compareAt && (
              <span className="text-lg text-greige/60 line-through">
                {formatINR(product.compareAt)}
              </span>
            )}
            <span className="text-[11px] uppercase tracking-[0.18em] text-greige">
              inclusive of all taxes
            </span>
          </div>

          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-greige">{description}</p>

          <div className="mt-7 space-y-2.5 border-y border-gold/12 py-5">
            {[
              ["Metal", metal],
              ["Stones", stone],
              ["Availability", soldOut ? "Sold out — retired design" : `${product.stock} pieces remaining`],
            ].map(([k, v]) => (
              <p key={k} className="flex gap-4 text-sm">
                <span className="w-28 shrink-0 text-[11px] uppercase tracking-[0.2em] text-greige">
                  {k}
                </span>
                <span className="text-cream/90">{v}</span>
              </p>
            ))}
          </div>

          <div className="mt-7 flex items-stretch gap-3">
            <div className="flex items-center border border-gold/25">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-full w-11 items-center justify-center text-greige hover:text-goldlight"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm text-cream">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
                className="flex h-full w-11 items-center justify-center text-greige hover:text-goldlight"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={addToBag}
              disabled={soldOut}
              className="flex-1 bg-gold py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-ink transition-colors hover:bg-goldlight disabled:cursor-not-allowed disabled:opacity-40"
            >
              {soldOut ? "Sold Out" : "Add to Bag"}
            </button>
            <button
              onClick={buyNow}
              disabled={soldOut}
              className="flex-1 border border-gold/40 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-goldlight transition-all hover:border-gold hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-6">
            <PincodeCheck />
          </div>

          <div className="mt-7">
            <Accordion title="Details & Certification" icon={Gem}>
              {metal}; {stone}. Every piece ships with its BIS hallmark certificate and an
              AURELLE authenticity card, signed by the master karigar who finished it.
            </Accordion>
            <Accordion title="Shipping via Shiprocket" icon={PackageCheck}>
              Orders are confirmed the instant your payment succeeds, booked on Shiprocket
              automatically, and assigned an AWB tracking number. Fully insured, signature
              on delivery, 3–5 business days across India.
            </Accordion>
            <Accordion title="Returns & Lifetime Exchange" icon={RotateCcw}>
              30-day easy returns with free reverse pickup. Lifetime exchange at 100% of
              the metal value and 90% of the stone value, at any AURELLE boutique or by
              courier.
            </Accordion>
            <Accordion title="Insurance & Authenticity" icon={ShieldCheck}>
              &nbsp;Every shipment is insured to full invoice value from our door to yours.
              If anything happens in transit, you are made whole — immediately.
            </Accordion>
          </div>

          <p className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-greige/70">
            <BadgeCheck className="h-4 w-4 text-gold/70" /> Secured by Razorpay · Delivered
            by Shiprocket
          </p>
        </motion.div>
      </div>

      {/* Related */}
      <div className="mt-28">
        <Reveal className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
            Continue Exploring
          </p>
          <h2 className="mt-3 font-serif text-3xl font-light text-ivory md:text-4xl">
            You may also <span className="gold-text italic">adore</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
