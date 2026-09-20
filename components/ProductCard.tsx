import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice, isOnSale } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const onSale = isOnSale(product);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="focus-gold group block transition-transform duration-300 ease-out hover:-translate-y-1 active:scale-[0.97]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-charcoal ring-1 ring-transparent transition-all duration-300 group-hover:shadow-lg group-hover:shadow-gold/10 group-hover:ring-gold/40">
        {product.image_url ? (
          product.media_type === "video" ? (
            <video
              src={product.image_url}
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 50vw, 240px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-gold-dim">
            <span className="font-display italic">YAARANA</span>
          </div>
        )}
        {onSale ? (
          <span className="absolute left-2 top-2 border border-rust bg-ink/80 px-2 py-0.5 text-[10px] tracking-wide text-rust">
            Sale
          </span>
        ) : (
          product.featured && (
            <span className="absolute left-2 top-2 border border-gold bg-ink/80 px-2 py-0.5 text-[10px] tracking-wide text-gold">
              Featured
            </span>
          )
        )}
        {product.quantity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70">
            <span className="text-xs tracking-wide text-bone/80">Sold out</span>
          </div>
        )}
      </div>
      <div className="pt-2">
        <p className="truncate text-sm text-bone">{product.name}</p>
        {onSale ? (
          <p className="flex items-baseline gap-1.5">
            <span className="text-xs text-bone/40 line-through">
              {formatPrice(product.compare_at_price as number)}
            </span>
            <span className="text-sm text-rust">{formatPrice(product.price)}</span>
          </p>
        ) : (
          <p className="text-sm text-gold">{formatPrice(product.price)}</p>
        )}
      </div>
    </Link>
  );
}