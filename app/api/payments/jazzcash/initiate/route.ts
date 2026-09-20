import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildJazzCashRequest, getJazzCashActionUrl } from "@/lib/payments/jazzcash";

/**
 * Body: { orderId: string }
 * The order must already exist (created by the client with status "pending",
 * payment_status "awaiting_payment"). Logged-in users must own it; guest
 * orders (no session at all) are looked up via the admin client and only
 * accepted if the order genuinely has no owner — a guest can't hijack
 * someone else's order this way, only pay for a real guest order they (or
 * whoever has the link) just created.
 * Returns the hosted-checkout action URL + signed fields for the client to
 * auto-submit as a POST form.
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
  const fields = buildJazzCashRequest({
    amountPKR: Number(order.total_amount),
    billReference: order.tracking_id,
    description: `YAARANA order ${order.tracking_id}`,
    returnUrl: `${origin}/api/payments/jazzcash/callback`,
    txnRefNo: `T${order.id.replace(/-/g, "").slice(0, 16)}`,
  });

  const admin = createAdminClient();
  await admin.from("orders").update({ payment_method: "jazzcash", payment_txn_ref: fields.pp_TxnRefNo }).eq("id", order.id);

  return NextResponse.json({ actionUrl: getJazzCashActionUrl(), fields });
}