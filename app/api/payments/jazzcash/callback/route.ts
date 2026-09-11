import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyJazzCashCallback, type JazzCashFields } from "@/lib/payments/jazzcash";

/**
 * JazzCash POSTs the transaction result to pp_ReturnURL (this route).
 * pp_ResponseCode "000" means success — verify against the current
 * integration guide, response codes can include other "success-like" codes.
 */
export async function POST(req: Request) {
  const formData = await req.formData();
  const fields: JazzCashFields = {};
  formData.forEach((value, key) => (fields[key] = String(value)));

  const origin = new URL(req.url).origin;

  if (!verifyJazzCashCallback(fields)) {
    return NextResponse.redirect(`${origin}/checkout?payment=hash_mismatch`);
  }

  const admin = createAdminClient();
  const success = fields.pp_ResponseCode === "000";

  const { data: order } = await admin
    .from("orders")
    .select("id")
    .eq("payment_txn_ref", fields.pp_TxnRefNo)
    .single();

  if (!order) return NextResponse.redirect(`${origin}/checkout?payment=order_not_found`);

  await admin
    .from("orders")
    .update({
      payment_status: success ? "paid" : "failed",
      status: success ? "confirmed" : "pending",
      payment_gateway_ref: fields.pp_RetreivalReferenceNo || fields.pp_TxnRefNo || null,
    })
    .eq("id", order.id);

  return NextResponse.redirect(
    success ? `${origin}/orders/${order.id}?payment=success` : `${origin}/orders/${order.id}?payment=failed`
  );
}
