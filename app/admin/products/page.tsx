import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import ProductRowActions from "./ProductRowActions";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-bone">Products</h1>
        <Link
          href="/admin/products/new"
          className="focus-gold rounded-sm bg-gold px-4 py-2 text-sm text-bone"
        >
          Add Product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs text-bone/50">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Featured</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-hairline last:border-0">
                <td className="px-3 py-2 text-bone">{p.name}</td>
                <td className="px-3 py-2 text-bone/60">{p.categories?.name ?? "—"}</td>
                <td className="px-3 py-2 text-gold">{formatPrice(p.price)}</td>
                <td className="px-3 py-2 text-bone/60">{p.quantity}</td>
                <td className="px-3 py-2 text-bone/60 capitalize">{p.status}</td>
                <td className="px-3 py-2 text-bone/60">{p.featured ? "Yes" : "—"}</td>
                <td className="px-3 py-2">
                  <ProductRowActions id={p.id} status={p.status} />
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-bone/40">
                  No products yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
