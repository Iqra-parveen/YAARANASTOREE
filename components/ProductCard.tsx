import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="focus-gold group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-charcoal">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 50vw, 240px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gold-dim">
            <span className="font-display italic">YAARANA</span>
          </div>
        )}
        {product.featured && (
          <span className="absolute left-2 top-2 border border-gold bg-ink/80 px-2 py-0.5 text-[10px] tracking-wide text-gold">
            Featured
          </span>
        )}
        {product.quantity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70">
            <span className="text-xs tracking-wide text-bone/80">Sold out</span>
          </div>
        )}
      </div>
      <div className="pt-2">
        <p className="truncate text-sm text-bone">{product.name}</p>
        <p className="text-sm text-gold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
