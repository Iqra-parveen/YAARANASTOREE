import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { STANDARD_SIZES } from "@/lib/product-constants";
import type { Category, Product, ProductVariant } from "@/lib/types";
import ShopFilters from "./ShopFilters";

export const revalidate = 0;

type ProductWithVariants = Product & {
  product_variants?: ProductVariant[];
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: {
    category?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    color?: string;
    sort?: string;
  };
}) {
  const supabase = createClient();

  // 1. Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "active")
    .order("display_order");

  // 2. Fetch all active catalog products to extract filter metadata (sizes, colors, price range)
  const { data: catalogProducts } = await supabase
    .from("products")
    .select("price, product_variants(size, color, stock, price_override, status)")
    .eq("status", "active");

  const catalogSizesSet = new Set<string>();
  const catalogColorsMap = new Map<string, string>(); // lowercase -> display
  let minCatalogPrice = Infinity;
  let maxCatalogPrice = 0;

  ((catalogProducts as unknown) as ProductWithVariants[] | null)?.forEach((p) => {
    if (typeof p.price === "number") {
      minCatalogPrice = Math.min(minCatalogPrice, p.price);
      maxCatalogPrice = Math.max(maxCatalogPrice, p.price);
    }
    p.product_variants?.forEach((v) => {
      if (v.status === "active" && v.stock > 0) {
        if (v.size) catalogSizesSet.add(v.size);
        if (v.color) {
          const trimmed = v.color.trim();
          if (trimmed) {
            const key = trimmed.toLowerCase();
            if (!catalogColorsMap.has(key)) {
              catalogColorsMap.set(key, trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
            }
          }
        }
        const effectivePrice = v.price_override ?? p.price;
        if (typeof effectivePrice === "number") {
          minCatalogPrice = Math.min(minCatalogPrice, effectivePrice);
          maxCatalogPrice = Math.max(maxCatalogPrice, effectivePrice);
        }
      }
    });
  });

  // Sort available sizes by STANDARD_SIZES order, then any custom sizes
  const catalogSizesList = Array.from(catalogSizesSet);
  catalogSizesList.sort((a, b) => {
    const idxA = STANDARD_SIZES.indexOf(a);
    const idxB = STANDARD_SIZES.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
  const availableSizes = catalogSizesList.length > 0 ? catalogSizesList : STANDARD_SIZES;
  const availableColors = Array.from(catalogColorsMap.values());
  const priceBounds = {
    min: isFinite(minCatalogPrice) ? minCatalogPrice : 0,
    max: maxCatalogPrice > 0 ? maxCatalogPrice : 50000,
  };

  // 3. Query products for current category & search
  let query = supabase
    .from("products")
    .select("*, categories(name, slug), product_variants(*)")
    .eq("status", "active");

  if (searchParams.category) {
    const cat = (categories as Category[] | null)?.find((c) => c.slug === searchParams.category);
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q.trim()}%`);
  }

  const { data: rawProducts } = await query.order("created_at", { ascending: false });

  // 4. In-memory variant-aware filtering for price, size, and color
  const minPriceNum = searchParams.minPrice ? Number(searchParams.minPrice) : null;
  const maxPriceNum = searchParams.maxPrice ? Number(searchParams.maxPrice) : null;
  const filterSizes = searchParams.size
    ? searchParams.size
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const filterColors = searchParams.color
    ? searchParams.color
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const filteredProducts =
    ((rawProducts as unknown) as ProductWithVariants[] | null)?.filter((p) => {
      const allVariants = p.product_variants || [];
      const activeInStockVariants = allVariants.filter((v) => v.status === "active" && v.stock > 0);

      const hasSizeFilter = filterSizes.length > 0;
      const hasColorFilter = filterColors.length > 0;
      const hasPriceFilter = minPriceNum !== null || maxPriceNum !== null;

      const getVariantPrice = (v: ProductVariant) => v.price_override ?? p.price;

      const matchesPrice = (price: number) => {
        if (minPriceNum !== null && price < minPriceNum) return false;
        if (maxPriceNum !== null && price > maxPriceNum) return false;
        return true;
      };

      // If size or color filter is selected:
      if (hasSizeFilter || hasColorFilter) {
        // Find matching active variants that have available stock
        const matchingVariants = activeInStockVariants.filter((v) => {
          const matchesSize = !hasSizeFilter || (v.size && filterSizes.includes(v.size));
          const matchesColor =
            !hasColorFilter || (v.color && filterColors.includes(v.color.trim().toLowerCase()));
          return matchesSize && matchesColor;
        });

        if (matchingVariants.length === 0) return false;

        // If price filter is also selected, check if any matching variant satisfies the price range
        if (hasPriceFilter) {
          return matchingVariants.some((v) => matchesPrice(getVariantPrice(v)));
        }

        return true;
      }

      // If neither size nor color is selected, but price filter is active:
      if (hasPriceFilter) {
        if (activeInStockVariants.length > 0) {
          return activeInStockVariants.some((v) => matchesPrice(getVariantPrice(v)));
        }
        // Products with no variants: check product base price
        return matchesPrice(p.price);
      }

      return true;
    }) ?? [];

  // 5. Sorting
  const getProductDisplayPrice = (p: ProductWithVariants) => {
    const activeVariants = (p.product_variants || []).filter((v) => v.status === "active" && v.stock > 0);
    if (activeVariants.length > 0) {
      return Math.min(...activeVariants.map((v) => v.price_override ?? p.price));
    }
    return p.price;
  };

  if (searchParams.sort === "price_asc") {
    filteredProducts.sort((a, b) => getProductDisplayPrice(a) - getProductDisplayPrice(b));
  } else if (searchParams.sort === "price_desc") {
    filteredProducts.sort((a, b) => getProductDisplayPrice(b) - getProductDisplayPrice(a));
  }

  return (
    <div>
      <TopBar title="Shop" />
      <div className="px-4 pt-4">
        <ShopFilters
          categories={(categories as Category[]) ?? []}
          availableSizes={availableSizes}
          availableColors={availableColors}
          priceBounds={priceBounds}
        />
        <div className="mt-5 grid grid-cols-2 gap-4">
          {filteredProducts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 6) * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-2 py-10 text-center text-xs text-bone/40">
              No products match your filters. Try clearing some filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
