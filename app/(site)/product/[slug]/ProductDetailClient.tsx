"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCart } from "@/lib/context/cart-context";
import Button from "@/components/ui/Button";
import { formatPrice, cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/lib/types";

export default function ProductDetailClient({
  product,
  variants,
}: {
  product: Product;
  variants: ProductVariant[];
}) {
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[],
    [variants]
  );
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[],
    [variants]
  );
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const { addItem } = useCart();

  const selectedVariant =
    variants.find((v) => (!sizes.length || v.size === size) && (!colors.length || v.color === color)) ??
    null;

  const inStock = variants.length > 0 ? (selectedVariant?.stock ?? 0) > 0 : product.quantity > 0;
  const price = selectedVariant?.price_override ?? product.price;

  function handleAdd() {
    addItem(product, selectedVariant, 1);
    // Drawer opens automatically via CartProvider — user stays on this page.
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-[4/5] w-full bg-charcoal"
      >
        {product.image_url ? (
          product.media_type === "video" ? (
            <video
              src={product.image_url}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-gold-dim">
            <span className="font-display text-2xl italic">YAARANA</span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="px-4 pt-5"
      >
        {product.categories?.name && (
          <p className="text-xs text-gold-dim">{product.categories.name}</p>
        )}
        <h1 className="mt-1 font-display text-2xl text-bone">{product.name}</h1>
        <p className="mt-1 text-lg text-gold">{formatPrice(price)}</p>

        {sizes.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs text-bone/60">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "focus-gold min-w-11 rounded-sm border px-3 py-2 text-sm transition-colors",
                    size === s ? "border-gold text-gold" : "border-hairline text-bone/70"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-bone/60">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "focus-gold rounded-sm border px-3 py-2 text-sm transition-colors",
                    color === c ? "border-gold text-gold" : "border-hairline text-bone/70"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.description && (
          <div className="mt-6 border-t border-hairline pt-4">
            <p className="mb-1 text-xs text-bone/60">Description</p>
            <p className="text-sm leading-relaxed text-bone/80">{product.description}</p>
          </div>
        )}
      </motion.div>

      <div className="sticky bottom-16 mt-6 border-t border-hairline bg-ink px-4 py-3">
        {inStock ? (
          <Button onClick={handleAdd}>Add to cart</Button>
        ) : (
          <Button disabled>Sold out</Button>
        )}
      </div>
    </div>
  );
}