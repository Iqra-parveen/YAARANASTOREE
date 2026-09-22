import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail } from "@/lib/email/sendOrderEmails";

/**
 * Only admins should be able to trigger a status-update email (it's called
 * right after an admin changes an order's status in the dashboard).
 */
const ALLOWED_STATUSES = ["confirmed", "processing", "shipped", "delivered", "cancelled"];

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { orderId, status, previousStatus } = body;
    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: "Missing orderId or status" }, { status: 400 });
    }

    if (previousStatus && previousStatus === status) {
      return NextResponse.json({ success: false, error: "Status has not changed" });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({
        success: false,
        error: `Status "${status}" does not trigger an email notification`,
      });
    }

    const result = await sendOrderStatusEmail(orderId, status);
    if (!result.success) {
      console.warn(`[email] Order status update email for order ${orderId} (${status}) was not sent:`, result.error);
    } else {
      console.log(`[email] Order status update email for order ${orderId} (${status}) sent successfully`);
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[email] Error in order-status-update route:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}