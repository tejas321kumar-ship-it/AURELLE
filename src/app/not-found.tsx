import { Gem } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-5 text-center">
      <Gem className="h-10 w-10 text-gold/50" />
      <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
        Error 404
      </p>
      <h1 className="font-serif text-5xl font-light text-ivory md:text-6xl">
        This vault is <span className="gold-text italic">empty</span>
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-greige">
        The page you are looking for has either sold out or never existed. The collection,
        however, awaits.
      </p>
      <Link
        href="/shop"
        className="mt-3 bg-gold px-9 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-ink transition-colors hover:bg-goldlight"
      >
        Explore the Collection
      </Link>
    </div>
  );
}
