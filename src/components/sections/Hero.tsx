import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blush/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-mint/50 blur-3xl" />
      <div className="section-shell relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="fade-up">
          <span className="chip bg-white/70">Five puzzles · One calm workday</span>
          <h1 className="display-title mt-6">
            A better day while<br />you&apos;re away.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-cocoa/70">
            PawVault is a weighted, chew-proof 5-in-1 enrichment vault that stages five dog-IQ puzzles across a 4–6 hour workday. Nail filing, frozen licking, cognitive play and scent reassurance — never finished in fifteen minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#configure" className="btn-primary">Configure your PawVault →</Link>
            <Link href="#science" className="btn-ghost">See the science</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-cocoa/60">
            <span>✓ Food-grade platinum silicone</span>
            <span>✓ 10% to street dogs</span>
            <span>✓ No Wi-Fi, no subscription</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg float-soft">
          <div className="absolute inset-0 rotate-3 rounded-[2.5rem] bg-blush/60" />
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-lift">
            <Image
              src="/images/pawvault-smart-hero.webp"
              alt="PawVault Smart enrichment vault assembled, with the glowing blue LED strip above the scratch pad"
              width={1600}
              height={1195}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-4 rounded-2xl border border-cocoa/10 bg-white px-4 py-3 shadow-soft">
            <p className="text-xs text-cocoa/50">Smart edition</p>
            <p className="font-display text-lg font-bold">Voice-guided calm</p>
          </div>
        </div>
      </div>
    </section>
  );
}
