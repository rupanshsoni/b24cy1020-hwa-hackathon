"use client";

import Link from "next/link";
import { useStore } from "@/store/StoreContext";

export default function Navbar() {
  const { items, openCart, total } = useStore();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa/10 bg-oat/90 backdrop-blur-xl">
      <div className="section-shell flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="PawVault home">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cocoa text-lg text-butter transition group-hover:rotate-6">
            🐾
          </span>
          <span className="font-display text-xl font-bold tracking-tight">PawVault</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main navigation">
          <Link href="/#how-it-works" className="transition hover:text-sky">How it works</Link>
          <Link href="/#science" className="transition hover:text-sky">Science</Link>
          <Link href="/#configure" className="transition hover:text-sky">Configure</Link>
          <Link href="/track" className="transition hover:text-sky">Track Order</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/track"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-cocoa/5 sm:inline-flex"
          >
            Track Order
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex items-center gap-2 rounded-full bg-cocoa px-4 py-2.5 text-sm font-semibold text-oat transition hover:bg-cocoa/85"
            aria-label={`Open cart, ${count} items, total Rs ${total}`}
          >
            <span aria-hidden="true">🛒</span>
            <span className="hidden sm:inline">Cart</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-butter px-1 text-[11px] font-bold text-cocoa">
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
