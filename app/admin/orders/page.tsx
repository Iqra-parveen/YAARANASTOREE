import { createClient } from "@/lib/supabase/server";
import { formatPrice, ORDER_STATUSES } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import OrderStatusSelect from "./OrderStatusSelect";
import OrdersRealtimeWatcher from "./OrdersRealtimeWatcher";
import { Package, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();

  const activeFilter = searchParams.status ?? "all";
  const isPrepareView = activeFilter === "prepare";

  // "To Prepare" view: confirmed + processing orders with their items
  if (isPrepareView) {
    const { data: prepareOrders } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .in("status", ["confirmed", "processing"])
      .order("created_at", { ascending: true }); // oldest first — pack in order

    const filters = [
      { key: "all", label: "All" },
      { key: "prepare", label: "🧾 To Prepare" },
      { key: "active", label: "Active" },
      ...ORDER_STATUSES.map((s) => ({ key: s, label: s })),
    ];

    return (
      <div>
        <OrdersRealtimeWatcher />
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl italic text-bone">Orders</h1>
          <div className="flex items-center gap-1.5 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-gold" />
            <span className="text-[11px] font-medium text-gold">Live</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin/orders" : `/admin/orders?status=${f.key}`}
              className={cn(
                "focus-gold shrink-0 rounded-full border px-3 py-1.5 text-xs capitalize",
                activeFilter === f.key ? "border-gold bg-gold/10 text-gold" : "border-hairline text-bone/60"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* To Prepare Queue */}
        <div className="mt-6">
          <p className="mb-3 text-xs text-bone/60">
            {prepareOrders?.length ?? 0} order{prepareOrders?.length !== 1 ? "s" : ""} need packing — sorted oldest first
          </p>

          {(!prepareOrders || prepareOrders.length === 0) ? (
            <div className="flex flex-col items-center justify-center rounded-sm border border-hairline py-16 text-center">
              <CheckCircle2 size={32} className="text-gold" />
              <p className="mt-3 text-sm font-medium text-bone">All caught up!</p>
              <p className="mt-1 text-xs text-bone/50">No orders waiting to be prepared right now.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {prepareOrders.map((o) => (
                <div
                  key={o.id}
                  className={cn(
                    "rounded-sm border p-4",
                    o.status === "confirmed" ? "border-gold/50 bg-gold/5" : "border-hairline bg-charcoal/40"
                  )}
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {o.status === "confirmed" ? (
                        <AlertCircle size={16} className="text-gold shrink-0" />
                      ) : (
                        <Clock size={16} className="text-bone/50 shrink-0" />
                      )}
                      <span className="font-mono text-sm font-semibold text-gold">{o.tracking_id}</span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                          o.status === "confirmed"
                            ? "border-gold/60 text-gold"
                            : "border-bone/30 text-bone/60"
                        )}
                      >
                        {o.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-bone">{formatPrice(o.total_amount)}</p>
                      <p className="text-[11px] text-bone/50">
                        {new Date(o.created_at).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Shipping */}
                  <div className="mt-3 rounded-sm bg-ink/40 p-3 text-xs text-bone/80 space-y-1">
                    <p>
                      <span className="text-bone/50">Customer: </span>
                      <span className="font-medium">{o.shipping_full_name}</span>
                    </p>
                    <p>
                      <span className="text-bone/50">Phone: </span>
                      <span>{o.shipping_phone}</span>
                    </p>
                    <p>
                      <span className="text-bone/50">Address: </span>
                      <span>
                        {[o.shipping_address, o.shipping_city].filter(Boolean).join(", ")}
                      </span>
                    </p>
                    <p>
                      <span className="text-bone/50">Payment: </span>
                      <span
                        className={
                          o.payment_status === "paid" ? "font-semibold text-gold" : "text-bone/60"
                        }
                      >
                        {o.payment_status === "paid" ? "✓ Paid" : "COD — collect on delivery"}
                      </span>
                      {o.payment_method && (
                        <span className="ml-1 text-bone/40">
                          ({o.payment_method === "jazzcash" ? "JazzCash" : o.payment_method === "easypaisa" ? "EasyPaisa" : o.payment_method})
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Items to pack */}
                  <div className="mt-3">
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-bone/50">
                      Items to pack
                    </p>
                    <div className="divide-y divide-hairline rounded-sm border border-hairline">
                      {(o.order_items as {
                        id: string;
                        product_name: string;
                        variant_label?: string;
                        quantity: number;
                        price: number;
                      }[])?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-charcoal">
                            <Package size={14} className="text-bone/60" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium text-bone">{item.product_name}</p>
                            {item.variant_label && (
                              <p className="text-[11px] text-bone/50">{item.variant_label}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-semibold text-bone">×{item.quantity}</p>
                            <p className="text-[11px] text-bone/50">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Change */}
                  <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
                    <span className="text-xs text-bone/50">Update status:</span>
                    <OrderStatusSelect id={o.id} status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal all-orders / filtered view
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeFilter === "active") {
    query = query.neq("status", "cancelled");
  } else if (activeFilter !== "all") {
    query = query.eq("status", activeFilter);
  }

  const { data: orders } = await query;

  const filters = [
    { key: "all", label: "All" },
    { key: "prepare", label: "🧾 To Prepare" },
    { key: "active", label: "Active" },
    ...ORDER_STATUSES.map((s) => ({ key: s, label: s })),
  ];

  // Badge count for "To Prepare"
  const { count: prepareCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["confirmed", "processing"]);

  return (
    <div>
      <OrdersRealtimeWatcher />

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-bone">Orders</h1>
        <div className="flex items-center gap-1.5 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gold" />
          <span className="text-[11px] font-medium text-gold">Live</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/orders" : `/admin/orders?status=${f.key}`}
            className={cn(
              "focus-gold relative shrink-0 rounded-full border px-3 py-1.5 text-xs capitalize",
              activeFilter === f.key ? "border-gold bg-gold/10 text-gold" : "border-hairline text-bone/60"
            )}
          >
            {f.label}
            {f.key === "prepare" && prepareCount && prepareCount > 0 ? (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-ink">
                {prepareCount}
              </span>
            ) : null}
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
              <tr
                key={o.id}
                className={cn(
                  "border-b border-hairline last:border-0 transition-colors",
                  (o.status === "confirmed" || o.status === "processing") &&
                    "bg-gold/5"
                )}
              >
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
          <div
            key={o.id}
            className={cn(
              "border p-3",
              o.status === "confirmed" || o.status === "processing"
                ? "border-gold/40 bg-gold/5"
                : "border-hairline"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gold">{o.tracking_id}</span>
              <span className="text-sm text-bone/80">{formatPrice(o.total_amount)}</span>
            </div>
            <p className="mt-1 text-sm text-bone/80">{o.shipping_full_name}</p>
            <p className="mt-1 text-xs text-bone/50">
              {new Date(o.created_at).toLocaleDateString()}
            </p>
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