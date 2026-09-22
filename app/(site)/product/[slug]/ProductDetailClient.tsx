"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Sparkles,
  Ruler,
  Heart,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
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
  const gallery: GalleryItem[] = useMemo(() => {
    const items: GalleryItem[] = [];
    if (product.image_url) items.push({ url: product.image_url, media_type: product.media_type });
    images.forEach((img) => items.push({ url: img.url, media_type: img.media_type }));
    return items;
  }, [product.image_url, product.media_type, images]);

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

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
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
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
      {/* Product Media Gallery */}
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
            className="cursor-pointer"
            onClick={() => {
              if (current?.media_type === "image") {
                setIsZoomed(false);
                setLightboxOpen(true);
              }
            }}
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
                <div className="relative">
                  <img
                    src={current.url}
                    alt={product.name}
                    className="max-h-[80vh] w-full select-none object-contain"
                    draggable={false}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] text-bone/70 backdrop-blur shadow-sm pointer-events-none">
                    <ZoomIn size={12} />
                    <span>Tap to zoom</span>
                  </div>
                </div>
              )
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center text-gold-dim">
                <span className="font-display text-2xl italic">YAARANA</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gallery Indicators / Thumbnails */}
      {gallery.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3 pt-2">
          {gallery.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              aria-label={`Go to image ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeImage ? "w-6 bg-gold" : "w-1.5 bg-hairline hover:bg-bone/30"
              )}
            />
          ))}
        </div>
      )}

      {/* Product Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="px-4 pt-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl italic text-bone">{product.name}</h1>
            {product.categories && (
              <p className="mt-0.5 text-xs text-bone/50">{product.categories.name}</p>
            )}
          </div>
          {onSale ? (
            <div className="text-right">
              <p className="text-xs text-bone/40 line-through">
                {formatPrice(product.compare_at_price as number)}
              </p>
              <p className="font-display text-2xl italic text-rust">{formatPrice(price)}</p>
            </div>
          ) : (
            <p className="font-display text-2xl italic text-gold">{formatPrice(price)}</p>
          )}
        </div>

        {/* Color Selection */}
        {colors.length > 0 && (
          <div className="mt-6 border-t border-hairline pt-4">
            <p className="mb-2 text-xs text-bone/60">
              Color: <span className="capitalize text-bone">{color}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "focus-gold rounded-sm border px-3 py-1.5 text-xs capitalize transition-all",
                    color === c
                      ? "border-gold bg-gold/10 font-medium text-gold"
                      : "border-hairline bg-charcoal text-bone/80 hover:border-gold/50"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {sizes.length > 0 && (
          <div className="mt-4 border-t border-hairline pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-bone/60">
                Size: <span className="text-bone">{size}</span>
              </p>
              {sizeGuide && (
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="focus-gold inline-flex items-center gap-1 text-xs text-gold underline underline-offset-2 hover:text-gold-light"
                >
                  <Ruler size={13} />
                  <span>Size guide</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const vForSize = variants.find(
                  (v) => v.size === s && (!colors.length || v.color === color)
                );
                const out = (vForSize?.stock ?? 0) === 0;
                return (
                  <button
                    key={s}
                    disabled={out}
                    onClick={() => setSize(s)}
                    className={cn(
                      "focus-gold min-w-10 rounded-sm border py-2 text-xs transition-all",
                      out
                        ? "cursor-not-allowed border-hairline/40 text-bone/25 line-through"
                        : size === s
                        ? "border-gold bg-gold/10 font-medium text-gold"
                        : "border-hairline bg-charcoal text-bone/80 hover:border-gold/50"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        {inStock && (
          <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
            <span className="text-xs text-bone/60">Quantity</span>
            <div className="flex items-center gap-2 rounded-sm border border-hairline bg-charcoal px-2 py-1">
              <button
                type="button"
                onClick={() => setQty((q) => clampQty(q - 1))}
                disabled={qty <= 1}
                className="focus-gold text-bone/70 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center text-sm text-bone">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => clampQty(q + 1))}
                disabled={qty >= maxQty}
                className="focus-gold text-bone/70 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mt-6 border-t border-hairline pt-4">
            <p className="mb-1 text-xs text-bone/60">Description</p>
            <p className="text-sm leading-relaxed text-bone/80">{product.description}</p>
          </div>
        )}

        {/* Styling Tip */}
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

      {/* Sticky Bottom Action Bar with Wishlist Button */}
      <div className="sticky bottom-16 mt-6 flex items-center gap-2.5 border-t border-hairline bg-ink px-4 py-3 backdrop-blur z-20">
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "focus-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border transition-all active:scale-95",
            wishlisted
              ? "border-rust/40 bg-rust/10 text-rust"
              : "border-hairline bg-charcoal text-bone/70 hover:text-gold hover:border-gold/40"
          )}
        >
          <Heart size={18} className={wishlisted ? "fill-rust text-rust" : ""} />
        </button>

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

      {/* Size Guide Modal */}
      {sizeGuide && (
        <SizeGuideModal
          guide={sizeGuide}
          isOpen={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
        />
      )}

      {/* Fullscreen Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && current?.media_type === "image" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Lightbox Controls */}
            <div
              className="absolute top-4 right-4 z-10 flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsZoomed((z) => !z)}
                className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              >
                {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
              </button>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Close image zoom"
              >
                <X size={20} />
              </button>
            </div>

            {/* Prev / Next Buttons */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(false);
                    setActiveImage((i) => (i > 0 ? i - 1 : gallery.length - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors z-10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(false);
                    setActiveImage((i) => (i < gallery.length - 1 ? i + 1 : 0));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors z-10"
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Centered Image */}
            <div
              className={cn(
                "relative max-h-[85vh] max-w-[95vw] overflow-auto transition-transform duration-300",
                isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed((z) => !z);
              }}
            >
              <img
                src={current.url}
                alt={product.name}
                className="max-h-[80vh] max-w-[90vw] object-contain select-none"
                draggable={false}
              />
            </div>

            <p className="absolute bottom-4 text-xs text-white/50">
              {activeImage + 1} / {gallery.length} &bull; Tap image to {isZoomed ? "zoom out" : "zoom in"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}