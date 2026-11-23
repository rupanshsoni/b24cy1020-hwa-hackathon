"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useStore,
  formatINR,
  FREE_DELIVERY_THRESHOLD,
} from "@/store/StoreContext";
import {
  PawIcon,
  CartBagIcon,
  UpiPhoneIcon,
  CardChipIcon,
  CashNoteIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@/components/icons/PawVaultIcons";

type FieldErrors = Record<string, string>;

type PlacedOrder = {
  id: string;
  status: string;
  createdAt: string;
  customer: { name: string; city: string; paymentMethod: string };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    color?: string;
    dogSize?: string;
    dogName?: string;
  }[];
  promoCode: string | null;
  subtotal: number;
  discount: number;
  total: number;
  freeDelivery: boolean;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

const paymentMethods = [
  { id: "upi", label: "UPI", detail: "Pay by any UPI app", Icon: UpiPhoneIcon },
  { id: "card", label: "Card", detail: "Debit or credit card", Icon: CardChipIcon },
  { id: "cod", label: "Cash on Delivery", detail: "Pay at your door", Icon: CashNoteIcon },
] as const;

function validate(form: FormState, paymentMethod: string): FieldErrors {
  const errors: FieldErrors = {};
  if (form.name.trim().length < 2) {
    errors["customer.name"] = "Enter your full name (at least 2 characters).";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors["customer.email"] = "Enter a valid email address.";
  }
  if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
    errors["customer.phone"] = "Enter a valid 10-digit phone number.";
  }
  if (form.address.trim().length < 6) {
    errors["customer.address"] = "Enter a complete delivery address.";
  }
  if (form.city.trim().length < 2) {
    errors["customer.city"] = "Enter your city.";
  }
  if (!/^\d{6}$/.test(form.pincode.trim())) {
    errors["customer.pincode"] = "Enter a valid 6-digit pincode.";
  }
  if (!["upi", "card", "cod"].includes(paymentMethod)) {
    errors["customer.paymentMethod"] = "Choose a payment method.";
  }
  return errors;
}

export default function CheckoutClient() {
  const { items, subtotal, discount, total, promo, clearCart } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [confirmed, setConfirmed] = useState<PlacedOrder | null>(null);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [`customer.${key}`]: "" }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const localErrors = validate(form, paymentMethod);
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      setApiError("Please check the highlighted fields.");
      return;
    }

    setSubmitting(true);
    setApiError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { ...form, paymentMethod },
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            color: i.color,
            dogSize: i.dogSize,
            dogName: i.dogName,
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
      setConfirmed(data.order as PlacedOrder);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setApiError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-sand">
        <header className="bg-pine text-cream" data-nav-theme="dark">
          <div className="section-shell py-12">
            <p className="eyebrow text-mint">Order confirmed</p>
            <h1 className="display-title mt-2">Good dog. It is on its way.</h1>
          </div>
        </header>

        <div className="section-shell py-12">
          <section className="card p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-mint text-pine">
                <CheckCircleIcon className="h-8 w-8" />
              </span>
              <div>
                <p className="eyebrow text-pine">Your order ID</p>
                <p className="font-display text-3xl font-bold tracking-tight text-pine sm:text-4xl">
                  {confirmed.id}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-2xl leading-relaxed text-pine/70">
              Thank you, {confirmed.customer.name}. We have sent a confirmation
              and will keep you posted as your PawVault makes its way to{" "}
              {confirmed.customer.city}.
            </p>

            <div className="mt-8 rounded-2xl border border-pine/10 bg-cream p-5 sm:p-6">
              <h2 className="font-display text-xl font-bold text-pine">
                Itemized receipt
              </h2>
              <ul className="mt-4 space-y-2 border-b border-pine/10 pb-4 text-sm text-pine">
                {confirmed.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span className="text-pine/70">
                      {item.name} / {item.quantity}
                    </span>
                    <span className="tnum font-semibold">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="tnum mt-4 space-y-1.5 text-sm text-pine">
                <div className="flex justify-between text-pine/70">
                  <span>Subtotal</span>
                  <span>{formatINR(confirmed.subtotal)}</span>
                </div>
                {confirmed.discount > 0 && (
                  <div className="flex justify-between font-semibold">
                    <span>{confirmed.promoCode} discount</span>
                    <span>-{formatINR(confirmed.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-pine/70">
                  <span>Delivery</span>
                  <span>{confirmed.freeDelivery ? "Free" : "Rs 99"}</span>
                </div>
                <div className="flex justify-between border-t border-pine/10 pt-2 text-lg font-bold">
                  <span>Total paid via {confirmed.customer.paymentMethod.toUpperCase()}</span>
                  <span>{formatINR(confirmed.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/track?id=${encodeURIComponent(confirmed.id)}&new=1`}
                className="btn-primary btn-magnetic"
              >
                Track your order
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link href="/#configure" className="btn-ghost btn-magnetic">
                Build another vault
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-sand">
        <header className="bg-pine text-cream" data-nav-theme="dark">
          <div className="section-shell py-12">
            <p className="eyebrow text-mint">Almost there</p>
            <h1 className="display-title mt-2">Checkout</h1>
          </div>
        </header>
        <div className="section-shell py-24 text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-cream text-pine">
            <CartBagIcon className="h-10 w-10" />
          </span>
          <h2 className="display-title mt-6 text-pine">Your cart is empty</h2>
          <p className="mt-3 text-pine/60">
            Add a PawVault before heading to checkout.
          </p>
          <Link href="/#configure" className="btn-primary mt-8">
            Configure your vault
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  const fields: {
    key: keyof FormState;
    label: string;
    type?: string;
    placeholder: string;
  }[] = [
    { key: "name", label: "Full name", placeholder: "Asha Sharma" },
    { key: "email", label: "Email address", type: "email", placeholder: "asha@example.com" },
    { key: "phone", label: "Phone number", type: "tel", placeholder: "9876543210" },
    { key: "address", label: "Delivery address", placeholder: "Flat, building, street" },
    { key: "city", label: "City", placeholder: "Bengaluru" },
    { key: "pincode", label: "PIN code", placeholder: "560001" },
  ];

  return (
    <main className="min-h-screen bg-sand">
      <header className="bg-pine text-cream" data-nav-theme="dark">
        <div className="section-shell flex flex-wrap items-center justify-between gap-4 py-10">
          <div>
            <p className="eyebrow text-mint">Almost there</p>
            <h1 className="display-title mt-2">Checkout</h1>
            <p className="mt-3 text-sm text-cream/65">
              A few details and your dog&apos;s new workday begins.
            </p>
          </div>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-butter text-pine">
            <PawIcon className="h-7 w-7" />
          </span>
        </div>
      </header>

      <div className="section-shell py-12">
        {apiError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-error/30 bg-cream px-4 py-3 text-sm font-semibold text-error"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <section className="card border-pine/10 bg-cream p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-pine text-butter">
                  <CartBagIcon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-2xl font-bold text-pine">
                  Delivery details
                </h2>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {fields.map((f) => {
                  const key = `customer.${f.key}`;
                  return (
                    <div key={f.key} className={f.key === "address" ? "sm:col-span-2" : ""}>
                      <label htmlFor={f.key} className="mb-1.5 block text-sm font-semibold text-pine">
                        {f.label}
                      </label>
                      <input
                        id={f.key}
                        type={f.type ?? "text"}
                        value={form[f.key]}
                        onChange={(e) => set(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        aria-invalid={Boolean(errors[key])}
                        aria-describedby={errors[key] ? `${f.key}-error` : undefined}
                        className={`field bg-white ${errors[key] ? "border-error focus:border-error" : ""}`}
                      />
                      {errors[key] && (
                        <p id={`${f.key}-error`} className="mt-1 text-xs font-semibold text-error">
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card border-pine/10 bg-cream p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-pine">
                Payment method
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {paymentMethods.map((m) => {
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m.id);
                        setErrors((prev) => ({ ...prev, "customer.paymentMethod": "" }));
                      }}
                      aria-pressed={active}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-pine bg-mint/40 ring-4 ring-mint/40"
                          : "border-pine/15 bg-white hover:border-pine/40"
                      }`}
                    >
                      <m.Icon className={`h-7 w-7 ${active ? "text-pine" : "text-pine/55"}`} />
                      <p className="mt-3 text-sm font-bold text-pine">{m.label}</p>
                      <p className="mt-0.5 text-xs text-pine/55">{m.detail}</p>
                    </button>
                  );
                })}
              </div>
              {errors["customer.paymentMethod"] && (
                <p className="mt-2 text-xs font-semibold text-error">
                  {errors["customer.paymentMethod"]}
                </p>
              )}
              <p className="mt-4 text-xs text-pine/50">
                Demo checkout, no real payment is collected. Your order is
                confirmed instantly.
              </p>
            </section>
          </div>

          <aside className="h-fit lg:sticky lg:top-24">
            <section className="rounded-4xl border border-cream/10 bg-pine p-6 text-cream shadow-lift sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-butter text-pine">
                  <PawIcon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-2xl font-bold">Order summary</h2>
              </div>
              <ul className="mt-5 space-y-3 border-b border-cream/15 pb-5">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-cream/70">
                      {item.name} / {item.quantity}
                    </span>
                    <span className="tnum font-semibold">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="tnum mt-5 space-y-2 text-sm">
                <div className="flex justify-between text-cream/70">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-semibold text-mint">
                    <span>{promo?.code} discount</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-cream/70">
                  <span>Delivery</span>
                  <span>
                    {subtotal >= FREE_DELIVERY_THRESHOLD ? "Free" : "Flat Rs 99"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-cream/15 pt-3 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-magnetic mt-6 w-full"
              >
                {submitting ? "Placing order" : `Place order / ${formatINR(total)}`}
              </button>
              <p className="mt-3 text-center text-xs text-cream/55">
                You will get a PV-2026-XXXXX order ID to track anytime.
              </p>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}
