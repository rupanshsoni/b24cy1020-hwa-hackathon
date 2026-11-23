"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PawIcon, MailIcon } from "@/components/icons/PawVaultIcons";
import { CubertoButton } from "@/components/MotionPrimitives";

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

const promoCodes = [
  {
    code: "GOODBOY15",
    offer: "15% off",
    tone: "group border-butter/50 text-butter hover:text-cocoa focus-visible:text-cocoa",
  },
  {
    code: "CALMPUP10",
    offer: "10% off",
    tone: "group border-mint/50 text-mint hover:text-cocoa focus-visible:text-cocoa",
  },
];

export default function Footer() {
  const [copied, setCopied] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const copyCode = (code: string) => {
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(code);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(null), 1500);
  };

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
          <div className="mt-6">
            <CubertoButton
              href="mailto:hello@pawvault.example"
              variant="dark"
              className="px-5 py-2.5"
            >
              <MailIcon className="h-4 w-4" />
              hello@pawvault.example
            </CubertoButton>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="eyebrow text-cream">Explore</h3>
          <ul className="mt-5 space-y-3 text-sm font-medium text-cream/75">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="cuberto-nav-link transition hover:text-butter">
                  <span className="cuberto-nav-link-inner">{link.label}</span>
                  <span className="cuberto-nav-link-clone" aria-hidden="true">
                    {link.label}
                  </span>
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
                <Link href={link.href} className="cuberto-nav-link transition hover:text-butter">
                  <span className="cuberto-nav-link-inner">{link.label}</span>
                  <span className="cuberto-nav-link-clone" aria-hidden="true">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="eyebrow text-cream">Promo codes</h3>
          <p className="mt-5 text-sm leading-relaxed text-cream/65">
            A little treat for you and your dog. Click to copy and apply at checkout.
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            {promoCodes.map((promo) => (
              <CubertoButton
                key={promo.code}
                type="button"
                variant="dark"
                onClick={() => copyCode(promo.code)}
                className={`w-fit px-4 py-2 ${promo.tone}`}
              >
                {copied === promo.code ? "Copied" : promo.code}
                <span className="font-normal text-cream/65 transition-colors group-hover:text-cocoa/80 group-focus-visible:text-cocoa/80">
                  {promo.offer}
                </span>
              </CubertoButton>
            ))}
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
