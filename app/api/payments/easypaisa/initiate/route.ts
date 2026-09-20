import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildEasyPaisaRequest, getEasyPaisaActionUrl } from "@/lib/payments/easypaisa";

/**
 * Same guest-order handling as the JazzCash initiate route: logged-in users
 * must own the order via RLS, guests (no session) are looked up with the
 * admin client and only accepted if the order truly has no owner.
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { orderId } = await req.json();

  let order;
  if (user) {
    const { data } = await supabase.from("orders").select("*").eq("id", orderId).eq("user_id", user.id).single();
    order = data;
  } else {
    const admin = createAdminClient();
    const { data } = await admin.from("orders").select("*").eq("id", orderId).is("user_id", null).single();
    order = data;
  }

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const origin = new URL(req.url).origin;
  const orderRefNum = order.tracking_id.replace(/[^A-Za-z0-9]/g, "").slice(0, 20);

  const fields = buildEasyPaisaRequest({
    amountPKR: Number(order.total_amount),
    orderRefNum,
    postBackURL: `${origin}/api/payments/easypaisa/callback`,
  });

  // Admin client, not the cookie-scoped one — customers (guest or logged-in)
  // aren't allowed to UPDATE orders under RLS (admin-only), so this write
  // would otherwise silently fail for every real customer, not just guests.
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ payment_method: "easypaisa", payment_txn_ref: orderRefNum })
    .eq("id", order.id);

  return NextResponse.json({ actionUrl: getEasyPaisaActionUrl(), fields });
}