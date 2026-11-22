"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore, formatINR, FREE_DELIVERY_THRESHOLD } from "@/store/StoreContext";

export default function CartDrawer() {
  const {
    items,
    cartOpen,
    closeCart,
    setQuantity,
    removeItem,
    subtotal,
    discount,
    total,
    promo,
    applyPromo,
    removePromo,
    savingsToFreeDelivery,
    freeDeliveryProgress,
  } = useStore();
  const [code, setCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoOk, setPromoOk] = useState(true);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        type="button"
        className="absolute inset-0 bg-cocoa/40 backdrop-blur-sm"
        onClick={closeCart}
        aria-label="Close cart"
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-oat shadow-lift fade-up">
        <div className="flex items-center justify-between border-b border-cocoa/10 px-6 py-5">
          <div>
            <h2 className="font-display text-2xl font-bold">Your cart</h2>
            <p className="text-xs text-cocoa/50">{count} {count === 1 ? "item" : "items"}</p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="grid h-9 w-9 place-items-center rounded-full border border-cocoa/10 bg-white/70 text-lg transition hover:bg-white"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {savingsToFreeDelivery > 0 ? (
            <div className="mb-6 rounded-2xl bg-mint/40 p-4">
              <p className="text-sm font-semibold">
                Add {formatINR(savingsToFreeDelivery)} more for free delivery
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-sky transition-all duration-500"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-cocoa/60">Free delivery over {formatINR(FREE_DELIVERY_THRESHOLD)}</p>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl bg-butter/30 p-4 text-sm font-semibold">
              You&apos;ve unlocked free delivery. Good dog!
            </div>
          )}

          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-5xl">🐕</p>
              <p className="mt-4 font-display text-xl font-bold">Your cart is empty</p>
              <p className="mt-2 text-sm text-cocoa/60">Let&apos;s find the right vault for your dog.</p>
              <Link href="/#configure" onClick={closeCart} className="btn-primary mt-6">
                Explore PawVault
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 rounded-2xl border border-cocoa/10 bg-white/70 p-3">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-blush/40 text-2xl">
                    {item.kind === "product" ? "🐾" : "🎁"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="truncate text-xs text-cocoa/50">
                      {[item.color, item.dogSize, item.dogName && `for ${item.dogName}`]
                        .filter(Boolean).join(" · ") || "Add-on"}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-cocoa/15">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-8 text-sm font-bold"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >−</button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-8 text-sm font-bold"
                          aria-label={`Increase quantity of ${item.name}`}
                        >+</button>
                      </div>
                      <span className="text-sm font-bold">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="self-start text-lg text-cocoa/40 transition hover:text-cocoa"
                    aria-label={`Remove ${item.name}`}
                  >×</button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-t border-cocoa/10 pt-5">
            <label htmlFor="promo" className="eyebrow">Have a promo code?</label>
            <div className="mt-2 flex gap-2">
              <input
                id="promo"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="GOODBOY15"
                className="field"
              />
              <button
                type="button"
                onClick={() => {
                  const result = applyPromo(code);
                  setPromoMessage(result.message);
                  setPromoOk(result.ok);
                }}
                className="btn-primary shrink-0"
              >Apply</button>
            </div>
            {promoMessage && (
              <p className={`mt-2 text-xs ${promoOk ? "text-emerald-700" : "text-red-600"}`}>{promoMessage}</p>
            )}
            {promo && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-butter/25 px-3 py-2 text-xs font-semibold">
                <span>{promo.code} — {promo.label}</span>
                <button type="button" onClick={() => { removePromo(); setPromoMessage(""); }} className="underline">
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-cocoa/10 bg-white/60 px-6 py-5">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-cocoa/70"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700"><span>Discount</span><span>−{formatINR(discount)}</span></div>
            )}
            <div className="flex justify-between text-cocoa/70"><span>Delivery</span><span>{subtotal >= FREE_DELIVERY_THRESHOLD ? "Free" : "Calculated at checkout"}</span></div>
            <div className="flex justify-between border-t border-cocoa/10 pt-2 text-lg font-bold">
              <span>Total</span><span>{formatINR(total)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            onClick={closeCart}
            className={`btn-primary mt-4 w-full ${items.length === 0 ? "pointer-events-none opacity-50" : ""}`}
          >
            Continue to checkout →
          </Link>
        </div>
      </aside>
    </div>
  );
}
