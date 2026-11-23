"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CubertoButton,
  MaskedHeading,
  RevealStagger,
} from "@/components/MotionPrimitives";
import { comparisonRows } from "@/data/comparison";
import {
  CheckCircleIcon,
  DashMutedIcon,
  ArrowRightIcon,
} from "@/components/icons/PawVaultIcons";

type CellValue = boolean | string;

const competitorHeaders = [
  "Lick Mats",
  "Treat Pods",
  "Smart Cameras",
  "Puzzle Boards",
] as const;

const competitorRows: { feature: string; values: CellValue[] }[] = [
  {
    feature: "Lasts 4 to 6 hours",
    values: ["10 to 20 min", "20 to 40 min", false, "5 to 15 min"],
  },
  {
    feature: "Nail grooming built in",
    values: [false, false, false, false],
  },
  {
    feature: "Anti-habituation audio",
    values: [false, false, false, false],
  },
  {
    feature: "Owner scent bay",
    values: [false, false, false, false],
  },
  {
    feature: "Zero Wi-Fi or subscription",
    values: [true, false, false, true],
  },
  {
    feature: "Dishwasher safe",
    values: [true, "Usually", false, "Wipe only"],
  },
  {
    feature: "Chew-proof silicone",
    values: ["Thin", "Plastic", "Plastic", "Plastic"],
  },
];

function BooleanCell({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center justify-center text-butter" aria-label="yes">
      <CheckCircleIcon className="h-6 w-6" />
    </span>
  ) : (
    <span className="inline-flex items-center justify-center text-cream/40" aria-label="no">
      <DashMutedIcon className="h-6 w-6" />
    </span>
  );
}

function renderCell(value: CellValue, highlighted: boolean) {
  if (typeof value === "boolean") {
    return <BooleanCell value={value} />;
  }
  return (
    <span
      className={
        highlighted
          ? "font-semibold text-butter"
          : "text-cream/90"
      }
    >
      {value}
    </span>
  );
}

export default function Comparison() {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = tableRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = root.querySelectorAll("tbody tr");
    if (!rows.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(rows, {
        y: 18,
        autoAlpha: 0,
        stagger: 0.055,
        duration: 0.6,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: {
          trigger: root,
          start: "top 82%",
          once: true,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="compare"
      data-nav-theme="dark"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-pine py-20 pb-28 text-cream lg:-mt-14 lg:rounded-t-[56px]"
    >
      <div className="section-shell">
        <p className="eyebrow">The PawVault difference</p>
        <MaskedHeading as="h2" className="display-title">Better than the rest</MaskedHeading>
        <p className="mt-4 max-w-2xl text-cream/70">
          One toy that does the work of five. See how PawVault stacks up against
          the usual options.
        </p>

        <div ref={tableRef} className="mt-10 overflow-x-auto rounded-3xl border border-cream/10 bg-pine-elevated">
          <table className="w-full min-w-[760px] border-collapse text-center">
            <thead>
              <tr className="border-b border-cream/10">
                <th className="p-4 text-left font-display text-sm text-cream/60">
                  Feature
                </th>
                <th className="p-4 font-display text-base font-bold text-butter bg-butter/10">
                  PawVault
                </th>
                {competitorHeaders.map((header) => (
                  <th
                    key={header}
                    className="p-4 font-display text-sm font-medium text-cream/80"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitorRows.map((row) => (
                <tr key={row.feature} className="border-b border-cream/10 transition-colors last:border-0 hover:bg-cream/5">
                  <th className="p-4 text-left text-sm font-medium text-cream">
                    {row.feature}
                  </th>
                  <td className="bg-butter/10 p-4 text-sm font-semibold text-butter">
                    <CheckCircleIcon className="mx-auto h-6 w-6" aria-label="yes" />
                  </td>
                  {row.values.map((value, index) => (
                    <td key={index} className="p-4 text-sm">
                      {renderCell(value, false)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <RevealStagger className="mt-16 grid gap-8 lg:grid-cols-2" stagger={0.12} y={28}>
          <div className="overflow-x-auto rounded-3xl border border-cream/10 bg-pine-elevated">
            <table className="w-full min-w-[320px] border-collapse text-center">
              <thead>
                <tr className="border-b border-cream/10">
                  <th className="p-5 text-left font-display text-lg text-cream">
                    Pure
                  </th>
                  <th className="p-5 font-display text-2xl font-bold text-butter tnum">
                    Rs 2,499
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-cream/10 transition-colors last:border-0 hover:bg-cream/5">
                    <td className="p-4 text-left text-sm text-cream/90">
                      {row.feature}
                    </td>
                    <td className="p-4 text-sm">{renderCell(row.pure, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-butter/30 bg-pine-elevated ring-1 ring-butter/20">
            <table className="w-full min-w-[320px] border-collapse text-center">
              <thead>
                <tr className="border-b border-cream/10 bg-butter/10">
                  <th className="p-5 text-left font-display text-lg text-butter">
                    Smart
                  </th>
                  <th className="p-5 font-display text-2xl font-bold text-butter tnum">
                    Rs 4,299
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-cream/10 transition-colors last:border-0 hover:bg-cream/5">
                    <td className="p-4 text-left text-sm text-cream/90">
                      {row.feature}
                    </td>
                    <td className="bg-butter/10 p-4 text-sm">{renderCell(row.smart, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RevealStagger>

        <div className="mt-12 flex justify-center">
          <CubertoButton href="#configure" variant="primary" className="inline-flex items-center gap-2">
            Build your PawVault
            <ArrowRightIcon className="h-5 w-5" />
          </CubertoButton>
        </div>
      </div>
    </section>
  );
}
