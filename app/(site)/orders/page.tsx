import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { formatPrice, statusLabel } from "@/lib/utils";
import type { Order } from "@/lib/types";

export const revalidate = 0;

export default async function OrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <TopBar title="My Orders" />
      <div className="px-4 pt-4">
        {(!orders || orders.length === 0) && (
          <p className="py-10 text-center text-sm text-bone/40">No orders yet.</p>
        )}
        <div className="flex flex-col gap-3">
          {(orders as Order[] | null)?.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="focus-gold flex items-center justify-between border border-hairline px-4 py-3"
            >
              <div>
                <p className="text-sm text-bone">{o.tracking_id}</p>
                <p className="text-xs text-bone/50">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gold">{formatPrice(o.total_amount)}</p>
                <p className="text-xs capitalize text-bone/50">{statusLabel(o.status)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
