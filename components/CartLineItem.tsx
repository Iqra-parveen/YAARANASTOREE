"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "@/lib/types";

export default function CartLineItem({
  product,
  variant,
  quantity,
  compact = false,
}: {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  compact?: boolean;
}) {
  const { updateQty, removeItem } = useCart();
  const price = variant?.price_override ?? product.price;
  const variantId = variant?.id ?? null;

  return (
    <div className="flex gap-3">
      <div
        className={`relative shrink-0 overflow-hidden bg-charcoal ${
          compact ? "h-16 w-14" : "h-20 w-16"
        }`}
      >
        {product.image_url && (
          product.media_type === "video" ? (
            <video
              src={product.image_url}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          )
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-bone">{product.name}</p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeItem(product.id, variantId);
            }}
            className="focus-gold shrink-0 cursor-pointer text-bone/40"
            aria-label="Remove item"
          >
            <X size={16} />
          </button>
        </div>
        {(variant?.size || variant?.color) && (
          <p className="text-xs text-bone/50">
            {[variant?.size, variant?.color].filter(Boolean).join(" / ")}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3 border border-hairline px-2 py-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateQty(product.id, variantId, quantity - 1);
              }}
              className="focus-gold cursor-pointer text-bone/70"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-4 text-center text-sm text-bone">{quantity}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateQty(product.id, variantId, quantity + 1);
              }}
              className="focus-gold cursor-pointer text-bone/70"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="text-sm text-gold">{formatPrice(price * quantity)}</p>
        </div>
      </div>
    </div>
  );
}