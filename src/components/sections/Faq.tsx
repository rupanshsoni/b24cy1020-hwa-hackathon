"use client";

import { useState } from "react";
import { faqs } from "@/data/faqs";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-white/50 py-16">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Good questions</p>
          <h2 className="display-title mt-3">Everything you might ask.</h2>
          <p className="mt-4 text-cocoa/65">Still curious? The contact form below reaches a real human.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question} className="overflow-hidden rounded-2xl border border-cocoa/10 bg-white">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cocoa text-oat transition ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>
                {isOpen && (
                  <p className="border-t border-cocoa/10 px-5 py-4 text-sm leading-relaxed text-cocoa/70">{faq.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
