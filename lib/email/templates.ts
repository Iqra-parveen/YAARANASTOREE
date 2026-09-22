import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem } from "@/lib/types";

const GOLD = "#96691F";
const INK = "#1C1710";
const BONE = "#FCFAF3";

function layout(bodyHtml: string): string {
  return `
  <div style="background-color:${BONE};padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:${INK};">
    <div style="max-width:480px;margin:0 auto;background-color:#ffffff;border:1px solid #E6D9B4;">
      <div style="padding:24px;text-align:center;border-bottom:1px solid #E6D9B4;">
        <span style="font-size:22px;font-style:italic;letter-spacing:1px;color:${INK};">YAARANA</span>
      </div>
      <div style="padding:24px;">
        ${bodyHtml}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #E6D9B4;text-align:center;">
        <p style="font-size:11px;color:#8a8072;margin:0;">
          Questions about your order? Just reply to this email.
        </p>
      </div>
    </div>
  </div>`;
}

export function orderConfirmationEmail(order: Order, items: OrderItem[]): { subject: string; html: string } {
  const itemsHtml = items
    .map(
      (i) => `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:${INK};">
          ${i.product_name}${i.variant_label ? ` (${i.variant_label})` : ""} × ${i.quantity}
        </td>
        <td style="padding:6px 0;font-size:13px;color:${GOLD};text-align:right;">
          ${formatPrice(i.price * i.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const html = layout(`
    <p style="font-size:18px;font-style:italic;margin:0 0 8px;">Thank you, ${order.shipping_first_name || "friend"}!</p>
    <p style="font-size:13px;color:#5a5145;margin:0 0 20px;">
      Your order <strong>#${order.tracking_id}</strong> is confirmed and will arrive within 3-7 working days.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      ${itemsHtml}
    </table>
    <table style="width:100%;border-top:1px solid #E6D9B4;padding-top:8px;">
      <tr><td style="font-size:13px;color:#5a5145;padding-top:8px;">Subtotal</td><td style="text-align:right;padding-top:8px;font-size:13px;">${formatPrice(order.subtotal)}</td></tr>
      ${order.discount_amount > 0 ? `<tr><td style="font-size:13px;color:${GOLD};">Discount</td><td style="text-align:right;font-size:13px;color:${GOLD};">-${formatPrice(order.discount_amount)}</td></tr>` : ""}
      <tr><td style="font-size:13px;color:#5a5145;">Shipping</td><td style="text-align:right;font-size:13px;">${order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : "Free"}</td></tr>
      <tr><td style="font-size:15px;font-weight:bold;padding-top:6px;">Total</td><td style="text-align:right;font-size:15px;font-weight:bold;padding-top:6px;">${formatPrice(order.total_amount)}</td></tr>
    </table>
    <p style="font-size:12px;color:#8a8072;margin-top:20px;">
      Shipping to: ${order.shipping_full_name}, ${order.shipping_address_line1}${order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ""}, ${order.shipping_city}, ${order.shipping_country}
    </p>
  `);

  return { subject: `Order confirmed — #${order.tracking_id}`, html };
}

const STATUS_COPY: Record<string, { headline: string; body: string }> = {
  confirmed: { headline: "Your order is confirmed", body: "We're getting it ready for dispatch." },
  processing: { headline: "Your order is being processed", body: "We're preparing your items now." },
  shipped: { headline: "Your order is on its way", body: "Your package has been dispatched and is en route to you." },
  delivered: { headline: "Your order has been delivered", body: "We hope you love it! Thanks for shopping with YAARANA." },
  cancelled: { headline: "Your order was cancelled", body: "If this wasn't expected, please reply to this email and we'll help sort it out." },
};

export function orderStatusUpdateEmail(order: Order, status: string): { subject: string; html: string } {
  const copy = STATUS_COPY[status] ?? { headline: "Order update", body: `Your order status is now: ${status}.` };

  const html = layout(`
    <p style="font-size:12px;color:#8a8072;margin:0 0 4px;">Order #${order.tracking_id}</p>
    <p style="font-size:18px;font-style:italic;margin:0 0 8px;">${copy.headline}</p>
    <p style="font-size:13px;color:#5a5145;margin:0;">${copy.body}</p>
  `);

  return { subject: `${copy.headline} — #${order.tracking_id}`, html };
}