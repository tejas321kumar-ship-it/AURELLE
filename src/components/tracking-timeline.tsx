"use client";

import { motion } from "framer-motion";
import { Loader2, RefreshCcw, Satellite } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/money";

export type TrackingStep = {
  title: string;
  detail: string;
  location: string | null;
  at: string;
  state: "done" | "current" | "upcoming";
};

export type TrackingResponse = {
  orderNumber: string;
  city: string;
  state: string;
  awb: string | null;
  courier: string | null;
  status: string;
  expectedDate: string | null;
  live: boolean;
  steps: TrackingStep[];
  error?: string;
};

export function TrackingTimeline({ reference }: { reference: string }) {
  const [data, setData] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(reference)}`);
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "Could not load tracking.");
      else setData(json as TrackingResponse);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center gap-3 py-6 text-sm text-greige">
        <Loader2 className="h-4 w-4 animate-spin text-gold" /> Fetching the latest from the
        courier network…
      </div>
    );
  }
  if (error) {
    return <p className="py-4 text-sm text-red-400">{error}</p>;
  }
  if (!data) return null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-2 border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] ${
              data.live
                ? "border-gold/50 bg-gold/10 text-goldlight"
                : "border-gold/20 text-greige"
            }`}
          >
            <Satellite className="h-3 w-3" />
            {data.live ? "Live from Shiprocket" : "Projected timeline"}
          </span>
          <span className="text-sm text-greige">
            Current status: <span className="font-medium text-goldlight">{data.status}</span>
          </span>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-greige transition-colors hover:text-goldlight"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <ol className="relative space-y-0">
        {data.steps.map((step, i) => (
          <motion.li
            key={`${step.title}-${i}`}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="relative flex gap-5 pb-8 last:pb-0"
          >
            {i < data.steps.length - 1 && (
              <span
                className={`absolute left-[7px] top-5 h-full w-px ${
                  step.state !== "upcoming" ? "bg-gold/50" : "bg-gold/15"
                }`}
                aria-hidden="true"
              />
            )}
            <span className="relative mt-1 flex h-[15px] w-[15px] shrink-0 items-center justify-center">
              {step.state === "current" && (
                <span className="absolute h-full w-full animate-ping rounded-full bg-gold/50" />
              )}
              <span
                className={`h-[15px] w-[15px] rounded-full border-2 ${
                  step.state === "done"
                    ? "border-gold bg-gold"
                    : step.state === "current"
                      ? "border-gold bg-ink"
                      : "border-gold/25 bg-ink"
                }`}
              />
            </span>
            <div className={`min-w-0 flex-1 ${step.state === "upcoming" ? "opacity-45" : ""}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p
                  className={`font-serif text-lg ${
                    step.state === "current" ? "text-goldlight" : "text-cream"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-greige/80">{formatDate(step.at)}</p>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-greige">
                {step.detail}
                {step.location ? ` · ${step.location}` : ""}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
