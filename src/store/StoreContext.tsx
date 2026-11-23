"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAddOn } from "@/data/addons";
import { getProduct } from "@/data/products";
import { FREE_DELIVERY_THRESHOLD, promos, type Promo } from "@/data/promos";

export { FREE_DELIVERY_THRESHOLD };

export type CartItem = {
  id: string;
  kind: "product" | "addon";
  name: string;
  price: number;
  quantity: number;
  color?: string;
  dogSize?: string;
  dogName?: string;
};

type StoreContextValue = {
  items: CartItem[];
  dogName: string;
  promo: Promo | null;
  cartOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDogName: (name: string) => void;
  applyPromo: (code: string) => { ok: boolean; message: string };
  removePromo: () => void;
  openCart: () => void;
  closeCart: () => void;
  subtotal: number;
  discount: number;
  total: number;
  savingsToFreeDelivery: number;
  freeDeliveryProgress: number;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEY = "pawvault-store-v1";

type Persisted = {
  items: CartItem[];
  dogName: string;
  promoCode: string | null;
};

function loadPersisted(): Persisted {
  if (typeof window === "undefined") {
    return { items: [], dogName: "Bruno", promoCode: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], dogName: "Bruno", promoCode: null };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      dogName: typeof parsed.dogName === "string" && parsed.dogName.trim() ? parsed.dogName : "Bruno",
      promoCode: typeof parsed.promoCode === "string" ? parsed.promoCode : null,
    };
  } catch {
    return { items: [], dogName: "Bruno", promoCode: null };
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [dogName, setDogNameState] = useState("Bruno");
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadPersisted();
    setItems(saved.items);
    setDogNameState(saved.dogName);
    setPromoCode(saved.promoCode);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: Persisted = { items, dogName, promoCode };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // storage may be unavailable; the in-memory cart still works
    }
  }, [items, dogName, promoCode, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const key = [item.id, item.color ?? "", item.dogSize ?? "", item.dogName ?? ""].join("|");
      const existing = prev.find(
        (i) => [i.id, i.color ?? "", i.dogSize ?? "", i.dogName ?? ""].join("|") === key,
      );
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...item, quantity }];
    });
    setCartOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode(null);
  }, []);

  const setDogName = useCallback((name: string) => {
    setDogNameState(name.trim() || "Bruno");
  }, []);

  const applyPromo = useCallback((code: string) => {
    const found = promos.find((p) => p.code === code.trim().toUpperCase());
    if (!found) return { ok: false, message: "That code isn't valid. Try GOODBOY15 or CALMPUP10." };
    setPromoCode(found.code);
    return { ok: true, message: `${found.label} applied, good dog!` };
  }, []);

  const removePromo = useCallback(() => setPromoCode(null), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const promo = useMemo(() => promos.find((p) => p.code === promoCode) ?? null, [promoCode]);
  const discount = promo ? Math.round(subtotal * (promo.percent / 100)) : 0;
  const total = Math.max(0, subtotal - discount);
  const savingsToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  const value = useMemo<StoreContextValue>(
    () => ({
      items,
      dogName,
      promo,
      cartOpen,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      setDogName,
      applyPromo,
      removePromo,
      openCart,
      closeCart,
      subtotal,
      discount,
      total,
      savingsToFreeDelivery,
      freeDeliveryProgress,
    }),
    [
      items,
      dogName,
      promo,
      cartOpen,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      setDogName,
      applyPromo,
      removePromo,
      openCart,
      closeCart,
      subtotal,
      discount,
      total,
      savingsToFreeDelivery,
      freeDeliveryProgress,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function formatINR(amount: number): string {
  return "Rs " + amount.toLocaleString("en-IN");
}

export function productItem(productId: string, color: string, dogSize: string, dogName: string) {
  const product = getProduct(productId);
  if (!product) return null;
  return {
    id: `product-${productId}-${color}-${dogSize}-${dogName.toLowerCase()}`,
    kind: "product" as const,
    name: product.name,
    price: product.price,
    color,
    dogSize,
    dogName,
  };
}

export function addonItem(addOnId: string) {
  const addon = getAddOn(addOnId);
  if (!addon) return null;
  return {
    id: `addon-${addon.id}`,
    kind: "addon" as const,
    name: addon.name,
    price: addon.price,
  };
}
