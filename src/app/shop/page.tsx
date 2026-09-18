import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { desc } from "drizzle-orm";
import { Reveal } from "@/components/motion";
import { ShopClient } from "@/components/shop-client";
import type { ProductDTO } from "@/components/product-card";

export const dynamic = "force-dynamic";

function toDTO(p: typeof products.$inferSelect): ProductDTO {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    compareAt: p.compareAt,
    image: p.image,
    rating: Number(p.rating),
    reviews: p.reviews,
    stock: p.stock,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await ensureSeeded();
  const { category } = await searchParams;
  const rows = await db.select().from(products).orderBy(desc(products.featured), desc(products.rating));

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
      <Reveal className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
          The Collection
        </p>
        <h1 className="mt-3 font-serif text-5xl font-light text-ivory md:text-6xl">
          Every <span className="gold-text italic">piece</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-greige">
          Each piece is one of a small, numbered run from the Jaipur atelier. When a run
          sells out, the design is retired forever.
        </p>
      </Reveal>
      <ShopClient products={rows.map(toDTO)} initialCategory={category ?? "All"} />
    </div>
  );
}
