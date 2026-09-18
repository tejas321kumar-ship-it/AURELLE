import { Reveal } from "@/components/motion";
import { TrackClient } from "@/components/track-client";

export const metadata = { title: "Track Your Order — AURELLE" };

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return (
    <div className="mx-auto max-w-[860px] px-5 py-16 md:px-10 md:py-24">
      <Reveal className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
          Shipment Tracking
        </p>
        <h1 className="mt-3 font-serif text-5xl font-light text-ivory md:text-6xl">
          Where is my <span className="gold-text italic">treasure?</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-greige">
          Enter your order number (AUR-…) or the AWB code from your confirmation. We query
          the Shiprocket network directly for live scans.
        </p>
      </Reveal>
      <div className="mt-10">
        <TrackClient initialRef={ref ?? ""} />
      </div>
    </div>
  );
}
