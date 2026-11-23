import Link from "next/link";
import { PawIcon } from "@/components/icons/PawVaultIcons";

const exploreLinks = [
  { href: "/#configure", label: "Configure yours" },
  { href: "/#science", label: "The science" },
  { href: "/#compare", label: "Pure vs Smart" },
  { href: "/#mission", label: "Our mission" },
  { href: "/#reviews", label: "Reviews" },
];

const helpLinks = [
  { href: "/track", label: "Track your order" },
  { href: "/#faq", label: "FAQs" },
  { href: "/#contact", label: "Contact us" },
  { href: "/#how-it-works", label: "How it works" },
];

export default function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-pine-base text-cream" data-nav-theme="dark">
      <div className="section-shell grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-butter">
              <PawIcon className="h-7 w-7 text-pine" />
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.22em] text-mint">
              Five puzzles, one calm workday
            </span>
          </div>
          <p className="mt-6 font-display text-6xl leading-[1.02] tracking-tight text-cream sm:text-7xl">
            PawVault
          </p>
          <p className="mt-3 font-display text-2xl text-butter">
            A calmer day for good dogs.
          </p>
          <p className="mt-5 max-w-md leading-relaxed text-cream/65">
            Five puzzles. One calm workday. Built from platinum-cured food-grade
            silicone with a reinforced matte base, and backed by real canine
            science.
          </p>
          <p className="mt-4 text-sm text-cream/50">
            10% of every order feeds and treats street dogs.
          </p>
        </div>

        <div className="md:col-span-2">
          <h3 className="eyebrow text-cream">Explore</h3>
          <ul className="mt-5 space-y-3 text-sm font-medium text-cream/75">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-butter">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="eyebrow text-cream">Help</h3>
          <ul className="mt-5 space-y-3 text-sm font-medium text-cream/75">
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-butter">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="eyebrow text-cream">Promo codes</h3>
          <p className="mt-5 text-sm leading-relaxed text-cream/65">
            A little treat for you and your dog. Apply these at checkout.
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-butter/50 bg-butter/10 px-4 py-2 text-sm font-bold tracking-wide text-butter">
              GOODBOY15
              <span className="font-normal text-cream/60">15% off</span>
            </span>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-mint/50 bg-mint/10 px-4 py-2 text-sm font-bold tracking-wide text-mint">
              CALMPUP10
              <span className="font-normal text-cream/60">10% off</span>
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/12">
        <div className="section-shell flex flex-col gap-2 py-6 text-sm text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <span>Copyright 2026 PawVault. Made with care for good dogs.</span>
          <span>Five puzzles. One calm workday.</span>
        </div>
      </div>
    </footer>
  );
}
