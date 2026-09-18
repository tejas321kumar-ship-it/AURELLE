import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/product-detail";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (product) return { title: `${product.name} — AURELLE`, description: product.description };
  } catch {
    /* fall through */
  }
  return { title: "AURELLE — Fine Jewellery" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureSeeded();
  const { slug } = await params;
  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!product) notFound();

  const all = await db.select().from(products);
  const related = all
    .filter((p) => p.slug !== slug)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4);

  return <ProductDetail product={toDTO(product)} description={product.description} metal={product.metal} stone={product.stone} related={related.map(toDTO)} />;
}
