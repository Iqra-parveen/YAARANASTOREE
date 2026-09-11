import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { formatPrice, statusLabel, ORDER_STATUSES } from "@/lib/utils";
import type { Order, OrderItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export const revalidate = 0;

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { payment?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: order } = await supabase.from("orders").select("*").eq("id", params.id).single();
  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);

  const trackSteps = ORDER_STATUSES.filter((s) => s !== "cancelled");
  const currentIdx = trackSteps.indexOf(order.status as (typeof trackSteps)[number]);

  return (
    <div>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur">
        <Link href="/orders" className="focus-gold text-bone/80" aria-label="Back">
          <ChevronLeft size={20} />
        </Link>
        <span className="text-sm text-bone/80">{(order as Order).tracking_id}</span>
      </header>

      <div className="px-4 pt-5">
        {searchParams.payment === "success" && (
          <p className="mb-4 border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold">
            Payment received — thank you!
          </p>
        )}
        {searchParams.payment === "failed" && (
          <p className="mb-4 border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-rust">
            Payment did not go through. You can contact Customer Care to retry.
          </p>
        )}
        {order.payment_status && (
          <p className="mb-3 text-xs text-bone/50">
            Payment: <span className="capitalize text-bone/70">{order.payment_status.replace("_", " ")}</span>
            {order.payment_method && ` via ${order.payment_method === "jazzcash" ? "JazzCash" : "EasyPaisa"}`}
          </p>
        )}
        {order.status === "cancelled" ? (
          <p className="border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-rust">
            This order was cancelled.
          </p>
        ) : (
          <div className="flex items-center justify-between">
            {trackSteps.map((step, idx) => (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    idx <= currentIdx ? "bg-gold" : "bg-hairline"
                  )}
                />
                <span
                  className={cn(
                    "mt-1 text-center text-[10px]",
                    idx <= currentIdx ? "text-gold" : "text-bone/30"
                  )}
                >
                  {statusLabel(step)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-hairline pt-4">
          <p className="mb-2 text-xs text-bone/60">Items</p>
          <div className="flex flex-col gap-3">
            {(items as OrderItem[] | null)?.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <div>
                  <p className="text-bone">{i.product_name}</p>
                  {i.variant_label && <p className="text-xs text-bone/50">{i.variant_label}</p>}
                  <p className="text-xs text-bone/50">Qty {i.quantity}</p>
                </div>
                <p className="text-gold">{formatPrice(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-hairline pt-4 text-sm">
          <div className="flex justify-between text-bone/70">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-gold">
              <span>Discount</span>
              <span>-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base text-bone">
            <span>Total</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-hairline pt-4">
          <p className="mb-1 text-xs text-bone/60">Shipping to</p>
          <p className="text-sm text-bone/80">
            {order.shipping_full_name} · {order.shipping_phone}
            <br />
            {order.shipping_address_line1}
            {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ""}
            <br />
            {order.shipping_city}
            {order.shipping_state ? `, ${order.shipping_state}` : ""}{" "}
            {order.shipping_postal_code ?? ""}
            <br />
            {order.shipping_country}
          </p>
        </div>
      </div>
    </div>
  );
}
