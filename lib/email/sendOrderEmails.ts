import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { orderConfirmationEmail, orderStatusUpdateEmail } from "@/lib/email/templates";
import type { Order, OrderItem } from "@/lib/types";

async function loadOrder(orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order) return null;
  const { data: items } = await admin.from("order_items").select("*").eq("order_id", orderId);
  return { order: order as Order, items: (items as OrderItem[]) ?? [] };
}

export async function sendOrderConfirmationEmail(orderId: string) {
  const data = await loadOrder(orderId);
  if (!data || !data.order.contact_email) return { success: false, error: "Order or email not found" };
  const { subject, html } = orderConfirmationEmail(data.order, data.items);
  return sendEmail({ to: data.order.contact_email, subject, html });
}

const VALID_EMAIL_STATUSES = ["confirmed", "processing", "shipped", "delivered", "cancelled"];

export async function sendOrderStatusEmail(orderId: string, status: string) {
  if (!VALID_EMAIL_STATUSES.includes(status)) {
    return { success: false, error: `Status "${status}" does not trigger an email notification` };
  }
  const data = await loadOrder(orderId);
  if (!data || !data.order.contact_email) return { success: false, error: "Order or email not found" };
  const { subject, html } = orderStatusUpdateEmail(data.order, status);
  return sendEmail({ to: data.order.contact_email, subject, html });
}