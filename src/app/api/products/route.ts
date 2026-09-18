import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSeeded();
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const featured = url.searchParams.get("featured") === "1";

  let rows = await db
    .select()
    .from(products)
    .orderBy(desc(products.featured), desc(products.rating), products.name);

  if (category && category !== "All") {
    rows = rows.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  if (featured) rows = rows.filter((p) => p.featured);

  return Response.json({ products: rows });
}
