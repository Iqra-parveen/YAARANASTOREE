"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, ProductVariant } from "@/lib/types";

type LocalCartLine = {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
};

type CartContextValue = {
  lines: LocalCartLine[];
  addItem: (product: Product, variant: ProductVariant | null, qty?: number) => void;
  updateQty: (productId: string, variantId: string | null, qty: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  isDrawerOpen: boolean;
  justAdded: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  dismissAddedBanner: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "yaarana_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<LocalCartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem = useCallback((product: Product, variant: ProductVariant | null, qty = 1) => {
    setLines((prev) => {
      const idx = prev.findIndex(
        (l) => l.product.id === product.id && l.variant?.id === variant?.id
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { product, variant, quantity: qty }];
    });
    setJustAdded(true);
    setIsDrawerOpen(true);
  }, []);

  const updateQty = useCallback((productId: string, variantId: string | null, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.product.id === productId && (l.variant?.id ?? null) === variantId
            ? { ...l, quantity: qty }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string, variantId: string | null) => {
    setLines((prev) =>
      prev.filter((l) => !(l.product.id === productId && (l.variant?.id ?? null) === variantId))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const dismissAddedBanner = useCallback(() => setJustAdded(false), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const subtotal = lines.reduce(
    (sum, l) => sum + (l.variant?.price_override ?? l.product.price) * l.quantity,
    0
  );
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        lines,
        addItem,
        updateQty,
        removeItem,
        clear,
        subtotal,
        count,
        isDrawerOpen,
        justAdded,
        openDrawer,
        dismissAddedBanner,
        closeDrawer: () => {
          setJustAdded(false);
          closeDrawer();
        },
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
