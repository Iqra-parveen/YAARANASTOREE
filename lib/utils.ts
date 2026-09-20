export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Deliberately simple (not RFC 5322 complete) — just enough to catch obvious
// typos like missing "@" or missing a domain extension, without rejecting
// valid-but-unusual real addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function isOnSale(product: { price: number; compare_at_price: number | null }): boolean {
  return product.compare_at_price != null && product.compare_at_price > product.price;
}