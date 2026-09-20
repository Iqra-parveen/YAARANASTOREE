"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Product } from "@/lib/types";
import { formatPrice, isOnSale } from "@/lib/utils";

function StackCard({
  product,
  index,
  total,
}: {
  product: Product;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const targetScale = 1 - (total - 1 - index) * 0.05;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div ref={ref} className="sticky" style={{ top: `${80 + index * 16}px` }}>
      <motion.div
        style={{ scale }}
        className="origin-top overflow-hidden rounded-[32px] border-2 border-ink/20 bg-bone p-4 backdrop-blur-sm sm:rounded-[40px]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-4xl font-black leading-none text-ink/10">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 text-center">
            {product.categories?.name && (
              <p className="text-xs uppercase tracking-wide text-gold-dim">{product.categories.name}</p>
            )}
            <p className="font-display text-lg italic text-ink">{product.name}</p>
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="focus-gold shrink-0 rounded-full border-2 border-ink/30 px-4 py-2 text-[10px] uppercase tracking-widest text-ink/70 transition-colors hover:bg-ink/10"
          >
            View
          </Link>
        </div>

        <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-ink/10 sm:rounded-[28px]">
          {product.image_url &&
            (product.media_type === "video" ? (
              <video
                src={product.image_url}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            ))}
        </div>

        <p className="mt-3 text-center">
          {isOnSale(product) ? (
            <span className="flex items-baseline justify-center gap-2">
              <span className="text-xs text-ink/30 line-through">
                {formatPrice(product.compare_at_price as number)}
              </span>
              <span className="text-rust">{formatPrice(product.price)}</span>
            </span>
          ) : (
            <span className="text-gold">{formatPrice(product.price)}</span>
          )}
        </p>
      </motion.div>
    </div>
  );
}

export default function FeaturedStackSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="-mt-10 rounded-t-[40px] bg-bone px-5 py-20 sm:-mt-12 sm:rounded-t-[50px]">
      <h2 className="text-gradient-ondark mb-10 text-center font-display text-[12vw] font-black uppercase leading-none tracking-tight sm:text-[9vw] md:text-6xl">
        Featured
      </h2>
      <div className="relative flex flex-col gap-8">
        {products.map((p, i) => (
          <StackCard key={p.id} product={p} index={i} total={products.length} />
        ))}
      </div>
    </section>
  );
}