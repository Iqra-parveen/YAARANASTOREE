"use client";

import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import TopBar from "@/components/TopBar";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { useWishlist } from "@/lib/context/wishlist-context";

export default function WishlistPage() {
  const { items, clear } = useWishlist();

  return (
    <div>
      <TopBar title="Wishlist" />
      <div className="px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl italic text-bone">Saved Items</h1>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="focus-gold text-xs text-bone/50 hover:text-rust underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-charcoal text-gold">
              <Heart size={28} strokeWidth={1.5} />
            </div>
            <h2 className="mt-4 font-display text-lg italic text-bone">Your wishlist is empty</h2>
            <p className="mt-2 max-w-xs text-xs text-bone/60">
              Save items you love by tapping the heart icon on any product, and find them all here.
            </p>
            <Link
              href="/shop"
              className="focus-gold mt-6 inline-flex items-center gap-2 rounded-sm bg-gold px-5 py-2.5 text-xs font-medium text-bone hover:bg-gold-dim transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4">
            {items.map((product, i) => (
              <Reveal key={product.id} delay={(i % 6) * 0.05}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
