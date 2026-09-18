"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Gem, Menu, PackageSearch, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "./providers";

const NAV_LINKS = [
  { label: "Shop All", href: "/shop" },
  { label: "Necklaces", href: "/shop?category=Necklaces" },
  { label: "Rings", href: "/shop?category=Rings" },
  { label: "Earrings", href: "/shop?category=Earrings" },
  { label: "Bracelets", href: "/shop?category=Bracelets" },
];

export function AnnouncementBar() {
  return (
    <div className="bg-umber/90 py-2 text-center">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.28em] text-greige">
        Insured shipping across India · Complimentary above ₹5,000 · BIS Hallmarked
      </p>
    </div>
  );
}

export function Navbar() {
  const { count, hydrated, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-[80] transition-all duration-500 ${
          scrolled
            ? "border-b border-gold/12 bg-ink/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-10">
          <Link href="/" className="group flex items-center gap-2.5">
            <Gem className="h-4 w-4 text-gold transition-transform duration-700 group-hover:rotate-180" />
            <span className="font-serif text-[22px] font-medium tracking-[0.32em] text-ivory">
              AURELLE
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-lux text-[12px] font-medium uppercase tracking-[0.22em] text-cream/80 transition-colors hover:text-goldlight"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/track"
              aria-label="Track your order"
              className="flex h-10 w-10 items-center justify-center text-cream/80 transition-colors hover:text-goldlight"
            >
              <PackageSearch className="h-[18px] w-[18px]" />
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open shopping bag"
              className="relative flex h-10 w-10 items-center justify-center text-cream/80 transition-colors hover:text-goldlight"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {hydrated && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-ink">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center text-cream/80 transition-colors hover:text-goldlight lg:hidden"
            >
              <Menu className="h-[19px] w-[19px]" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col bg-ink/97 backdrop-blur-lg"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-serif text-xl tracking-[0.32em] text-ivory">AURELLE</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center text-cream/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col items-center justify-center gap-7">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.5 }}
                >
                  <Link
                    href={link.href}
                    className="font-serif text-3xl font-light tracking-[0.12em] text-cream hover:text-goldlight"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <Link
                  href="/track"
                  className="mt-4 text-[12px] uppercase tracking-[0.3em] text-greige hover:text-gold"
                >
                  Track your order
                </Link>
              </motion.div>
            </nav>
            <p className="pb-8 text-center text-[10px] uppercase tracking-[0.3em] text-greige/60">
              Fine jewellery · Est. 1987
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  function onSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer className="border-t border-gold/12 bg-coal">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.4fr] md:px-10 md:py-20">
        <div>
          <div className="flex items-center gap-2.5">
            <Gem className="h-4 w-4 text-gold" />
            <span className="font-serif text-xl tracking-[0.32em] text-ivory">AURELLE</span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-greige">
            Handcrafted fine jewellery from our Jaipur atelier since 1987. Every piece is
            BIS hallmarked, insured in transit, and made to be inherited.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="border border-gold/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-gold/90">
              Payments by Razorpay
            </span>
            <span className="border border-gold/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-gold/90">
              Delivery by Shiprocket
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            Collections
          </h4>
          <ul className="mt-5 space-y-3 text-sm text-greige">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-goldlight">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            Care
          </h4>
          <ul className="mt-5 space-y-3 text-sm text-greige">
            <li>
              <Link href="/track" className="transition-colors hover:text-goldlight">
                Track your order
              </Link>
            </li>
            <li>
              <Link href="/admin" className="transition-colors hover:text-goldlight">
                Atelier dashboard
              </Link>
            </li>
            <li className="text-greige/70">Lifetime exchange</li>
            <li className="text-greige/70">30-day easy returns</li>
            <li className="text-greige/70">Free insured shipping</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            The Aurelle Letter
          </h4>
          <p className="mt-5 text-sm leading-relaxed text-greige">
            New pieces, private previews, and atelier stories — once a month, never more.
          </p>
          {subscribed ? (
            <p className="mt-5 border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-goldlight">
              Welcome to the maison. Your first letter arrives soon.
            </p>
          ) : (
            <form onSubmit={onSubscribe} className="mt-5 flex">
              <input
                type="email"
                required
                placeholder="Your email address"
                className="field !border-r-0"
              />
              <button
                type="submit"
                className="shrink-0 border border-gold bg-gold px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-goldlight"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-gold/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-5 py-6 text-[10.5px] uppercase tracking-[0.24em] text-greige/60 md:flex-row md:px-10">
          <p>© 2026 Aurelle Jewels Pvt. Ltd. · All rights reserved</p>
          <p>Jaipur · Mumbai · New Delhi</p>
        </div>
      </div>
    </footer>
  );
}
