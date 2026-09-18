import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { eq } from "drizzle-orm";
import {
  Assurance,
  Bestsellers,
  Collections,
  Craft,
  Hero,
  Marquee,
  Testimonials,
} from "@/components/home-sections";
import type { ProductDTO } from "@/components/product-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function Home() {
  try {
    await ensureSeeded();
    const featured = await db.select().from(products).where(eq(products.featured, true)).limit(4);

    return (
      <>
        <Hero />
        <Marquee />
        <Collections />
        <Bestsellers products={featured.map(toDTO)} />
        <Craft />
        <Assurance />
        <Testimonials />
      </>
    );
  } catch (error) {
    console.error("[home] Error loading page:", error);
    throw error;
  }
}
