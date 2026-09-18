"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, CreditCard, Gem, Landmark, Loader2, Lock, Smartphone, Wallet, X } from "lucide-react";
import { useState } from "react";
import { formatINR } from "@/lib/money";

const METHODS = [
  { icon: Smartphone, label: "UPI" },
  { icon: CreditCard, label: "Card" },
  { icon: Landmark, label: "NetBanking" },
  { icon: Wallet, label: "Wallet" },
];

const STAGES = [
  "Contacting issuing bank…",
  "Verifying secure OTP…",
  "Capturing payment…",
];

export function DemoPaymentModal({
  amountPaise,
  orderNumber,
  onSuccess,
  onCancel,
}: {
  amountPaise: number;
  orderNumber: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [method, setMethod] = useState(1);
  const [payStage, setPayStage] = useState<number | null>(null); // null = idle

  function startPayment() {
    setPayStage(0);
    let stage = 0;
    const advance = () => {
      stage += 1;
      if (stage < STAGES.length) {
        setPayStage(stage);
        window.setTimeout(advance, 850);
      } else {
        window.setTimeout(() => setPayStage(STAGES.length), 700); // success frame
        window.setTimeout(onSuccess, 1500);
      }
    };
    window.setTimeout(advance, 850);
  }

  const paying = payStage !== null;
  const succeeded = payStage !== null && payStage >= STAGES.length;
  const amount = amountPaise / 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md overflow-hidden border border-gold/25 bg-coal shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
        >
          {/* header — styled like a branded gateway sheet */}
          <div className="flex items-center justify-between border-b border-gold/15 bg-umber/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40">
                <Gem className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-ivory">AURELLE Fine Jewellery</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-greige">
                  Razorpay Secure · Order {orderNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={paying}
              aria-label="Cancel payment"
              className="text-greige transition-colors hover:text-ivory disabled:opacity-30"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[10.5px] uppercase tracking-[0.24em] text-greige">Amount payable</span>
              <span className="font-serif text-3xl text-goldlight">{formatINR(amount)}</span>
            </div>

            <AnimatePresence mode="wait">
              {succeeded ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-9"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gold"
                  >
                    <Check className="h-7 w-7 text-ink" strokeWidth={3} />
                  </motion.span>
                  <p className="font-serif text-xl text-cream">Payment authorized</p>
                  <p className="text-xs text-greige">Confirming your order…</p>
                </motion.div>
              ) : paying ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 py-10"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />
                  <p className="text-sm text-cream">{STAGES[payStage ?? 0]}</p>
                  <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-greige">
                    <Lock className="h-3 w-3" /> Do not press back or refresh
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* method picker */}
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {METHODS.map((m, i) => (
                      <button
                        key={m.label}
                        onClick={() => setMethod(i)}
                        className={`flex flex-col items-center gap-1.5 border py-3 text-[9px] font-medium uppercase tracking-[0.14em] transition-all ${
                          method === i
                            ? "border-gold bg-gold/10 text-goldlight"
                            : "border-gold/15 text-greige hover:border-gold/40"
                        }`}
                      >
                        <m.icon className="h-4 w-4" />
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* pre-filled demo card */}
                  <div className="mt-4 space-y-2.5">
                    <div className="field flex items-center justify-between text-greige">
                      <span className="tracking-[0.18em]">4111 ···· ···· 1111</span>
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="field text-greige">12 / 28</div>
                      <div className="field tracking-[0.3em] text-greige">···</div>
                    </div>
                  </div>

                  <p className="mt-3 text-[10.5px] leading-relaxed text-greige/70">
                    Demonstration gateway — no real money moves. Configure{" "}
                    <span className="text-gold/90">RAZORPAY_KEY_ID</span> &{" "}
                    <span className="text-gold/90">RAZORPAY_KEY_SECRET</span> to accept live
                    payments.
                  </p>

                  <button
                    onClick={startPayment}
                    className="mt-4 flex w-full items-center justify-center gap-2.5 bg-gold py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-ink transition-colors hover:bg-goldlight"
                  >
                    <Lock className="h-3.5 w-3.5" /> Pay {formatINR(amount)}
                  </button>
                  <button
                    onClick={onCancel}
                    className="mt-2.5 w-full text-center text-[11px] uppercase tracking-[0.2em] text-greige transition-colors hover:text-ivory"
                  >
                    Cancel payment
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-gold/12 bg-umber/40 px-6 py-3">
            <p className="text-center text-[9.5px] uppercase tracking-[0.22em] text-greige/60">
              256-bit TLS · PCI DSS Level 1 · Powered by Razorpay
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
