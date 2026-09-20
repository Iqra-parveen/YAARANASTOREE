import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyEasyPaisaCallback, type EasyPaisaFields } from "@/lib/payments/easypaisa";

/**
 * EasyPaisa posts the transaction result to postBackURL (this route).
 * Success is typically indicated by a responseCode of "0000" — re-verify
 * this against your current merchant documentation.
 */
export async function POST(req: Request) {
  let fields: EasyPaisaFields = {};

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    fields = await req.json();
  } else {
    const formData = await req.formData();
    formData.forEach((value, key) => (fields[key] = String(value)));
  }

  const origin = new URL(req.url).origin;

  if (!verifyEasyPaisaCallback(fields)) {
    return NextResponse.redirect(`${origin}/checkout?payment=hash_mismatch`);
  }

  const admin = createAdminClient();
  const success = fields.responseCode === "0000" || fields.transactionStatus === "PAID";

  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, contact_email")
    .eq("payment_txn_ref", fields.orderRefNum)
    .single();

  if (!order) return NextResponse.redirect(`${origin}/checkout?payment=order_not_found`);

  await admin
    .from("orders")
    .update({
      payment_status: success ? "paid" : "failed",
      status: success ? "confirmed" : "pending",
      payment_gateway_ref: fields.transactionId || fields.orderRefNum || null,
    })
    .eq("id", order.id);

  // Guest orders (no user_id) need the email tacked on so the confirmation
  // page can look them up via get_guest_order() instead of relying on RLS.
  // Both outcomes go here (not the login-gated /orders/[id] tracking page)
  // since a guest has no account to sign into.
  const base = `${origin}/order-confirmation/${order.id}`;
  const emailParam = order.user_id ? "" : `email=${encodeURIComponent(order.contact_email ?? "")}`;
  const paymentParam = success ? "" : "payment=failed";
  const query = [emailParam, paymentParam].filter(Boolean).join("&");

  return NextResponse.redirect(query ? `${base}?${query}` : base);
}