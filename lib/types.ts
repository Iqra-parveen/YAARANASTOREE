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
  compare_at_price: number | null;
  sku: string | null;
  styling_tip: string | null;
  category_id: string | null;
  image_url: string | null;
  media_type: "image" | "video";
  quantity: number;
  status: "active" | "inactive";
  featured: boolean;
  categories?: { name: string; slug: string } | null;
  product_variants?: ProductVariant[];
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

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  media_type: "image" | "video";
  display_order: number;
};

export type SizeGuideRow = {
  size: string;
  values: string[];
};

export type SizeGuide = {
  id: string;
  category_id: string;
  unit: "in" | "cm";
  columns: string[];
  rows: SizeGuideRow[];
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
  user_id: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  contact_email: string | null;
  email_marketing_opt_in: boolean;
  sms_marketing_opt_in: boolean;
  payment_method: "jazzcash" | "easypaisa" | null;
  payment_status: "awaiting_payment" | "paid" | "failed" | "cancelled";
  payment_txn_ref: string | null;
  payment_category: "jazzcash" | "easypaisa" | "cod";
  shipping_method: "prepaid" | "cod";
  shipping_full_name: string;
  shipping_first_name: string | null;
  shipping_last_name: string | null;
  shipping_phone: string | null;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string;
  billing_same_as_shipping: boolean;
  billing_first_name: string | null;
  billing_last_name: string | null;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
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
  show_on_banner: boolean;
  banner_message: string | null;
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