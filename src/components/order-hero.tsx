"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function OrderHero({
  justPaid,
  orderNumber,
  email,
  paymentStatus,
}: {
  justPaid: boolean;
  orderNumber: string;
  email: string;
  paymentStatus: string;
}) {
  const paid = paymentStatus === "paid";
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.15 }}
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border ${
          paid ? "border-gold bg-gold/10" : "border-gold/25 bg-umber/50"
        }`}
      >
        {paid && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="absolute h-20 w-20 animate-ping rounded-full border border-gold/30"
          />
        )}
        <Check
          className={`h-9 w-9 ${paid ? "text-gold" : "text-greige"}`}
          strokeWidth={2.5}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7 }}
        className="mt-7 text-[11px] font-medium uppercase tracking-[0.34em] text-gold"
      >
        {justPaid
          ? "Payment received via Razorpay"
          : paid
            ? "Order confirmed"
            : "Awaiting payment"}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 font-serif text-4xl font-light text-ivory md:text-6xl"
      >
        {paid ? (
          <>
            It&rsquo;s <span className="gold-text italic">on its way.</span>
          </>
        ) : (
          "Almost there."
        )}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.8 }}
        className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-greige"
      >
        {paid ? (
          <>
            Order <span className="font-mono text-goldlight">{orderNumber}</span> is confirmed and
            booked with Shiprocket. A copy has been sent to{" "}
            <span className="text-cream">{email}</span>.
          </>
        ) : (
          <>
            Order <span className="font-mono text-goldlight">{orderNumber}</span> is reserved.
            Complete the payment at checkout to begin its journey.
          </>
        )}
      </motion.p>
    </div>
  );
}
