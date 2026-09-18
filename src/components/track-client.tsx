"use client";

import { motion } from "framer-motion";
import { Copy, PackageSearch, Search } from "lucide-react";
import { useState } from "react";
import { useCart } from "./providers";
import { TrackingTimeline } from "./tracking-timeline";

export function TrackClient({ initialRef }: { initialRef: string }) {
  const [value, setValue] = useState(initialRef);
  const [reference, setReference] = useState(initialRef.trim());
  const [meta, setMeta] = useState<{ awb: string | null; courier: string | null } | null>(null);
  const { notify } = useCart();

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const ref = value.trim();
    if (!ref) {
      notify("Enter an order number or AWB code", "e.g. AUR-K3X9Q21");
      return;
    }
    setReference(ref);
    setMeta(null);
  }

  return (
    <div>
      <form onSubmit={submit} className="mx-auto flex max-w-xl">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="AUR-XXXXXXX or AWB code"
          className="field h-14 !border-r-0 font-mono text-[15px] tracking-wider"
        />
        <button
          type="submit"
          className="flex h-14 shrink-0 items-center gap-2.5 border border-gold bg-gold px-7 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-goldlight"
        >
          <Search className="h-4 w-4" /> Track
        </button>
      </form>

      {reference && (
        <motion.div
          key={reference}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 border border-gold/15 bg-coal/70"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/12 px-6 py-4">
            <p className="flex items-center gap-3 text-sm text-cream">
              <PackageSearch className="h-4.5 w-4.5 text-gold" />
              Results for <span className="font-mono text-goldlight">{reference}</span>
            </p>
            {meta?.awb && (
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(meta.awb!);
                  notify("AWB code copied to clipboard");
                }}
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-greige transition-colors hover:text-goldlight"
              >
                <Copy className="h-3.5 w-3.5" /> Copy AWB
              </button>
            )}
          </div>
          <div className="px-6 py-6">
            <TrackingTimeline reference={reference} />
          </div>
        </motion.div>
      )}

      {!reference && (
        <p className="mt-12 text-center text-[11px] uppercase tracking-[0.26em] text-greige/60">
          Insured · Signature on delivery · 3–5 business days
        </p>
      )}
    </div>
  );
}
