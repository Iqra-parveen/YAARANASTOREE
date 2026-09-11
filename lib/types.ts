export type Database = any; // generate with `supabase gen types typescript` once schema stabilizes

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  status: "active" | "inactive";
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  quantity: number;
  status: "active" | "inactive";
  featured: boolean;
  categories?: { name: string; slug: string } | null;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  price_override: number | null;
  stock: number;
  status: "active" | "inactive";
};

export type CartItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product: Product;
  variant?: ProductVariant | null;
};

export type Order = {
  id: string;
  tracking_id: string;
  user_id: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method: "jazzcash" | "easypaisa" | null;
  payment_status: "awaiting_payment" | "paid" | "failed" | "cancelled";
  payment_txn_ref: string | null;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_label: string | null;
  quantity: number;
  price: number;
};

export type PromoCode = {
  id: string;
  code: string;
  discount: number;
  discount_type: "percentage" | "fixed";
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  status: "active" | "inactive";
  expiry_date: string | null;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "new_product" | "promotion" | "campaign" | "order_update" | "general";
  image_url: string | null;
  created_at: string;
};

export type Banner = {
  id: string;
  title: string | null;
  image_url: string;
  media_type: "image" | "video";
  link_url: string | null;
  display_order: number;
  status: "active" | "inactive";
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "customer" | "admin";
};
