"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Gem,
  Quote,
  RotateCcw,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ProductCard, type ProductDTO } from "./product-card";
import { Reveal } from "./motion";

/* ---------------------------------- hero ---------------------------------- */

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "42%"]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -left-40 top-1/4 h-[560px] w-[560px] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #c9a05c 0%, transparent 65%)" }}
      />
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-20 pt-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pt-4">
        <motion.div style={{ y: textY }} className="relative z-10 py-10 lg:py-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-gold"
          >
            <span className="h-px w-10 bg-gold/60" />
            Maison de Joaillerie · Est. 1987
          </motion.p>

          <h1 className="mt-7 font-serif text-[15vw] font-light leading-[0.98] tracking-[0.01em] text-ivory sm:text-[64px] lg:text-[84px]">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              Wear the light
            </motion.span>
            <motion.span
              className="gold-text block italic"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              you carry.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="mt-7 max-w-md text-[15px] leading-relaxed text-greige"
          >
            BIS-hallmarked gold and certified diamonds, shaped by hand in our Jaipur
            atelier — then sealed, insured, and delivered to your door anywhere in India.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.68 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/shop"
              className="group flex items-center gap-3 bg-gold px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-ink transition-colors hover:bg-goldlight"
            >
              Shop the Collection
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#craft"
              className="border border-gold/30 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-goldlight transition-all hover:border-gold hover:bg-gold/10"
            >
              Discover the Craft
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-14 flex items-center gap-8 border-t border-gold/12 pt-7"
          >
            {[
              ["38", "Years of craft"],
              ["25k+", "Patrons adorned"],
              ["4.9", "Average rating"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-serif text-2xl text-goldlight">{value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-greige">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-3 border border-gold/25" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden bg-umber">
            <motion.div style={{ y: imageY }} className="absolute -inset-y-10 inset-x-0">
              <Image
                src="/images/hero.jpg"
                alt="Model wearing the Maharani Kundan Choker"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="absolute -bottom-6 -left-6 hidden items-center gap-4 border border-gold/20 bg-coal/95 px-5 py-4 backdrop-blur md:flex"
          >
            <Gem className="h-6 w-6 text-gold" />
            <div>
              <p className="font-serif text-[15px] text-cream">The Jaipur Atelier</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-greige">
                Hand-finished since 1987
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------- marquee --------------------------------- */

const MARQUEE_ITEMS = [
  "Handcrafted in Jaipur",
  "BIS Hallmarked Gold",
  "Lifetime Exchange Promise",
  "Certified Diamonds",
  "Insured via Shiprocket",
  "Secure Razorpay Checkout",
];

export function Marquee() {
  const row = (
    <div className="flex shrink-0 items-center">
      {MARQUEE_ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-8 font-serif text-lg font-light italic tracking-[0.08em] text-cream/85 md:text-xl">
            {item}
          </span>
          <Gem className="h-3.5 w-3.5 shrink-0 text-gold/70" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-y border-gold/12 bg-umber/50 py-5">
      <div className="flex w-max animate-marquee">
        {row}
        {row}
      </div>
    </div>
  );
}

/* -------------------------------- collections ------------------------------- */

const COLLECTIONS = [
  { name: "Necklaces", image: "/images/necklace-aurore.jpg", note: "Layers of first light" },
  { name: "Rings", image: "/images/ring-eternel.jpg", note: "Promises, set in stone" },
  { name: "Earrings", image: "/images/earrings-perle.jpg", note: "Movement, caught mid-sway" },
  { name: "Bracelets", image: "/images/bangle-heritage.jpg", note: "Heirlooms for the wrist" },
];

export function Collections() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
            The Atelier Edits
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light text-ivory md:text-5xl">
            Four ways to <span className="gold-text italic">begin</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <Link
            href="/shop"
            className="link-lux text-[12px] font-medium uppercase tracking-[0.24em] text-greige hover:text-goldlight"
          >
            View all pieces
          </Link>
        </Reveal>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {COLLECTIONS.map((collection, i) => (
          <Reveal key={collection.name} delay={i * 0.1}>
            <Link
              href={`/shop?category=${collection.name}`}
              className="group relative block h-[300px] overflow-hidden bg-umber md:h-[400px]"
            >
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent transition-opacity duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p className="text-[10px] uppercase tracking-[0.26em] text-gold/90 opacity-0 transition-all duration-500 group-hover:opacity-100">
                  {collection.note}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-light text-ivory md:text-[26px]">
                    {collection.name}
                  </h3>
                  <ArrowRight className="h-4 w-4 -translate-x-2 text-gold opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- bestsellers ------------------------------- */

export function Bestsellers({ products }: { products: ProductDTO[] }) {
  return (
    <section className="border-y border-gold/10 bg-coal/60">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
        <div className="text-center">
          <Reveal>
            <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
              Most Coveted
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light text-ivory md:text-5xl">
              The pieces our patrons <span className="gold-text italic">keep choosing</span>
            </h2>
          </Reveal>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.slug} product={product} index={i} />
          ))}
        </div>
        <Reveal className="mt-16 text-center" delay={0.2}>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 border border-gold/30 px-9 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-goldlight transition-all hover:border-gold hover:bg-gold hover:text-ink"
          >
            Browse the Full Collection <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------- craft ---------------------------------- */

export function Craft() {
  return (
    <section id="craft" className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative order-2 lg:order-1">
          <div className="absolute -inset-3 border border-gold/20" aria-hidden="true" />
          <div className="relative aspect-[4/3] overflow-hidden bg-umber">
            <Image
              src="/images/craft.jpg"
              alt="Master goldsmith setting a diamond by hand"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-[1.8s] ease-out hover:scale-105"
            />
          </div>
          <div className="absolute -bottom-7 -right-4 border border-gold/20 bg-coal px-6 py-4 md:-right-8">
            <p className="font-serif text-3xl text-goldlight">40 hrs</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-greige">
              Per hand-engraving
            </p>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
              Savoir-faire
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light leading-tight text-ivory md:text-5xl">
              Thirty-eight years.
              <br />
              One <span className="gold-text italic">atelier.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-lg text-[15px] leading-relaxed text-greige">
              Every AURELLE piece passes through eleven pairs of hands before it reaches
              yours — from the karigar who draws the gold wire, to the setter who places
              the final stone under 10x magnification. We measure our work in decades
              worn, not seasons sold.
            </p>
          </Reveal>
          <div className="mt-9 space-y-5">
            {[
              ["Hand-drawn 22k gold wire", "No casting shortcuts — filigree the slow way."],
              ["Hand-cut polki & kundan", "Set the way it has been done for four centuries."],
              ["Eleven-point inspection", "Each piece is weighed, hallmarked and certified."],
            ].map(([title, detail], i) => (
              <Reveal key={title} delay={0.2 + i * 0.1} className="flex gap-4">
                <span className="mt-1.5 h-px w-8 shrink-0 bg-gold/70" />
                <div>
                  <p className="font-serif text-lg text-cream">{title}</p>
                  <p className="mt-1 text-sm text-greige">{detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.5}>
            <Link
              href="/shop"
              className="link-lux mt-10 inline-block text-[12px] font-semibold uppercase tracking-[0.26em] text-goldlight"
            >
              Shop pieces made this way
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- assurance -------------------------------- */

const ASSURANCES = [
  {
    icon: CreditCard,
    title: "Razorpay Secure Checkout",
    detail: "UPI, cards, netbanking & wallets — 256-bit encrypted, nothing stored.",
  },
  {
    icon: Truck,
    title: "Shiprocket Insured Delivery",
    detail: "Every order booked with an AWB the moment your payment is confirmed.",
  },
  {
    icon: RotateCcw,
    title: "30-Day Easy Returns",
    detail: "Change your mind with a free reverse pickup from your doorstep.",
  },
  {
    icon: BadgeCheck,
    title: "BIS Hallmark Certified",
    detail: "Independently assayed purity, with a certificate in every box.",
  },
];

export function Assurance() {
  return (
    <section className="border-y border-gold/10 bg-umber/40">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:grid-cols-2 md:px-10 lg:grid-cols-4 lg:py-20">
        {ASSURANCES.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.1} className="flex flex-col items-start">
            <item.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
            <h3 className="mt-4 font-serif text-lg text-cream">{item.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-greige">{item.detail}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- testimonials ------------------------------- */

const TESTIMONIALS = [
  {
    quote:
      "The choker arrived in two days, tracked at every step. When the box opened, my mother cried — it was her mother's design, reborn.",
    name: "Ananya Sharma",
    city: "New Delhi",
  },
  {
    quote:
      "I compared five jewellers before proposing. AURELLE's solitaire had the most fire — and the checkout took less than a minute.",
    name: "Rohan Mehta",
    city: "Mumbai",
  },
  {
    quote:
      "Third purchase in a year. The engraving on my bangle is so fine my jeweller here in Chennai asked where it was made.",
    name: "Lakshmi Iyer",
    city: "Chennai",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
      <div className="text-center">
        <Reveal>
          <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
            From Our Patrons
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light text-ivory md:text-5xl">
            Worn, and <span className="gold-text italic">remembered</span>
          </h2>
        </Reveal>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.12}>
            <figure className="flex h-full flex-col border border-gold/12 bg-coal/70 p-8 transition-colors duration-500 hover:border-gold/30">
              <Quote className="h-5 w-5 text-gold/60" />
              <blockquote className="mt-5 flex-1 font-serif text-[19px] font-light leading-relaxed text-cream/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-7 border-t border-gold/10 pt-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3 w-3 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-2.5 text-sm font-medium tracking-wide text-ivory">{t.name}</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-greige">{t.city}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
