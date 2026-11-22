import { comparisonRows } from "@/data/comparison";
import Link from "next/link";

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <span className="text-sky" aria-label="Included">✓</span>;
  if (value === false) return <span className="text-cocoa/25" aria-label="Not included">—</span>;
  return <span>{value}</span>;
}

export default function Comparison() {
  return (
    <section id="compare" className="scroll-mt-24 bg-white/50 py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Side by side</p>
          <h2 className="display-title mt-3">Pure or Smart?</h2>
          <p className="mt-4 text-cocoa/65">Same five puzzles and the same chew-proof build. The difference is in the guidance.</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-4xl border border-cocoa/10 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="bg-cocoa text-oat">
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">Pure <span className="block text-xs font-normal opacity-70">Rs 2,499</span></th>
                  <th className="px-6 py-4 text-center font-semibold">Smart <span className="block text-xs font-normal text-butter">Rs 4,299</span></th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-t border-cocoa/10 odd:bg-oat/40">
                    <th scope="row" className="px-6 py-3.5 text-left font-medium">{row.feature}</th>
                    <td className="px-6 py-3.5 text-center"><Cell value={row.pure} /></td>
                    <td className="px-6 py-3.5 text-center font-semibold"><Cell value={row.smart} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="#configure" className="btn-primary">Configure yours →</Link>
        </div>
      </div>
    </section>
  );
}
