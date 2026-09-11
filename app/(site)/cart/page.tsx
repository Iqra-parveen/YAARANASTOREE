"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/context/cart-context";
import { createClient } from "@/lib/supabase/client";
import CartLineItem from "@/components/CartLineItem";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { lines, subtotal } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<{
    valid: boolean;
    message: string;
    discount_amount: number | null;
    promo_id: string | null;
  } | null>(null);
  const [checking, setChecking] = useState(false);

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setChecking(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("validate_promo_code", {
      p_code: promoInput.trim(),
      p_order_amount: subtotal,
    });
    setChecking(false);
    if (error || !data || data.length === 0) {
      setPromoResult({ valid: false, message: "Could not validate code", discount_amount: null, promo_id: null });
      return;
    }
    setPromoResult(data[0]);
  }

  const discount = promoResult?.valid ? promoResult.discount_amount ?? 0 : 0;
  const total = Math.max(subtotal - discount, 0);

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur">
        <h1 className="text-sm tracking-wide text-bone">Your Cart</h1>
      </header>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
          <p className="text-sm text-bone/60">Your cart is empty.</p>
          <Link href="/shop" className="text-sm text-gold">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <div className="flex flex-col gap-4">
            {lines.map((line) => (
              <CartLineItem
                key={`${line.product.id}-${line.variant?.id ?? "base"}`}
                product={line.product}
                variant={line.variant}
                quantity={line.quantity}
              />
            ))}
          </div>

          <div className="mt-6 border-t border-hairline pt-4">
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Promo code"
                className="focus-gold flex-1 rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone placeholder:text-bone/40"
              />
              <button
                onClick={applyPromo}
                disabled={checking}
                className="focus-gold rounded-sm border border-gold px-4 text-sm text-gold disabled:opacity-40"
              >
                {checking ? "..." : "Apply"}
              </button>
            </div>
            {promoResult && (
              <p className={`mt-2 text-xs ${promoResult.valid ? "text-gold" : "text-rust"}`}>
                {promoResult.message}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
            <div className="flex justify-between text-bone/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gold">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-base text-bone">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={{
                pathname: "/checkout",
                query: promoResult?.valid
                  ? { promo: promoInput, promoId: promoResult.promo_id ?? "" }
                  : {},
              }}
            >
              <Button>Proceed to checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
