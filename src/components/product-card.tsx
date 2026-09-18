"use client";

import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/money";
import { useCart } from "./providers";

export type ProductDTO = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt: number | null;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
};

export function ProductCard({ product, index = 0 }: { product: ProductDTO; index?: number }) {
  const { add, notify } = useCart();

  function quickAdd() {
    add(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      1,
    );
    notify(`${product.name} added to your bag`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-umber">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-500 group-hover:border-gold/30" />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute left-3 top-3 bg-ink/80 px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.18em] text-goldlight backdrop-blur-sm">
            Only {product.stock} left
          </span>
        )}
        <button
          onClick={quickAdd}
          className="absolute inset-x-4 bottom-4 flex translate-y-14 items-center justify-center gap-2 bg-ink/85 py-3 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-goldlight opacity-0 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-gold hover:text-ink group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" /> Add to Bag
        </button>
      </div>
      <div className="mt-4 flex flex-col items-center text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-greige">{product.category}</p>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1.5 font-serif text-[19px] leading-tight text-cream transition-colors hover:text-goldlight"
        >
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.round(product.rating) ? "fill-gold text-gold" : "text-gold/25"
              }`}
            />
          ))}
          <span className="ml-1 text-[11px] text-greige">({product.reviews})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="text-[15px] font-medium tracking-wide text-gold">
            {formatINR(product.price)}
          </span>
          {product.compareAt && (
            <span className="text-[12px] text-greige/70 line-through">
              {formatINR(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
