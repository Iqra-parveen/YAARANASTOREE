"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Minus, Plus, Sparkles, Ruler } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import Button from "@/components/ui/Button";
import SizeGuideModal from "@/components/SizeGuideModal";
import { formatPrice, cn, isOnSale } from "@/lib/utils";
import type { Product, ProductVariant, ProductImage, SizeGuide } from "@/lib/types";

type GalleryItem = { url: string; media_type: "image" | "video" };

export default function ProductDetailClient({
  product,
  variants,
  images,
  sizeGuide,
}: {
  product: Product;
  variants: ProductVariant[];
  images: ProductImage[];
  sizeGuide: SizeGuide | null;
}) {
  // Cover photo (product.image_url) always comes first, then any additional
  // gallery photos the admin added.
  const gallery: GalleryItem[] = useMemo(() => {
    const items: GalleryItem[] = [];
    if (product.image_url) items.push({ url: product.image_url, media_type: product.media_type });
    images.forEach((img) => items.push({ url: img.url, media_type: img.media_type }));
    return items;
  }, [product.image_url, product.media_type, images]);

  const [activeImage, setActiveImage] = useState(0);

  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[],
    [variants]
  );
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[],
    [variants]
  );
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [qty, setQty] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { addItem, closeDrawer } = useCart();
  const router = useRouter();

  const selectedVariant =
    variants.find((v) => (!sizes.length || v.size === size) && (!colors.length || v.color === color)) ??
    null;

  const maxQty = variants.length > 0 ? selectedVariant?.stock ?? 0 : product.quantity;
  const inStock = maxQty > 0;
  const price = selectedVariant?.price_override ?? product.price;
  const onSale = isOnSale(product) && !selectedVariant?.price_override;

  function clampQty(n: number) {
    return Math.max(1, Math.min(n, Math.max(maxQty, 1)));
  }

  function handleAdd() {
    addItem(product, selectedVariant, qty);
    // Drawer opens automatically via CartProvider — user stays on this page.
  }

  function handleBuyNow() {
    addItem(product, selectedVariant, qty);
    closeDrawer();
    router.push("/checkout");
  }

  const current = gallery[activeImage];

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    const SWIPE_THRESHOLD = 50;
    if (info.offset.x < -SWIPE_THRESHOLD && activeImage < gallery.length - 1) {
      setActiveImage((i) => i + 1);
    } else if (info.offset.x > SWIPE_THRESHOLD && activeImage > 0) {
      setActiveImage((i) => i - 1);
    }
  }

  return (
    <div>
      <div className="relative w-full overflow-hidden bg-charcoal">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            drag={gallery.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {current ? (
              current.media_type === "video" ? (
                <video
                  src={current.url}
                  className="max-h-[70vh] w-full object-contain"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                // Plain <img> with natural sizing (w-full, h-auto) instead of a
                // fixed-height box: the container shrinks/grows to match the
                // image's own proportions, so the whole photo shows with no
                // cropping AND no letterbox bars. max-h caps only extreme outliers.
                <img
                  src={current.url}
                  alt={product.name}
                  className="max-h-[80vh] w-full select-none object-contain"
                  draggable={false}
                />
              )
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center text-gold-dim">
                <span className="font-display text-2xl italic">YAARANA</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {gallery.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3 pt-2">
          {gallery.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              aria-label={`Go to image ${i + 1}`}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i === activeImage ? "bg-bone" : "bg-bone/20"
              )}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="px-4 pt-2"
      >
        <div className="flex items-center justify-between">
          {product.categories?.name && (
            <p className="text-xs text-gold-dim">{product.categories.name}</p>
          )}
          {product.sku && <p className="text-xs text-bone/40">SKU: {product.sku}</p>}
        </div>

        <h1 className="mt-1 font-display text-2xl text-bone">{product.name}</h1>

        {onSale ? (
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-sm text-bone/40 line-through">
              {formatPrice(product.compare_at_price as number)}
            </span>
            <span className="text-lg text-rust">{formatPrice(price)}</span>
            <span className="border border-rust px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-rust">
              Sale
            </span>
          </p>
        ) : (
          <p className="mt-1 text-lg text-gold">{formatPrice(price)}</p>
        )}

        {sizes.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-bone/60">Size</p>
              {sizeGuide && (
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="focus-gold flex items-center gap-1 text-xs text-gold"
                >
                  <Ruler size={12} />
                  Size guide
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setQty(1);
                  }}
                  className={cn(
                    "focus-gold min-w-11 rounded-sm border px-3 py-2 text-sm transition-colors",
                    size === s ? "border-gold text-gold" : "border-hairline text-bone/70"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-bone/60">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setQty(1);
                  }}
                  className={cn(
                    "focus-gold rounded-sm border px-3 py-2 text-sm transition-colors",
                    color === c ? "border-gold text-gold" : "border-hairline text-bone/70"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {inStock && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-bone/60">Quantity</p>
            <div className="flex w-fit items-center gap-4 border border-hairline px-3 py-2">
              <button
                onClick={() => setQty((q) => clampQty(q - 1))}
                disabled={qty <= 1}
                className="focus-gold text-bone/70 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center text-sm text-bone">{qty}</span>
              <button
                onClick={() => setQty((q) => clampQty(q + 1))}
                disabled={qty >= maxQty}
                className="focus-gold text-bone/70 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            {maxQty <= 5 && (
              <p className="mt-1 text-xs text-gold-dim">Only {maxQty} left in stock</p>
            )}
          </div>
        )}

        {product.description && (
          <div className="mt-6 border-t border-hairline pt-4">
            <p className="mb-1 text-xs text-bone/60">Description</p>
            <p className="text-sm leading-relaxed text-bone/80">{product.description}</p>
          </div>
        )}

        {product.styling_tip && (
          <div className="mt-4 flex gap-2 border border-gold/30 bg-gold/5 p-3">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wide text-gold">Styling tip</p>
              <p className="mt-1 text-sm leading-relaxed text-bone/80">{product.styling_tip}</p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="sticky bottom-16 mt-6 flex gap-3 border-t border-hairline bg-ink px-4 py-3">
        {inStock ? (
          <>
            <Button variant="secondary" onClick={handleAdd} className="!w-auto flex-1">
              Add to cart
            </Button>
            <Button onClick={handleBuyNow} className="!w-auto flex-1">
              Buy Now
            </Button>
          </>
        ) : (
          <Button disabled className="flex-1">
            Sold out
          </Button>
        )}
      </div>

      {sizeGuide && (
        <SizeGuideModal guide={sizeGuide} isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      )}
    </div>
  );
}