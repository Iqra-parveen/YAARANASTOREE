import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildJazzCashRequest, getJazzCashActionUrl } from "@/lib/payments/jazzcash";

/**
 * Body: { orderId: string }
 * The order must already exist (created by the client with status "pending",
 * payment_status "awaiting_payment") and belong to the requesting user.
 * Returns the hosted-checkout action URL + signed fields for the client to
 * auto-submit as a POST form.
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { orderId } = await req.json();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const origin = new URL(req.url).origin;
  const fields = buildJazzCashRequest({
    amountPKR: Number(order.total_amount),
    billReference: order.tracking_id,
    description: `YAARANA order ${order.tracking_id}`,
    returnUrl: `${origin}/api/payments/jazzcash/callback`,
    txnRefNo: `T${order.id.replace(/-/g, "").slice(0, 16)}`,
  });

  await supabase.from("orders").update({ payment_method: "jazzcash", payment_txn_ref: fields.pp_TxnRefNo }).eq("id", order.id);

  return NextResponse.json({ actionUrl: getJazzCashActionUrl(), fields });
}
