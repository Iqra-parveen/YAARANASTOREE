import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem } from "@/lib/types";

export const revalidate = 0;

const PAYMENT_LABELS: Record<string, string> = {
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  cod: "Cash on Delivery",
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { email?: string; payment?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let o: Order | null = null;
  let items: OrderItem[] = [];

  if (user) {
    // Logged-in path: normal RLS-scoped fetch (owner or admin).
    const { data: order } = await supabase.from("orders").select("*").eq("id", params.id).single();
    if (order) {
      o = order as Order;
      const { data } = await supabase.from("order_items").select("*").eq("order_id", o.id);
      items = (data as OrderItem[] | null) ?? [];
    }
  } else if (searchParams.email) {
    // Guest path: no session to prove ownership, so this goes through a
    // narrow function requiring BOTH the order id and the checkout email —
    // not a broad table policy.
    const { data } = await supabase.rpc("get_guest_order", {
      p_order_id: params.id,
      p_email: searchParams.email,
    });
    if (data) {
      o = data.order as Order;
      items = (data.items as OrderItem[]) ?? [];
    }
  }

  if (!o) notFound();

  const paymentFailed = searchParams.payment === "failed";

  const billingName = o.billing_same_as_shipping
    ? `${o.shipping_first_name ?? ""} ${o.shipping_last_name ?? ""}`.trim() || o.shipping_full_name
    : `${o.billing_first_name ?? ""} ${o.billing_last_name ?? ""}`.trim();
  const billingAddress = o.billing_same_as_shipping
    ? [o.shipping_address_line1, o.shipping_address_line2, o.shipping_city, o.shipping_country]
    : [o.billing_address_line1, o.billing_address_line2, o.billing_city, o.billing_country];

  return (
    <div className="px-4 py-8">
      {/* Status header */}
      <div className="flex flex-col items-center text-center">
        {paymentFailed ? (
          <>
            <XCircle size={48} className="text-rust" />
            <p className="mt-3 text-xs tracking-wide text-bone/50">Order #{o.tracking_id}</p>
            <h1 className="mt-1 font-display text-2xl italic text-bone">Payment didn't go through</h1>
            <p className="mt-3 text-sm text-bone/70">
              Your order was saved but payment wasn't completed. You can retry from{" "}
              {user ? "My Orders" : "the link in your email"}, or contact us for help.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 size={48} className="text-gold" />
            <p className="mt-3 text-xs tracking-wide text-bone/50">Order #{o.tracking_id}</p>
            <h1 className="mt-1 font-display text-2xl italic text-bone">
              Thank you, {o.shipping_first_name || "friend"}!
            </h1>
            <p className="mt-3 text-sm text-bone/70">
              Your order will be delivered within <span className="text-bone">3-7 working days</span>.
            </p>
            <p className="mt-1 text-xs text-bone/50">
              Your order is confirmed. A confirmation email will be sent to {o.contact_email} shortly.
            </p>
          </>
        )}
      </div>

      {!user && (
        <p className="mt-4 rounded-sm border border-gold/30 bg-gold/5 px-3 py-2 text-center text-xs text-gold">
          Bookmark this page to find your order later — you checked out as a guest, so it won't appear
          under an account. <Link href="/sign-up" className="underline">Create an account</Link> next
          time to track orders more easily.
        </p>
      )}

      {/* Order details breakdown */}
      <div className="mt-8 flex flex-col divide-y divide-hairline border-y border-hairline">
        <DetailRow label="Contact Information">
          <p className="text-sm text-bone/80">{o.contact_email}</p>
        </DetailRow>

        <DetailRow label="Shipping Address">
          <p className="text-sm text-bone/80">
            {o.shipping_full_name}
            <br />
            {o.shipping_address_line1}
            {o.shipping_address_line2 ? `, ${o.shipping_address_line2}` : ""}
            <br />
            {o.shipping_city}, {o.shipping_country}
            {o.shipping_phone && (
              <>
                <br />
                {o.shipping_phone}
              </>
            )}
          </p>
        </DetailRow>

        <DetailRow label="Shipping Method">
          <div className="flex justify-between text-sm">
            <span className="text-bone/80">
              {o.shipping_method === "cod" ? "Cash on Delivery" : "Prepaid — Free Shipping"}
            </span>
            <span className="text-gold">{o.shipping_fee > 0 ? formatPrice(o.shipping_fee) : "Free"}</span>
          </div>
        </DetailRow>

        <DetailRow label="Payment Method">
          <div className="flex justify-between text-sm">
            <span className="text-bone/80">{PAYMENT_LABELS[o.payment_category] ?? o.payment_category}</span>
            <span className="text-gold">{formatPrice(o.total_amount)}</span>
          </div>
        </DetailRow>

        <DetailRow label="Billing Address">
          <p className="text-sm text-bone/80">
            {billingName}
            <br />
            {billingAddress.filter(Boolean).join(", ")}
          </p>
        </DetailRow>
      </div>

      {/* Items */}
      <div className="mt-6">
        <p className="mb-2 text-xs text-bone/60">Items</p>
        <div className="flex flex-col gap-2">
          {items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm">
              <span className="text-bone/80">
                {i.product_name}
                {i.variant_label ? ` (${i.variant_label})` : ""} × {i.quantity}
              </span>
              <span className="text-bone/60">{formatPrice(i.price * i.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-hairline pt-3 text-sm">
          <div className="flex justify-between text-bone/60">
            <span>Subtotal</span>
            <span>{formatPrice(o.subtotal)}</span>
          </div>
          {o.discount_amount > 0 && (
            <div className="flex justify-between text-gold">
              <span>Discount</span>
              <span>-{formatPrice(o.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-bone/60">
            <span>Shipping</span>
            <span>{o.shipping_fee > 0 ? formatPrice(o.shipping_fee) : "Free"}</span>
          </div>
          <div className="flex justify-between pt-1 text-base text-bone">
            <span>Total</span>
            <span>{formatPrice(o.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/shop"
          className="focus-gold rounded-sm bg-gold py-3 text-center text-sm font-medium text-bone"
        >
          Continue shopping
        </Link>
        <Link href="/care" className="focus-gold text-center text-xs text-bone/50">
          Contact us
        </Link>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-4">
      <p className="col-span-1 text-xs text-bone/50">{label}</p>
      <div className="col-span-2">{children}</div>
    </div>
  );
}