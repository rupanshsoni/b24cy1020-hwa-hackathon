"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatINR } from "@/store/StoreContext";

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

export default function TrackClient() {
  const params = useSearchParams();
  const initialId = params.get("id") ?? "";
  const [input, setInput] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(id: string) {
    const clean = id.trim().toUpperCase();
    if (!clean) { setError("Enter your order ID to track it."); return; }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(clean)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) setError(data.error || "We couldn't find that order.");
      else setOrder(data.order);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialId) lookup(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  const activeStep = order ? steps.indexOf(order.status) : -1;

  return (
    <main className="section-shell py-12">
      <div className="mb-8">
        <p className="eyebrow">Order status</p>
        <h1 className="display-title mt-2">Track your order</h1>
        <p className="mt-3 max-w-xl text-cocoa/60">
          Enter the PV-2026-XXXX ID from your confirmation. Need a sample? Try <button type="button" onClick={() => { setInput("PV-2026-1001"); lookup("PV-2026-1001"); }} className="font-semibold text-sky underline">PV-2026-1001</button>.
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <label htmlFor="order-id" className="mb-2 block text-sm font-semibold">Order ID</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="order-id"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") lookup(input); }}
            placeholder="PV-2026-XXXX"
            className="field uppercase"
          />
          <button type="button" onClick={() => lookup(input)} disabled={loading} className="btn-primary shrink-0">
            {loading ? "Looking…" : "Track order"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {order && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <section className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Order {order.id}</p>
                <h2 className="mt-1 font-display text-3xl font-bold">{order.status}</h2>
                <p className="mt-1 text-xs text-cocoa/50">
                  Placed {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <span className="chip bg-mint/50">🐾 {order.customer.city}</span>
            </div>

            <div className="mt-8 flex items-center">
              {steps.map((step, i) => (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ${
                      i <= activeStep ? "bg-cocoa text-butter" : "bg-cocoa/10 text-cocoa/40"
                    }`}>
                      {i <= activeStep ? "✓" : i + 1}
                    </span>
                    <span className={`text-[11px] font-semibold ${i <= activeStep ? "" : "text-cocoa/40"}`}>{step}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`mx-2 h-1 flex-1 rounded-full ${i < activeStep ? "bg-cocoa" : "bg-cocoa/10"}`} />
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold">Receipt</h3>
            <ul className="mt-4 space-y-2 border-b border-cocoa/10 pb-4 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="text-cocoa/70">{item.name} × {item.quantity}</span>
                  <span className="font-semibold">{formatINR(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-cocoa/60">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700"><span>{order.promoCode} discount</span><span>−{formatINR(order.discount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-cocoa/60">Delivery</span><span>{order.freeDelivery ? "Free" : "Rs 99"}</span></div>
              <div className="flex justify-between border-t border-cocoa/10 pt-2 text-lg font-bold">
                <span>Paid via {order.customer.paymentMethod.toUpperCase()}</span><span>{formatINR(order.total)}</span>
              </div>
            </div>
          </section>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-cocoa/50">
        Questions? <Link href="/#contact" className="font-semibold text-sky underline">Get in touch</Link>.
      </p>
    </main>
  );
}
