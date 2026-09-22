import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="border-t border-hairline px-4 py-8">
      <h2 className="font-display text-xl italic text-bone">You May Also Like</h2>
      <p className="mt-1 text-xs text-bone/50">Pieces curated to complement your look</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
