"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/context/cart-context";
import { useAuth } from "@/lib/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import CityCombobox from "@/components/CityCombobox";
import Tooltip from "@/components/Tooltip";
import { formatPrice } from "@/lib/utils";

const COD_FEE = 199;

type AddressForm = {
  country: string;
  firstName: string;
  lastName: string;
  city: string;
  line1: string;
  line2: string;
  postalCode: string;
};

const emptyAddress: AddressForm = {
  country: "Pakistan",
  firstName: "",
  lastName: "",
  city: "",
  line1: "",
  line2: "",
  postalCode: "",
};

// 1. Wrap the main page content inside a sub-component that consumes useSearchParams
function CheckoutContent() {
  const { lines, subtotal, clear } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const promoId = searchParams.get("promoId") || null;
  const promoCode = searchParams.get("promo");

  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contactEmail, setContactEmail] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [saveInfo, setSaveInfo] = useState(false);
  const [phone, setPhone] = useState("");

  const [shipping, setShipping] = useState<AddressForm>(emptyAddress);
  const [shippingMethod, setShippingMethod] = useState<"prepaid" | "cod">("prepaid");
  const [paymentGateway, setPaymentGateway] = useState<"jazzcash" | "easypaisa">("jazzcash");

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billing, setBilling] = useState<AddressForm>(emptyAddress);

  useEffect(() => {
    if (user?.email) setContactEmail((prev) => prev || user.email!);
  }, [user]);

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

  const shippingFee = shippingMethod === "cod" ? COD_FEE : 0;
  const total = Math.max(subtotal - discount, 0) + shippingFee;
  const effectivePaymentCategory = shippingMethod === "cod" ? "cod" : paymentGateway;

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

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!billingSameAsShipping && (!billing.firstName || !billing.line1 || !billing.city)) {
      setError("Please complete the billing address, or choose 'Same as shipping address'.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        subtotal,
        discount_amount: discount,
        shipping_fee: shippingFee,
        promo_code_id: promoId || null,
        total_amount: total,
        status: shippingMethod === "cod" ? "confirmed" : "pending",
        contact_email: contactEmail,
        email_marketing_opt_in: emailOptIn,
        sms_marketing_opt_in: smsOptIn,
        shipping_method: shippingMethod,
        payment_category: effectivePaymentCategory,
        payment_method: effectivePaymentCategory === "cod" ? null : effectivePaymentCategory,
        shipping_first_name: shipping.firstName,
        shipping_last_name: shipping.lastName,
        shipping_full_name: `${shipping.firstName} ${shipping.lastName}`.trim(),
        shipping_phone: phone || null,
        shipping_address_line1: shipping.line1,
        shipping_address_line2: shipping.line2 || null,
        shipping_city: shipping.city,
        shipping_state: null,
        shipping_postal_code: shipping.postalCode || null,
        shipping_country: shipping.country,
        billing_same_as_shipping: billingSameAsShipping,
        billing_first_name: billingSameAsShipping ? null : billing.firstName,
        billing_last_name: billingSameAsShipping ? null : billing.lastName,
        billing_address_line1: billingSameAsShipping ? null : billing.line1,
        billing_address_line2: billingSameAsShipping ? null : billing.line2 || null,
        billing_city: billingSameAsShipping ? null : billing.city,
        billing_postal_code: billingSameAsShipping ? null : billing.postalCode || null,
        billing_country: billingSameAsShipping ? null : billing.country,
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

    if (effectivePaymentCategory === "cod") {
      clear();
      const confirmationUrl = user
        ? `/order-confirmation/${order.id}`
        : `/order-confirmation/${order.id}?email=${encodeURIComponent(contactEmail)}`;
      router.push(confirmationUrl);
      return;
    }

    try {
      const res = await fetch(`/api/payments/${effectivePaymentCategory}/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment");

      clear();
      redirectToGateway(data.actionUrl, data.fields);
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof Error
          ? `Order was created, but starting payment failed: ${err.message}. It's saved as pending.`
          : "Payment could not be started."
      );
    }
  }

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur">
        <h1 className="text-sm tracking-wide text-bone">Checkout</h1>
      </header>

      <form onSubmit={placeOrder} className="flex flex-col gap-6 px-4 pb-8 pt-4">
        {!user && (
          <p className="rounded-sm border border-hairline bg-charcoal px-3 py-2 text-xs text-bone/60">
            Checking out as a guest.{" "}
            <Link href="/sign-in" className="text-gold">
              Sign in
            </Link>{" "}
            first if you'd like this order saved to an account.
          </p>
        )}

        {/* Contact information */}
        <section>
          <h2 className="mb-3 text-sm text-bone">Contact information</h2>
          <label className="block">
            <span className="mb-1 block text-xs text-bone/60">Email</span>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone"
            />
          </label>
          <label className="mt-2 flex items-center gap-2 text-xs text-bone/70">
            <input
              type="checkbox"
              checked={emailOptIn}
              onChange={(e) => setEmailOptIn(e.target.checked)}
              className="h-4 w-4 accent-[#96691F]"
            />
            Email me with news and offers
          </label>
        </section>

        {/* Delivery / shipping address */}
        <section>
          <h2 className="mb-3 text-sm text-bone">Delivery</h2>
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-bone/60">Country/Region</span>
              <select
                value={shipping.country}
                onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone"
              >
                <option value="Pakistan">Pakistan</option>
              </select>
              <p className="mt-1 text-xs text-bone/40">Currently shipping within Pakistan only.</p>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="First name"
                value={shipping.firstName}
                onChange={(v) => setShipping({ ...shipping, firstName: v })}
                required
              />
              <TextField
                label="Last name"
                value={shipping.lastName}
                onChange={(v) => setShipping({ ...shipping, lastName: v })}
                required
              />
            </div>

            <label className="block">
              <span className="mb-1 block text-xs text-bone/60">City</span>
              <CityCombobox
                value={shipping.city}
                onChange={(v) => setShipping({ ...shipping, city: v })}
                required
              />
            </label>

            <TextField
              label="Address"
              value={shipping.line1}
              onChange={(v) => setShipping({ ...shipping, line1: v })}
              placeholder="House #123, Street #5, ABC Colony"
              required
            />
            <TextField
              label="Apartment, suite, etc. (optional)"
              value={shipping.line2}
              onChange={(v) => setShipping({ ...shipping, line2: v })}
            />
            <TextField
              label="Postal code (optional)"
              value={shipping.postalCode}
              onChange={(v) => setShipping({ ...shipping, postalCode: v })}
            />

            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs text-bone/60">
                Phone (optional)
                <Tooltip text="We'll only use this to contact you about your delivery." />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03001234567"
                className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone placeholder:text-bone/40"
              />
            </label>

            <label className="flex items-center gap-2 text-xs text-bone/70">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="h-4 w-4 accent-[#96691F]"
              />
              Save this information for next time
            </label>
            <label className="flex items-center gap-2 text-xs text-bone/70">
              <input
                type="checkbox"
                checked={smsOptIn}
                onChange={(e) => setSmsOptIn(e.target.checked)}
                className="h-4 w-4 accent-[#96691F]"
              />
              Text me with news and offers
            </label>
          </div>
        </section>

        {/* Shipping method */}
        <section>
          <h2 className="mb-3 text-sm text-bone">Shipping method</h2>
          <div className="flex flex-col gap-2">
            <RadioCard
              checked={shippingMethod === "prepaid"}
              onSelect={() => setShippingMethod("prepaid")}
              title="Prepaid (Free Shipping + Priority Dispatch)"
              trailing="Free"
            />
            <RadioCard
              checked={shippingMethod === "cod"}
              onSelect={() => setShippingMethod("cod")}
              title="COD Flat Rs 199 - Ecom Taxes + Cash On Delivery Charges"
              trailing={formatPrice(COD_FEE)}
            />
          </div>
        </section>

        {/* Payment method */}
        <section>
          <h2 className="mb-3 text-sm text-bone">Payment method</h2>
          {shippingMethod === "cod" ? (
            <div className="rounded-sm border border-hairline bg-charcoal px-3 py-3 text-sm text-bone/80">
              Cash on Delivery — pay when your order arrives.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <RadioCard
                checked={paymentGateway === "jazzcash"}
                onSelect={() => setPaymentGateway("jazzcash")}
                title="JazzCash"
                subtitle="Mobile wallet, card, or bank — secure redirect"
              />
              <RadioCard
                checked={paymentGateway === "easypaisa"}
                onSelect={() => setPaymentGateway("easypaisa")}
                title="EasyPaisa"
                subtitle="Mobile wallet, card, or bank — secure redirect"
              />
            </div>
          )}
        </section>

        {/* Billing address */}
        <section>
          <h2 className="mb-3 text-sm text-bone">Billing address</h2>
          <div className="flex flex-col gap-2">
            <RadioCard
              checked={billingSameAsShipping}
              onSelect={() => setBillingSameAsShipping(true)}
              title="Same as shipping address"
            />
            <RadioCard
              checked={!billingSameAsShipping}
              onSelect={() => setBillingSameAsShipping(false)}
              title="Use a different billing address"
            />
          </div>

          {!billingSameAsShipping && (
            <div className="mt-3 flex flex-col gap-3 border-t border-hairline pt-3">
              <label className="block">
                <span className="mb-1 block text-xs text-bone/60">Country/Region</span>
                <select
                  value={billing.country}
                  onChange={(e) => setBilling({ ...billing, country: e.target.value })}
                  className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone"
                >
                  <option value="Pakistan">Pakistan</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="First name"
                  value={billing.firstName}
                  onChange={(v) => setBilling({ ...billing, firstName: v })}
                  required
                />
                <TextField
                  label="Last name"
                  value={billing.lastName}
                  onChange={(v) => setBilling({ ...billing, lastName: v })}
                  required
                />
              </div>
              <label className="block">
                <span className="mb-1 block text-xs text-bone/60">City</span>
                <CityCombobox
                  value={billing.city}
                  onChange={(v) => setBilling({ ...billing, city: v })}
                  required
                />
              </label>
              <TextField
                label="Address"
                value={billing.line1}
                onChange={(v) => setBilling({ ...billing, line1: v })}
                required
              />
              <TextField
                label="Apartment, suite, etc. (optional)"
                value={billing.line2}
                onChange={(v) => setBilling({ ...billing, line2: v })}
              />
              <TextField
                label="Postal code (optional)"
                value={billing.postalCode}
                onChange={(v) => setBilling({ ...billing, postalCode: v })}
              />
            </div>
          )}
        </section>

        <div className="space-y-2 border-t border-hairline pt-4 text-sm">
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
          <div className="flex justify-between text-bone/70">
            <span>Shipping</span>
            <span>{shippingFee > 0 ? formatPrice(shippingFee) : "Free"}</span>
          </div>
          <div className="flex justify-between pt-1 text-base text-bone">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {error && <p className="text-xs text-rust">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Placing order..."
            : effectivePaymentCategory !== "cod"
            ? "Place order & pay"
            : "Place order"}
        </Button>
      </form>
    </div>
  );
}

// 2. Wrap it with Suspense in the main page export default
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-bone/60">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-bone/60">{label}</span>
      <input
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone placeholder:text-bone/40"
      />
    </label>
  );
}

function RadioCard({
  checked,
  onSelect,
  title,
  subtitle,
  trailing,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  subtitle?: string;
  trailing?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center justify-between rounded-sm border px-3 py-3 text-left transition-colors ${
        checked ? "border-gold" : "border-hairline"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
            checked ? "border-gold" : "border-hairline"
          }`}
        >
          {checked && <span className="h-2 w-2 rounded-full bg-gold" />}
        </span>
        <span>
          <span className="block text-sm text-bone">{title}</span>
          {subtitle && <span className="block text-xs text-bone/50">{subtitle}</span>}
        </span>
      </div>
      {trailing && <span className="text-sm text-gold">{trailing}</span>}
    </button>
  );
}