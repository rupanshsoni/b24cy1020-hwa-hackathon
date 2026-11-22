import Image from "next/image";
import { products } from "@/data/products";

const stages = [
  { time: "T+0", title: "Frozen Lick Dome", detail: "20–30 min of frozen yoghurt, pumpkin or bone broth. Licking resets the nervous system.", color: "bg-blush" },
  { time: "Hour 1.5", title: "Ball-Drop Seesaw", detail: "A blue funnel and rubber ball tip an internal lever to pop open the kibble tray.", color: "bg-sky/25" },
  { time: "Hour 3.0", title: "Paw-Paddle Vault", detail: "A wide butter-yellow paddle and spring-damped drawer reveal a dental chew.", color: "bg-butter/40" },
  { time: "Hour 4.5", title: "Nose-Spin Forage Wheel", detail: "Raised ribs and scent vents hide treat pockets for a final nosing session.", color: "bg-mint" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-shell scroll-mt-24 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">The workday, staged</p>
        <h2 className="display-title mt-3">Five micro-puzzles. One long calm.</h2>
        <p className="mt-4 text-cocoa/65">
          Each vault unlocks in sequence. The scratch pad at the front deck files nails naturally and triggers the next puzzle after 3–4 scrapes, then goes dormant so the quick is never over-filed.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="overflow-hidden rounded-4xl border border-white/70 bg-white shadow-soft">
            <Image
              src="/images/pawvault-smart-exploded.webp"
              alt="Exploded view of the PawVault Smart showing the three-tier rounded-square flared-base design"
              width={1400}
              height={1563}
              className="h-auto w-full"
            />
          </div>
          <span className="absolute right-4 top-4 chip bg-white/90">Smart · exploded view</span>
        </div>
        <div className="space-y-4">
          {stages.map((stage, i) => (
            <div key={stage.title} className={`card flex gap-4 p-5 ${stage.color}`}>
              <div className="grid h-12 w-16 shrink-0 place-items-center rounded-xl bg-white/80 text-xs font-bold">
                {stage.time}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">{stage.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-cocoa/65">{stage.detail}</p>
              </div>
              <span className="ml-auto self-start text-xs font-bold text-cocoa/40">0{i + 1}</span>
            </div>
          ))}
          <div className="rounded-2xl bg-cocoa px-5 py-4 text-sm text-oat">
            <strong className="text-butter">Rear sealed bay:</strong> an owner-scent vent for a worn T-shirt strip or botanical discs — coconut, ginger, chamomile, swapped every 3–4 days.
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {products.map((p) => (
          <div key={p.id} className={`card overflow-hidden ${p.color}`}>
            <div className="grid gap-4 p-6 sm:grid-cols-[140px_1fr] sm:items-center">
              <div className="h-36 overflow-hidden rounded-2xl bg-white/60">
                <Image src={p.image} alt={p.name} width={500} height={400} className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                <p className="mt-1 text-sm text-cocoa/65">{p.tagline}</p>
                <p className="mt-3 font-bold">Rs {p.price.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
