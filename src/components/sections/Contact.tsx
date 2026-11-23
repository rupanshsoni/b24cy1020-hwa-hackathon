"use client";

import { useState } from "react";
import { MailIcon, ClockIcon, ArrowRightIcon } from "@/components/icons/PawVaultIcons";
import { MaskedHeading, CubertoButton } from "@/components/MotionPrimitives";

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
    <section
      id="contact"
      data-nav-theme="dark"
      className="relative z-10 -mt-10 scroll-mt-24 rounded-t-[40px] bg-[#12352E] pt-24 pb-28 text-cream lg:-mt-14 lg:rounded-t-[56px]"
    >
      <div className="section-shell">
        <div className="card-dark grid gap-10 overflow-hidden p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Say hello</p>
            <MaskedHeading as="h2" className="display-title mt-3 font-display">We reply within one working day.</MaskedHeading>
            <p className="mt-4 max-w-md text-cream/70">
              Questions about sizing, scents, or which version suits your dog? Send a note. A real person reads every message.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <p className="flex items-center gap-3">
                <MailIcon className="h-5 w-5 shrink-0 text-cream/70" />
                <span><span className="font-semibold">Email:</span> hello@pawvault.example</span>
              </p>
              <p className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 shrink-0 text-cream/70" />
                <span><span className="font-semibold">Hours:</span> Mon to Sat, 10am to 6pm IST</span>
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold">Your name</label>
              <input id="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="Asha Sharma" />
              {errors.name && <p className="mt-1 text-xs text-[#FFB4A9]">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold">Email address</label>
              <input id="contact-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" placeholder="asha@example.com" />
              {errors.email && <p className="mt-1 text-xs text-[#FFB4A9]">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold">Message</label>
              <textarea id="contact-message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="field resize-none" placeholder="Tell us about your dog..." />
              {errors.message && <p className="mt-1 text-xs text-[#FFB4A9]">{errors.message}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <CubertoButton type="submit" disabled={sending} variant="primary" className="inline-flex items-center gap-2">
                <span>{sending ? "Sending..." : "Send message"}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </CubertoButton>
              {status && <p className={`text-sm font-semibold ${ok ? "text-[#A8E0B0]" : "text-[#FFB4A9]"}`}>{status}</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
