import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryPill({ category }: { category: Category }) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="focus-gold flex shrink-0 flex-col items-center gap-2"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-charcoal text-gold-dim">
        <span className="font-display text-lg italic">{category.name.charAt(0)}</span>
      </div>
      <span className="text-xs text-bone/80">{category.name}</span>
    </Link>
  );
}
