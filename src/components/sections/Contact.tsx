"use client";

import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [ok, setOk] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus("");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? {});
        setStatus(data.error || "Please check your details and try again.");
        setOk(false);
      } else {
        setStatus(data.message);
        setOk(true);
        setForm({ name: "", email: "", message: "" });
      }
    } catch {
      setStatus("Could not reach the server. Please try again.");
      setOk(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="section-shell scroll-mt-24 py-16">
      <div className="card grid gap-8 overflow-hidden p-8 sm:p-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Say hello</p>
          <h2 className="display-title mt-3">We reply within one working day.</h2>
          <p className="mt-4 max-w-md text-cocoa/65">
            Questions about sizing, scents, or which version suits your dog? Send a note — a real person reads every message.
          </p>
          <div className="mt-8 space-y-2 text-sm">
            <p>🐾 <span className="font-semibold">Email:</span> hello@pawvault.example</p>
            <p>🐾 <span className="font-semibold">Hours:</span> Mon–Sat, 10am–6pm IST</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold">Your name</label>
            <input id="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="Asha Sharma" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold">Email address</label>
            <input id="contact-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" placeholder="asha@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold">Message</label>
            <textarea id="contact-message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="field resize-none" placeholder="Tell us about your dog…" />
            {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={sending} className="btn-primary">{sending ? "Sending…" : "Send message"}</button>
            {status && <p className={`text-sm font-semibold ${ok ? "text-emerald-700" : "text-red-600"}`}>{status}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
