"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/store/StoreContext";
import {
  PawIcon,
  CartBagIcon,
  CloseIcon,
  ArrowRightIcon,
} from "@/components/icons/PawVaultIcons";
import { CubertoButton } from "@/components/MotionPrimitives";

type NavTheme = "dark" | "light";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#science", label: "Science" },
  { href: "/#try", label: "Try Minigame" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/track", label: "Track Order" },
];

function detectTheme(pathname: string): NavTheme {
  if (typeof document === "undefined") return "dark";

  const probeX = Math.max(12, Math.min(window.innerWidth - 12, 32));
  const under = document.elementsFromPoint(probeX, 78);
  for (const el of under) {
    const themed = el.closest<HTMLElement>("[data-nav-theme]");
    if (themed) return themed.dataset.navTheme === "light" ? "light" : "dark";
  }

  if (pathname === "/") {
    const hero = document.querySelector("main > section");
    if (hero && hero.getBoundingClientRect().bottom > 72) return "dark";
  }

  return "light";
}

export default function Navbar() {
  const pathname = usePathname();
  const { items, openCart, total } = useStore();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const [theme, setTheme] = useState<NavTheme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setTheme(detectTheme(pathname));
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const dark = theme === "dark";
  const bar = dark
    ? "border-cream/15 bg-pine text-cream"
    : "border-pine/15 bg-sand text-pine";
  const linkTone = dark
    ? "text-cream/80 hover:text-butter"
    : "text-pine/75 hover:text-pine";
  const iconButton = dark
    ? "border-cream/20 bg-cream/10 hover:bg-cream/20"
    : "border-pine/20 bg-cream/70 hover:bg-cream";

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${bar}`}
      data-nav-theme={theme}
    >
      <div className="section-shell flex h-[72px] items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="PawVault home"
        >
          <span
            className={`grid h-10 w-10 place-items-center rounded-2xl transition group-hover:rotate-6 ${
              dark ? "bg-butter" : "bg-pine"
            }`}
          >
            <PawIcon
              className={`h-6 w-6 ${dark ? "text-pine" : "text-butter"}`}
            />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            PawVault
          </span>
        </Link>

        <nav
          className="hidden items-center gap-7 text-sm font-medium md:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`cuberto-nav-link transition ${linkTone}`}
            >
              <span className="cuberto-nav-link-inner">{link.label}</span>
              <span className="cuberto-nav-link-clone" aria-hidden="true">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CubertoButton
            href="/#configure"
            variant="primary"
            className="hidden whitespace-nowrap sm:inline-flex"
          >
            Build Vault
            <ArrowRightIcon className="h-4 w-4" />
          </CubertoButton>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${count} items, total Rs ${total}`}
            className={`relative inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition ${iconButton}`}
          >
            <CartBagIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            <span
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold ${
                dark ? "bg-butter text-pine" : "bg-pine text-cream"
              }`}
            >
              {count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition md:hidden ${iconButton}`}
          >
            {menuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <span className="flex flex-col gap-[5px]" aria-hidden="true">
                <span className={`block h-0.5 w-5 rounded-full ${dark ? "bg-cream" : "bg-pine"}`} />
                <span className={`block h-0.5 w-5 rounded-full ${dark ? "bg-cream" : "bg-pine"}`} />
                <span className={`block h-0.5 w-5 rounded-full ${dark ? "bg-cream" : "bg-pine"}`} />
              </span>
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-t transition-all duration-300 md:hidden ${
          dark ? "border-cream/15" : "border-pine/15"
        } ${menuOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"}`}
        aria-hidden={!menuOpen}
      >
        <nav className="section-shell flex flex-col gap-1 py-4" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`rounded-2xl px-4 py-3 text-base font-semibold transition ${linkTone} ${
                dark ? "hover:bg-cream/10" : "hover:bg-sand-deep/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <CubertoButton
            href="/#configure"
            variant="primary"
            onClick={() => setMenuOpen(false)}
            className="mt-2 w-full"
          >
            Build Vault
            <ArrowRightIcon className="h-4 w-4" />
          </CubertoButton>
        </nav>
      </div>
    </header>
  );
}
