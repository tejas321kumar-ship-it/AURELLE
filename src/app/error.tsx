"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Suppress error logging in production
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-4xl font-light text-ivory">
          Something went <span className="gold-text italic">wrong</span>
        </h1>
        <p className="mt-4 text-sm text-greige">
          We encountered an unexpected error. Please try refreshing the page or contact support.
        </p>
        <button
          onClick={reset}
          className="mt-8 border border-gold bg-gold/5 px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/10"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
