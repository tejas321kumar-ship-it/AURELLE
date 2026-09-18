"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Gem, Minus, Plus, ShieldCheck, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/money";
import { useCart } from "./providers";

const FREE_THRESHOLD = 5000;

export function CartDrawer() {
  const { items, subtotal, isOpen, setOpen, setQty, remove, count } = useCart();

  const remaining = Math.max(FREE_THRESHOLD - subtotal, 0);
  const progress = Math.min((subtotal / FREE_THRESHOLD) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[100] bg-ink/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed right-0 top-0 z-[105] flex h-full w-full max-w-md flex-col border-l border-gold/15 bg-coal"
          >
            <div className="flex items-center justify-between border-b border-gold/12 px-6 py-5">
              <h2 className="font-serif text-xl tracking-[0.08em] text-ivory">
                Your Bag{" "}
                <span className="text-sm text-greige">({count} {count === 1 ? "piece" : "pieces"})</span>
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close bag"
                className="flex h-9 w-9 items-center justify-center text-greige transition-colors hover:text-goldlight"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <Gem className="h-9 w-9 text-gold/50" />
                <p className="font-serif text-2xl font-light text-cream">Your bag is empty</p>
                <p className="max-w-[240px] text-sm leading-relaxed text-greige">
                  Fill it with pieces that were made to outlive trends — and us.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="mt-2 border border-gold px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold transition-all hover:bg-gold hover:text-ink"
                >
                  Explore the Collection
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-gold/10 px-6 py-4">
                  {remaining > 0 ? (
                    <p className="text-xs text-greige">
                      <span className="text-goldlight">{formatINR(remaining)}</span> away from
                      complimentary insured shipping
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-xs text-goldlight">
                      <Truck className="h-3.5 w-3.5" /> Complimentary insured shipping unlocked
                    </p>
                  )}
                  <div className="mt-2.5 h-[3px] w-full overflow-hidden bg-umber">
                    <motion.div
                      className="h-full bg-gold"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <ul className="space-y-6">
                    {items.map((item) => (
                      <motion.li
                        key={item.slug}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-4"
                      >
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="relative h-24 w-20 shrink-0 overflow-hidden bg-umber"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={() => setOpen(false)}
                              className="font-serif text-[17px] leading-tight text-cream hover:text-goldlight"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => remove(item.slug)}
                              aria-label={`Remove ${item.name}`}
                              className="text-greige/60 transition-colors hover:text-ivory"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gold">{formatINR(item.price)}</p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center border border-gold/20">
                              <button
                                onClick={() => setQty(item.slug, item.qty - 1)}
                                aria-label="Decrease quantity"
                                className="flex h-7 w-7 items-center justify-center text-greige hover:text-goldlight"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-xs text-cream">{item.qty}</span>
                              <button
                                onClick={() => setQty(item.slug, item.qty + 1)}
                                aria-label="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center text-greige hover:text-goldlight"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-sm text-cream/90">
                              {formatINR(item.price * item.qty)}
                            </p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gold/12 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-greige">
                      Subtotal
                    </span>
                    <span className="font-serif text-xl text-goldlight">{formatINR(subtotal)}</span>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-greige/70">
                    <ShieldCheck className="h-3.5 w-3.5" /> Fully insured · shipped via Shiprocket
                  </p>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="mt-4 block bg-gold py-4 text-center text-[12px] font-semibold uppercase tracking-[0.26em] text-ink transition-colors hover:bg-goldlight"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-3 w-full text-center text-[11px] uppercase tracking-[0.24em] text-greige transition-colors hover:text-goldlight"
                  >
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
