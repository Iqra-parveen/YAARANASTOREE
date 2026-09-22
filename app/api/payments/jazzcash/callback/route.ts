import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyJazzCashCallback, type JazzCashFields } from "@/lib/payments/jazzcash";
import { sendOrderConfirmationEmail } from "@/lib/email/sendOrderEmails";

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
    .select("id, user_id, contact_email, payment_status, status")
    .eq("payment_txn_ref", fields.pp_TxnRefNo)
    .single();

  if (!order) return NextResponse.redirect(`${origin}/checkout?payment=order_not_found`);

  const alreadyPaid = order.payment_status === "paid";

  await admin
    .from("orders")
    .update({
      payment_status: success ? "paid" : "failed",
      status: success ? "confirmed" : "pending",
      payment_gateway_ref: fields.pp_RetreivalReferenceNo || fields.pp_TxnRefNo || null,
    })
    .eq("id", order.id);

  if (success && !alreadyPaid) {
    try {
      const emailResult = await sendOrderConfirmationEmail(order.id);
      if (!emailResult.success) {
        console.warn(`[payment] JazzCash confirmation email not sent for order ${order.id}:`, emailResult.error);
      } else {
        console.log(`[payment] JazzCash confirmation email sent successfully for order ${order.id}`);
      }
    } catch (emailErr) {
      console.warn(`[payment] Error triggering confirmation email for order ${order.id}:`, emailErr);
    }
  } else if (success && alreadyPaid) {
    console.log(`[payment] JazzCash callback repeated for order ${order.id}; skipped duplicate email`);
  } else {
    console.log(`[payment] JazzCash payment failed for order ${order.id}; no confirmation email sent`);
  }

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