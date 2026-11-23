"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons/PawVaultIcons";
import { MaskedHeading } from "@/components/MotionPrimitives";
import { faqs } from "@/data/faqs";

type Topic = "All" | "Puzzles and Safety" | "Audio and Tech" | "Orders and Mission";

const topics: Topic[] = ["All", "Puzzles and Safety", "Audio and Tech", "Orders and Mission"];

const topicByIndex = [
  "Puzzles and Safety",
  "Puzzles and Safety",
  "Puzzles and Safety",
  "Audio and Tech",
  "Audio and Tech",
  "Puzzles and Safety",
  "Orders and Mission",
  "Orders and Mission",
] as const;

export default function Faq() {
  const [topic, setTopic] = useState<Topic>("All");
  const [open, setOpen] = useState<number | null>(0);

  const visible = faqs
    .map((faq, index) => ({ ...faq, index }))
    .filter(({ index }) => topic === "All" || topicByIndex[index] === topic);

  return (
    <section
      id="faq"
      data-nav-theme="light"
      className="-mt-10 scroll-mt-24 rounded-t-[40px] bg-[#EFE3CF] pt-24 pb-28 lg:-mt-14 lg:rounded-t-[56px]"
    >
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Good questions</p>
            <MaskedHeading as="h2" className="display-title mt-3">
              Everything you might ask.
            </MaskedHeading>
            <p className="mt-4 text-cocoa/65">Still curious? The contact form below reaches a real human.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {topics.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setTopic(item);
                    setOpen(null);
                  }}
                  aria-pressed={topic === item}
                  className={`chip ${
                    topic === item
                      ? "border border-pine bg-pine text-oat"
                      : "border border-pine/15 text-pine"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-pine/15 border-y border-pine/15">
            {visible.map(({ question, answer, index }) => {
              const isOpen = open === index;
              return (
                <div key={question}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="flex w-full items-start gap-4 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="tnum font-display w-10 shrink-0 pt-0.5 text-sm text-pine/50">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-semibold text-cocoa">{question}</span>
                    <PlusIcon
                      className={`mt-0.5 h-5 w-5 shrink-0 text-pine transition-transform duration-500 ease-out ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    />
                  </button>
                  <div className="cuberto-accordion" data-open={isOpen ? true : false}>
                    <div className="cuberto-accordion-inner">
                      <p className="pb-5 pl-14 pr-8 text-sm leading-relaxed text-cocoa/70">{answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
