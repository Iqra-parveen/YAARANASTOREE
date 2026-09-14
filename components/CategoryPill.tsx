import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryPill({ category }: { category: Category }) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="focus-gold group flex shrink-0 flex-col items-center gap-2"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-charcoal text-gold-dim transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-gold group-hover:text-gold group-hover:shadow-lg group-hover:shadow-gold/10 group-active:scale-95">
        <span className="font-display text-lg italic">{category.name.charAt(0)}</span>
      </div>
      <span className="text-xs text-bone/80 transition-colors duration-300 group-hover:text-gold">
        {category.name}
      </span>
    </Link>
  );
}