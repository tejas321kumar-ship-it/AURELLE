"use client";

import { Loader2, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./providers";

export function FulfillButton({ orderNumber }: { orderNumber: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { notify } = useCart();

  async function fulfill() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderNumber}/fulfill`, { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        notify(
          json.awb ? `AWB ${json.awb} assigned` : "Shipment booked — AWB pending",
          json.courier ?? "Shiprocket",
        );
      } else {
        notify("Fulfilment failed", json.error ?? "Try again");
      }
    } catch {
      notify("Network error", "Could not reach the fulfilment API");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <button
      onClick={fulfill}
      disabled={loading}
      className="flex items-center gap-2 border border-gold bg-gold/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-goldlight transition-colors hover:bg-gold hover:text-ink disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Truck className="h-3 w-3" />
      )}
      Ship via Shiprocket
    </button>
  );
}
