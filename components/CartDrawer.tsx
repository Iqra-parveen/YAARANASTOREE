"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import CartLineItem from "@/components/CartLineItem";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { lines, subtotal, isDrawerOpen, justAdded, closeDrawer, dismissAddedBanner } = useCart();

  // Lock page scroll while the drawer is open.
  useEffect(() => {
    if (isDrawerOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isDrawerOpen]);

  // Auto-hide the "Added ✓" banner after a couple of seconds, without closing the drawer.
  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(dismissAddedBanner, 2200);
    return () => clearTimeout(t);
  }, [justAdded, dismissAddedBanner]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-bone/40"
            onClick={closeDrawer}
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[86%] max-w-[380px] flex-col bg-ink shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-hairline px-4 py-4">
              <h2 className="font-display text-lg italic text-bone">Your Cart</h2>
              <button onClick={closeDrawer} className="focus-gold text-bone/60" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            <AnimatePresence>
              {justAdded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 border-b border-hairline bg-gold/10 px-4 py-3 text-sm text-gold">
                    <CheckCircle2 size={16} />
                    Added to your cart
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {lines.length === 0 ? (
                <p className="pt-10 text-center text-sm text-bone/40">Your cart is empty.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {lines.map((line) => (
                    <CartLineItem
                      key={`${line.product.id}-${line.variant?.id ?? "base"}`}
                      product={line.product}
                      variant={line.variant}
                      quantity={line.quantity}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-hairline px-4 py-4">
                <div className="mb-3 flex justify-between text-sm">
                  <span className="text-bone/70">Subtotal</span>
                  <span className="text-gold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="/cart" onClick={closeDrawer}>
                    <Button>View Cart</Button>
                  </Link>
                  <Link href="/checkout" onClick={closeDrawer}>
                    <Button variant="secondary">Checkout</Button>
                  </Link>
                  <button
                    onClick={closeDrawer}
                    className="focus-gold py-2 text-center text-xs text-bone/50"
                  >
                    Continue shopping
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
