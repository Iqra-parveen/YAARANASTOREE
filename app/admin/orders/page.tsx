import { createClient } from "@/lib/supabase/server";
import { formatPrice, ORDER_STATUSES } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import OrderStatusSelect from "./OrderStatusSelect";

export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const activeFilter = searchParams.status;
  if (activeFilter === "active") {
    query = query.neq("status", "cancelled");
  } else if (activeFilter && activeFilter !== "all") {
    query = query.eq("status", activeFilter);
  }

  const { data: orders } = await query;

  const filters = ["all", "active", ...ORDER_STATUSES];

  return (
    <div>
      <h1 className="font-display text-2xl italic text-bone">Orders</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`}
            className={cn(
              "focus-gold shrink-0 rounded-full border px-3 py-1.5 text-xs capitalize",
              (activeFilter ?? "all") === f ? "border-gold text-gold" : "border-hairline text-bone/60"
            )}
          >
            {f}
          </Link>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="mt-6 hidden overflow-x-auto border border-hairline md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs text-bone/50">
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Payment</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => (
              <tr key={o.id} className="border-b border-hairline last:border-0">
                <td className="px-3 py-2 text-gold">{o.tracking_id}</td>
                <td className="px-3 py-2 text-bone/80">{o.shipping_full_name}</td>
                <td className="px-3 py-2 text-bone/60">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 text-bone/80">{formatPrice(o.total_amount)}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "text-xs capitalize",
                      o.payment_status === "paid" ? "text-gold" : "text-bone/50"
                    )}
                  >
                    {(o.payment_status ?? "awaiting_payment").replace("_", " ")}
                  </span>
                  {o.payment_method && (
                    <span className="ml-1 text-xs text-bone/40">
                      ({o.payment_method === "jazzcash" ? "JazzCash" : "EasyPaisa"})
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <OrderStatusSelect id={o.id} status={o.status} />
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-bone/40">
                  No orders in this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="mt-6 flex flex-col gap-3 md:hidden">
        {orders?.map((o) => (
          <div key={o.id} className="border border-hairline p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gold">{o.tracking_id}</span>
              <span className="text-sm text-bone/80">{formatPrice(o.total_amount)}</span>
            </div>
            <p className="mt-1 text-sm text-bone/80">{o.shipping_full_name}</p>
            <p className="mt-1 text-xs text-bone/50">{new Date(o.created_at).toLocaleDateString()}</p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span
                className={cn(
                  "capitalize",
                  o.payment_status === "paid" ? "text-gold" : "text-bone/50"
                )}
              >
                {(o.payment_status ?? "awaiting_payment").replace("_", " ")}
              </span>
              {o.payment_method && (
                <span className="text-bone/40">
                  ({o.payment_method === "jazzcash" ? "JazzCash" : "EasyPaisa"})
                </span>
              )}
            </div>
            <div className="mt-3 border-t border-hairline pt-2">
              <OrderStatusSelect id={o.id} status={o.status} />
            </div>
          </div>
        ))}
        {(!orders || orders.length === 0) && (
          <p className="border border-hairline px-3 py-6 text-center text-sm text-bone/40">
            No orders in this filter.
          </p>
        )}
      </div>
    </div>
  );
}