import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: totalProducts },
    { count: totalCategories },
    { count: pendingOrders },
    { count: activePromos },
    { data: revenueRows },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("promo_codes").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("orders").select("total_amount").neq("status", "cancelled"),
    supabase
      .from("orders")
      .select("id, tracking_id, total_amount, status, created_at, shipping_full_name")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const revenue = (revenueRows ?? []).reduce((sum, r) => sum + Number(r.total_amount), 0);

  const stats = [
    { label: "Total Products", value: totalProducts ?? 0 },
    { label: "Total Categories", value: totalCategories ?? 0 },
    { label: "Pending Orders", value: pendingOrders ?? 0 },
    { label: "Revenue", value: formatPrice(revenue) },
    { label: "Active Promo Codes", value: activePromos ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl italic text-bone">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="border border-hairline p-4">
            <p className="text-xs text-bone/50">{s.label}</p>
            <p className="mt-1 text-xl text-gold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm text-bone/70">Recent Orders</h2>
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs text-bone/50">
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((o) => (
                <tr key={o.id} className="border-b border-hairline last:border-0">
                  <td className="px-3 py-2 text-gold">{o.tracking_id}</td>
                  <td className="px-3 py-2 text-bone/80">{o.shipping_full_name}</td>
                  <td className="px-3 py-2 text-bone/60">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-bone/80">{formatPrice(o.total_amount)}</td>
                  <td className="px-3 py-2 capitalize text-bone/60">{o.status}</td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-bone/40">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
