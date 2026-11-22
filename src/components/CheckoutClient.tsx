"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, formatINR } from "@/store/StoreContext";

type FieldErrors = Record<string, string>;

export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, discount, total, promo, clearCart } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", pincode: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [`customer.${key}`]: "" }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setApiError("");
    setErrors({});

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { ...form, paymentMethod },
          items: items.map((i) => ({
            id: i.id, name: i.name, price: i.price, quantity: i.quantity,
            color: i.color, dogSize: i.dogSize, dogName: i.dogName,
          })),
          promoCode: promo?.code ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setApiError(data.error || "Something went wrong. Please try again.");
        return;
      }
      clearCart();
      router.push(`/track?id=${encodeURIComponent(data.order.id)}&new=1`);
    } catch {
      setApiError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="section-shell py-24 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="display-title mt-6">Your cart is empty</h1>
        <p className="mt-3 text-cocoa/60">Add a PawVault before heading to checkout.</p>
        <Link href="/#configure" className="btn-primary mt-8">Configure your vault</Link>
      </div>
    );
  }

  const fields: { key: keyof typeof form; label: string; type?: string; placeholder: string }[] = [
    { key: "name", label: "Full name", placeholder: "Asha Sharma" },
    { key: "email", label: "Email address", type: "email", placeholder: "asha@example.com" },
    { key: "phone", label: "Phone number", type: "tel", placeholder: "9876543210" },
    { key: "address", label: "Delivery address", placeholder: "Flat, building, street" },
    { key: "city", label: "City", placeholder: "Bengaluru" },
    { key: "pincode", label: "PIN code", placeholder: "560001" },
  ];

  return (
    <main className="section-shell py-12">
      <div className="mb-8">
        <p className="eyebrow">Almost there</p>
        <h1 className="display-title mt-2">Checkout</h1>
      </div>

      {apiError && (
        <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">Delivery details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {fields.map((f) => {
                const key = `customer.${f.key}`;
                return (
                  <div key={f.key} className={f.key === "address" ? "sm:col-span-2" : ""}>
                    <label htmlFor={f.key} className="mb-1.5 block text-sm font-semibold">{f.label}</label>
                    <input
                      id={f.key}
                      type={f.type ?? "text"}
                      value={form[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className={`field ${errors[key] ? "border-red-400" : ""}`}
                    />
                    {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">Payment method</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {([
                { id: "upi", label: "UPI", icon: "📱" },
                { id: "card", label: "Card", icon: "💳" },
                { id: "cod", label: "Cash on Delivery", icon: "💵" },
              ] as const).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    paymentMethod === m.id
                      ? "border-sky bg-sky/10 ring-4 ring-sky/15"
                      : "border-cocoa/15 bg-white/60 hover:border-cocoa/30"
                  }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <p className="mt-2 text-sm font-bold">{m.label}</p>
                </button>
              ))}
            </div>
            {errors["customer.paymentMethod"] && (
              <p className="mt-2 text-xs text-red-600">{errors["customer.paymentMethod"]}</p>
            )}
            <p className="mt-4 text-xs text-cocoa/50">
              Demo checkout — no real payment is collected. Your order is confirmed instantly.
            </p>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <section className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">Order summary</h2>
            <ul className="mt-5 space-y-3 border-b border-cocoa/10 pb-5">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 text-sm">
                  <span className="text-cocoa/70">{item.name} × {item.quantity}</span>
                  <span className="font-semibold">{formatINR(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-cocoa/60">Subtotal</span><span>{formatINR(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700"><span>{promo?.code} discount</span><span>−{formatINR(discount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-cocoa/60">Delivery</span><span>{subtotal >= 3000 ? "Free" : "Flat Rs 99"}</span></div>
              <div className="flex justify-between border-t border-cocoa/10 pt-3 text-lg font-bold">
                <span>Total</span><span>{formatINR(total)}</span>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
              {submitting ? "Placing order…" : `Place order · ${formatINR(total)}`}
            </button>
            <p className="mt-3 text-center text-xs text-cocoa/50">
              You&apos;ll get a PV-2026-XXXX order ID to track anytime.
            </p>
          </section>
        </aside>
      </form>
    </main>
  );
}
