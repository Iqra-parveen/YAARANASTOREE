"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/context/cart-context";
import { useAuth } from "@/lib/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const promoId = searchParams.get("promoId") || null;
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"jazzcash" | "easypaisa">("jazzcash");

  function redirectToGateway(actionUrl: string, fields: Record<string, string>) {
    const gatewayForm = document.createElement("form");
    gatewayForm.method = "POST";
    gatewayForm.action = actionUrl;
    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      gatewayForm.appendChild(input);
    });
    document.body.appendChild(gatewayForm);
    gatewayForm.submit();
  }

  const total = Math.max(subtotal - discount, 0);
  const promoCode = searchParams.get("promo");

  useEffect(() => {
    if (!promoCode || subtotal === 0) return;
    const supabase = createClient();
    supabase
      .rpc("validate_promo_code", { p_code: promoCode, p_order_amount: subtotal })
      .then(({ data }) => {
        if (data && data[0]?.valid) setDiscount(data[0].discount_amount ?? 0);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoCode, subtotal]);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Please sign in to place an order.");
      return;
    }
    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal,
        discount_amount: discount,
        promo_code_id: promoId || null,
        total_amount: total,
        shipping_full_name: form.fullName,
        shipping_phone: form.phone,
        shipping_address_line1: form.line1,
        shipping_address_line2: form.line2 || null,
        shipping_city: form.city,
        shipping_state: form.state || null,
        shipping_postal_code: form.postalCode || null,
        shipping_country: form.country,
      })
      .select()
      .single();

    if (orderErr || !order) {
      setSubmitting(false);
      setError(orderErr?.message ?? "Could not place order. Please try again.");
      return;
    }

    const items = lines.map((l) => ({
      order_id: order.id,
      product_id: l.product.id,
      variant_id: l.variant?.id ?? null,
      product_name: l.product.name,
      variant_label: [l.variant?.size, l.variant?.color].filter(Boolean).join(" / ") || null,
      quantity: l.quantity,
      price: l.variant?.price_override ?? l.product.price,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(items);

    if (itemsErr) {
      setSubmitting(false);
      setError(itemsErr.message);
      return;
    }

    try {
      const res = await fetch(`/api/payments/${paymentMethod}/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment");

      clear();
      redirectToGateway(data.actionUrl, data.fields);
      // navigation happens via form submit; component unmounts here
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof Error
          ? `Order ${order.tracking_id} was created, but starting payment failed: ${err.message}. It's saved as pending — you can find it under My Orders.`
          : "Payment could not be started."
      );
    }
  }

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur">
        <h1 className="text-sm tracking-wide text-bone">Checkout</h1>
      </header>

      <form onSubmit={placeOrder} className="flex flex-col gap-4 px-4 pt-4">
        {!user && (
          <p className="rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold">
            You'll need to sign in before placing an order.
          </p>
        )}

        <Field label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <Field label="Address line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} required />
        <Field label="Address line 2 (optional)" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
          <Field label="State/Province" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Postal code" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} />
          <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} required />
        </div>

        <div className="mt-2">
          <span className="mb-2 block text-xs text-bone/60">Payment method</span>
          <div className="flex gap-3">
            {(["jazzcash", "easypaisa"] as const).map((m) => (
              <label
                key={m}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-sm border py-3 text-sm capitalize ${
                  paymentMethod === m ? "border-gold text-gold" : "border-hairline text-bone/60"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m}
                  checked={paymentMethod === m}
                  onChange={() => setPaymentMethod(m)}
                  className="sr-only"
                />
                {m === "jazzcash" ? "JazzCash" : "EasyPaisa"}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-bone/40">
            You'll be redirected to {paymentMethod === "jazzcash" ? "JazzCash" : "EasyPaisa"} to complete payment securely.
          </p>
        </div>

        <div className="mt-2 space-y-2 border-t border-hairline pt-4 text-sm">
          <div className="flex justify-between text-bone/70">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-base text-bone">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {error && <p className="text-xs text-rust">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Redirecting to payment..." : "Place order & pay"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-bone/60">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone"
      />
    </label>
  );
}
