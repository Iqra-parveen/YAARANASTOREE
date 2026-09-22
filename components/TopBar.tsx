"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ShoppingCart, Menu, Heart } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import SideMenu from "@/components/SideMenu";

export default function TopBar({ title }: { title?: string }) {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="focus-gold text-bone/80 hover:text-bone"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <Link href="/home" className="font-display text-lg italic tracking-tight text-bone">
            {title ?? "YAARANA"}
          </Link>
        </div>
        <div className="flex items-center gap-3.5">
          <Link
            href="/wishlist"
            className="focus-gold relative text-bone/80 hover:text-gold transition-colors"
            aria-label="Wishlist"
          >
            <Heart size={20} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-bone">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/notifications"
            className="focus-gold text-bone/80 hover:text-gold transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={1.5} />
          </Link>
          <Link
            href="/cart"
            className="focus-gold relative text-bone/80 hover:text-gold transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-bone">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}