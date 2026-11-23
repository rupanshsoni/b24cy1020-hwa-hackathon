"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useStore,
  formatINR,
  FREE_DELIVERY_THRESHOLD,
} from "@/store/StoreContext";
import { getProduct } from "@/data/products";
import {
  PawIcon,
  EmptyBowlDogIcon,
  AddonBoxIcon,
  MinusIcon,
  PlusIcon,
  CloseIcon,
  ArrowRightIcon,
} from "@/components/icons/PawVaultIcons";

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  function productImage(item: (typeof items)[number]): string | null {
    if (item.kind !== "product") return null;
    const productId = item.id.replace(/^product-/, "").split("-")[0];
    return getProduct(productId)?.image ?? null;
  }

  function submitPromo() {
    const result = applyPromo(code);
    setPromoMessage(result.message);
    setPromoOk(result.ok);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      <button
        type="button"
        className="absolute inset-0 bg-pine-base/60 backdrop-blur-sm"
        onClick={closeCart}
        aria-label="Close cart"
      />
      <aside className="fade-up relative flex h-full w-full max-w-md flex-col bg-sand shadow-lift">
        <div className="flex items-center justify-between border-b border-cream/15 bg-pine px-6 py-5 text-cream">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-butter text-pine">
              <PawIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold">Your cart</h2>
              <p className="text-sm text-cream/60">
                {count} {count === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 bg-cream/10 transition hover:bg-cream/20"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {savingsToFreeDelivery > 0 ? (
            <div className="mb-6 rounded-2xl border border-mint/60 bg-mint/40 p-4">
              <p className="text-sm font-semibold text-pine">
                Add {formatINR(savingsToFreeDelivery)} more for free delivery
              </p>
              <div
                className="mt-3 h-2.5 overflow-hidden rounded-full bg-cream"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={freeDeliveryProgress}
                aria-label="Progress toward free delivery"
              >
                <div
                  className="h-full rounded-full bg-pine transition-all duration-500"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-pine/70">
                Free delivery over {formatINR(FREE_DELIVERY_THRESHOLD)}
              </p>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-mint bg-mint px-4 py-3 text-sm font-bold text-pine">
              You have unlocked free delivery. Good dog!
            </div>
          )}

          {items.length === 0 ? (
            <div className="py-16 text-center">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-cream text-pine">
                <EmptyBowlDogIcon className="h-10 w-10" />
              </span>
              <p className="mt-5 font-display text-xl font-bold text-pine">
                Your cart is empty
              </p>
              <p className="mt-2 text-sm text-pine/60">
                Let us find the right vault for your dog.
              </p>
              <Link href="/#configure" onClick={closeCart} className="btn-primary mt-6">
                Explore PawVault
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const image = productImage(item);
                return (
                  <li
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-pine/10 bg-cream p-3"
                  >
                    <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-pine/10 bg-sand-deep/50">
                      {image ? (
                        <Image
                          src={image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      ) : (
                        <AddonBoxIcon className="h-7 w-7 text-pine" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-bold text-pine">
                          {item.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="shrink-0 rounded-full text-pine/45 transition hover:bg-sand hover:text-error"
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="truncate text-xs text-pine/55">
                        {[item.color, item.dogSize, item.dogName && `for ${item.dogName}`]
                          .filter(Boolean)
                          .join(" / ") || "Add-on"}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-pine/20 bg-sand/70">
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="grid h-8 w-8 place-items-center rounded-full text-pine transition hover:bg-mint"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="tnum w-6 text-center text-xs font-bold text-pine">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="grid h-8 w-8 place-items-center rounded-full text-pine transition hover:bg-mint"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="tnum text-sm font-bold text-pine">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-6 border-t border-pine/10 pt-5">
            <label htmlFor="promo" className="eyebrow text-pine">
              Have a promo code?
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="promo"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitPromo();
                }}
                placeholder="GOODBOY15"
                className="field uppercase"
              />
              <button type="button" onClick={submitPromo} className="btn-primary shrink-0">
                Apply
              </button>
            </div>
            {promoMessage && (
              <p
                role={promoOk ? "status" : "alert"}
                aria-live={promoOk ? "polite" : "assertive"}
                className={`mt-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                  promoOk ? "bg-mint text-pine" : "bg-cream text-error"
                }`}
              >
                {promoMessage}
              </p>
            )}
            {promo && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-mint px-3 py-2 text-xs font-bold text-pine">
                <span>{promo.code} / {promo.label} applied</span>
                <button
                  type="button"
                  onClick={() => {
                    removePromo();
                    setPromoMessage("");
                  }}
                  className="underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-pine/10 bg-cream px-6 py-5">
          <div className="space-y-1.5 text-sm text-pine">
            <div className="tnum flex justify-between text-pine/70">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="tnum flex justify-between text-pine">
                <span>Discount</span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-pine/70">
              <span>Delivery</span>
              <span>
                {subtotal >= FREE_DELIVERY_THRESHOLD
                  ? "Free"
                  : "Calculated at checkout"}
              </span>
            </div>
            <div className="tnum flex justify-between border-t border-pine/10 pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            onClick={closeCart}
            className={`btn-primary mt-4 w-full ${
              items.length === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Continue to checkout
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
