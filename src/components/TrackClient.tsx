"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatINR } from "@/store/StoreContext";
import {
  PawIcon,
  MapPinIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@/components/icons/PawVaultIcons";

type Order = {
  id: string;
  status: string;
  createdAt: string;
  customer: { name: string; city: string; paymentMethod: string };
  items: { id: string; name: string; price: number; quantity: number }[];
  promoCode: string | null;
  subtotal: number;
  discount: number;
  total: number;
  freeDelivery: boolean;
};

const steps = ["Confirmed", "Packed", "Shipped", "Delivered"];
const samples = ["PV-2026-1001", "PV-2026-1002", "PV-2026-1003"];

export default function TrackClient() {
  const params = useSearchParams();
  const initialId = params.get("id") ?? "";
  const isNew = params.get("new") === "1";
  const [input, setInput] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(id: string) {
    const clean = id.trim().toUpperCase();
    if (!clean) {
      setError("Enter your order ID to track it.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(clean)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "We couldn't find that order.");
      else setOrder(data.order);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function useSample(id: string) {
    setInput(id);
    lookup(id);
  }

  useEffect(() => {
    if (initialId) lookup(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  const activeStep = order ? steps.indexOf(order.status) : -1;

  return (
    <main className="min-h-screen bg-sand">
      <header className="bg-pine text-cream" data-nav-theme="dark">
        <div className="section-shell flex flex-wrap items-center justify-between gap-4 py-10">
          <div>
            <p className="eyebrow text-mint">Order status</p>
            <h1 className="display-title mt-2">Track your order</h1>
            <p className="mt-3 max-w-xl text-sm text-cream/65">
              See exactly where your PawVault is on its way to your dog.
            </p>
          </div>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-butter text-pine">
            <PawIcon className="h-7 w-7" />
          </span>
        </div>
      </header>

      <div className="section-shell py-12">
        {isNew && (
          <div
            role="status"
            className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-mint bg-mint px-5 py-4 text-pine"
          >
            <CheckCircleIcon className="h-7 w-7 shrink-0" />
            <p className="text-sm font-semibold">
              Your order is confirmed and on its way. Thank you for choosing PawVault.
            </p>
          </div>
        )}

        <section className="card border-pine/10 bg-cream p-6 sm:p-8">
          <label htmlFor="order-id" className="mb-2 block text-sm font-semibold text-pine">
            Order ID
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="order-id"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") lookup(input);
              }}
              placeholder="PV-2026-XXXXX"
              className="field bg-white uppercase"
            />
            <button
              type="button"
              onClick={() => lookup(input)}
              disabled={loading}
              className="btn-primary btn-magnetic shrink-0"
            >
              {loading ? "Looking" : "Track order"}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm font-semibold text-error">
              {error}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-pine/55">Try a sample:</span>
            {samples.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => useSample(id)}
                className="chip border-pine/15 bg-sand/70 text-pine transition hover:border-pine hover:bg-sand"
              >
                {id}
              </button>
            ))}
          </div>
        </section>

        {order && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <section className="card border-pine/10 bg-cream p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow text-pine">Order {order.id}</p>
                  <h2 className="mt-1 font-display text-3xl font-bold text-pine">
                    {order.status}
                  </h2>
                  <p className="mt-1 text-xs text-pine/50">
                    Placed{" "}
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span className="chip border-mint bg-mint/50 text-pine">
                  <MapPinIcon className="h-4 w-4" />
                  {order.customer.city}
                </span>
              </div>

              <div className="mt-8 flex items-center">
                {steps.map((step, i) => {
                  const done = i <= activeStep;
                  return (
                    <div key={step} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ${
                            done ? "bg-pine text-butter" : "bg-pine/10 text-pine/40"
                          }`}
                        >
                          {done ? <CheckIcon className="h-5 w-5" /> : i + 1}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            done ? "text-pine" : "text-pine/40"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className={`mx-2 h-1 flex-1 rounded-full ${
                            i < activeStep ? "bg-pine" : "bg-pine/10"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card border-pine/10 bg-cream p-6 sm:p-8">
              <h3 className="font-display text-xl font-bold text-pine">Receipt</h3>
              <ul className="mt-4 space-y-2 border-b border-pine/10 pb-4 text-sm text-pine">
                {order.items.map((item) => (
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
                  <span>{formatINR(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between font-semibold">
                    <span>{order.promoCode} discount</span>
                    <span>-{formatINR(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-pine/70">
                  <span>Delivery</span>
                  <span>{order.freeDelivery ? "Free" : "Rs 99"}</span>
                </div>
                <div className="flex justify-between border-t border-pine/10 pt-2 text-lg font-bold">
                  <span>
                    Paid via {order.customer.paymentMethod.toUpperCase()}
                  </span>
                  <span>{formatINR(order.total)}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-pine/55">
          Questions?{" "}
          <Link href="/#contact" className="font-semibold text-pine underline">
            Get in touch
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
