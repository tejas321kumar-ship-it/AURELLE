import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { eq, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureSeeded();
  const { slug } = await params;
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (!product) {
    return Response.json({ error: "Piece not found" }, { status: 404 });
  }
  const related = await db
    .select()
    .from(products)
    .where(ne(products.slug, slug))
    .limit(8);
  return Response.json({ product, related });
}
