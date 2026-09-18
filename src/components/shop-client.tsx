"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductCard, type ProductDTO } from "./product-card";

const CATEGORIES = ["All", "Necklaces", "Rings", "Earrings", "Bracelets"];
const SORTS = [
  { value: "curated", label: "Curated" },
  { value: "price-asc", label: "Price · Low to High" },
  { value: "price-desc", label: "Price · High to Low" },
  { value: "rating", label: "Most Loved" },
] as const;

export function ShopClient({
  products,
  initialCategory,
}: {
  products: ProductDTO[];
  initialCategory: string;
}) {
  const [category, setCategory] = useState(CATEGORIES.includes(initialCategory) ? initialCategory : "All");
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("curated");
  const router = useRouter();

  useEffect(() => {
    setCategory(CATEGORIES.includes(initialCategory) ? initialCategory : "All");
  }, [initialCategory]);

  const visible = useMemo(() => {
    const filtered =
      category === "All" ? products : products.filter((p) => p.category === category);
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [products, category, sort]);

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-5 border-y border-gold/12 py-5">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                router.replace(c === "All" ? "/shop" : `/shop?category=${c}`, {
                  scroll: false,
                });
              }}
              className={`border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                category === c
                  ? "border-gold bg-gold text-ink"
                  : "border-gold/20 text-greige hover:border-gold/50 hover:text-goldlight"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-greige">
            {visible.length} {visible.length === 1 ? "piece" : "pieces"}
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="border border-gold/20 bg-ink px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-cream focus:border-gold focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((product, i) => (
          <ProductCard key={product.slug} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
