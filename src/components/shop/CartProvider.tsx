"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { bundleFor, type BundleState } from "@/lib/bundle";
import { shippingCentsFor } from "@/lib/brand";

export type CartItem = {
  slug: string;
  qty: number;
  selected: Record<string, string>; // option nameEn -> value
  // display snapshot (server re-validates price at checkout)
  nameFr: string;
  nameEn: string;
  priceCents: number;
  image: string | null;
  tags: string[];
  optionLabelsFr: Record<string, string>;
  optionLabelsEn: Record<string, string>;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  /** Sum of list prices, before the build-your-own-set tier. */
  listCents: number;
  /** Build-your-own-set tier (src/lib/bundle.ts). */
  bundle: BundleState;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  hydrated: boolean;
  add: (item: CartItem) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  /** Replace the whole cart (restore link from a reminder email). */
  replace: (items: CartItem[]) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "cmac-cart";
const MAX_QTY = 10;

function sameLine(a: CartItem, b: CartItem) {
  return a.slug === b.slug && JSON.stringify(a.selected) === JSON.stringify(b.selected);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (deferred to a task so React's
  // "no synchronous setState in effects" rule is respected).
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch {
        /* ignore */
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => sameLine(p, item));
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(MAX_QTY, next[i].qty + item.qty) };
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const setQty = useCallback((index: number, qty: number) => {
    setItems((prev) =>
      prev.map((p, i) => (i === index ? { ...p, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : p)),
    );
  }, []);

  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const replace = useCallback((next: CartItem[]) => setItems(next.slice(0, 20)), []);

  const value = useMemo<CartCtx>(() => {
    const listCents = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
    const bundle = bundleFor(items);
    const subtotalCents = listCents - bundle.savingCents;
    const shippingCents = items.length ? shippingCentsFor(subtotalCents) : 0;
    return {
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      listCents,
      bundle,
      subtotalCents,
      shippingCents,
      totalCents: subtotalCents + shippingCents,
      hydrated,
      add,
      setQty,
      remove,
      clear,
      replace,
    };
  }, [items, hydrated, add, setQty, remove, clear, replace]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
