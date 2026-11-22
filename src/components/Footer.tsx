import Link from "next/link";
import PawIcon from "@/components/PawIcon";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-cocoa/10 bg-white/50">
      <div className="section-shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cocoa">
              <PawIcon className="h-6 w-6 text-butter" />
            </span>
            <span className="font-display text-xl font-bold">PawVault</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cocoa/70">
            Five puzzles. One calm workday. Built from platinum-cured food-grade silicone with a reinforced matte base, and backed by real canine science.
          </p>
          <p className="mt-4 text-xs text-cocoa/50">10% of every order feeds and treats street dogs.</p>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-cocoa/50">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/#configure" className="hover:text-sky">Configure yours</Link></li>
            <li><Link href="/#science" className="hover:text-sky">The science</Link></li>
            <li><Link href="/#compare" className="hover:text-sky">Pure vs Smart</Link></li>
            <li><Link href="/#mission" className="hover:text-sky">Our mission</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-cocoa/50">Help</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/track" className="hover:text-sky">Track your order</Link></li>
            <li><Link href="/#faq" className="hover:text-sky">FAQs</Link></li>
            <li><Link href="/#contact" className="hover:text-sky">Contact us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cocoa/10">
        <div className="section-shell flex flex-col gap-2 py-5 text-xs text-cocoa/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 PawVault. Made with care for good dogs.</span>
          <span>Promos: GOODBOY15 · CALMPUP10</span>
        </div>
      </div>
    </footer>
  );
}
