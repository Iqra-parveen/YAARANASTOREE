import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email/sendOrderEmails";

/**
 * Triggered client-side right after a COD order is placed (online-paid
 * orders trigger this server-side directly from the payment callback
 * routes instead, since they're already on the server at that point).
 * Failing to send an email should never break checkout, so this always
 * returns 200 — the result just gets logged.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId } = body;
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
    }

    const result = await sendOrderConfirmationEmail(orderId);
    if (!result.success) {
      console.warn(`[email] Order confirmation email for order ${orderId} was not sent:`, result.error);
    } else {
      console.log(`[email] Order confirmation email for order ${orderId} sent successfully`);
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[email] Error in order-confirmation route:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}