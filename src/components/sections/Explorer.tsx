"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createVaultScene, SHELL_COLORS, type PartKey, type SceneHandle } from "@/components/three/vaultScene";
import { products } from "@/data/products";

const features: { key: PartKey; time: string; title: string; detail: string; color: string }[] = [
  { key: "lick", time: "T+0", title: "Insulated Frozen Lick Dome", detail: "A double-wall thermal lid holds frozen yoghurt, pumpkin, banana or bone broth for the first 20–30 minutes. Licking triggers a parasympathetic reset.", color: "bg-blush/45" },
  { key: "seesaw", time: "Hour 1.5", title: "Ball-Drop Seesaw Vault", detail: "A Sky Blue recessed funnel and natural rubber ball tip an internal seesaw lever, popping open a kibble tray right on schedule.", color: "bg-sky/20" },
  { key: "paddle", time: "Hour 3.0", title: "Big Paw-Paddle Vault", detail: "A wide cushioned Butter Yellow lever paddle and spring-damped drawer release a dental chew or yak cheese.", color: "bg-butter/35" },
  { key: "wheel", time: "Hour 4.5", title: "Nose-Spin Forage Wheel", detail: "Raised ribs and scent vents hide treat pockets. Your dog nudges the wheel to uncover each one — a final nosing session.", color: "bg-mint/50" },
  { key: "scratch", time: "Every cycle", title: "Scratch-to-Unlock Nail Pad", detail: "A gently sloped replaceable fine-grit board files front claws and triggers the next puzzle after 3–4 scrapes, then goes dormant so the quick is never over-filed.", color: "bg-oat" },
  { key: "scent", time: "Always on", title: "Rear Scent & Audio Bay", detail: "A sealed vent holds a worn T-shirt strip or botanical discs (coconut, ginger, chamomile). Smart adds a USB-C 14-day audio core at 45–55 dB with zero Wi-Fi.", color: "bg-blush/30" },
];

export default function Explorer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  const activeRef = useRef<PartKey | null>(null);
  const [active, setActive] = useState<PartKey | null>(null);
  const [version, setVersion] = useState<"pure" | "smart">("smart");
  const [dogVision, setDogVision] = useState(false);
  const [shell, setShell] = useState("mint");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let handle: SceneHandle;
    try {
      handle = createVaultScene(mount);
    } catch {
      setFailed(true);
      return;
    }
    sceneRef.current = handle;
    return () => { handle.dispose(); sceneRef.current = null; };
  }, []);

  useEffect(() => { sceneRef.current?.setVersion(version); }, [version]);
  useEffect(() => { sceneRef.current?.setDogVision(dogVision); }, [dogVision]);
  useEffect(() => {
    sceneRef.current?.setShellColor(SHELL_COLORS.find((c) => c.id === shell)?.hex ?? "#BFE3DC");
  }, [shell]);

  function applyActive(key: PartKey | null) {
    if (key === activeRef.current) return;
    activeRef.current = key;
    setActive(key);
    sceneRef.current?.setActive(key, key ? 1 : 0);
  }

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const cards = Array.from(wrap.querySelectorAll<HTMLElement>("[data-feature]"));
        const mid = window.innerHeight * 0.5;
        let chosen: PartKey | null = null;
        for (const card of cards) {
          const r = card.getBoundingClientRect();
          if (r.top <= mid && r.bottom >= mid) {
            chosen = card.dataset.feature as PartKey;
            break;
          }
        }
        if (chosen) applyActive(chosen);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(key: PartKey) {
    applyActive(key);
    const el = wrapRef.current?.querySelector<HTMLElement>(`[data-feature="${key}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function reset() { applyActive(null); }

  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white/50 py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Explore the anatomy</p>
          <h2 className="display-title mt-3">Five puzzles, one clever vault.</h2>
          <p className="mt-4 text-cocoa/65">
            Drag to rotate the model. Scroll the cards or tap one to fly the camera in, explode the tiers and light up the active mechanism.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex rounded-full border border-cocoa/15 bg-white p-1">
            {(["pure", "smart"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVersion(v)}
                className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition ${version === v ? "bg-cocoa text-oat" : "text-cocoa/60"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDogVision((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition ${dogVision ? "border-sky bg-sky/15 text-sky" : "border-cocoa/15 bg-white"}`}
          >
            ◉ {dogVision ? "Dog's Eyes" : "Human View"}
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-cocoa/15 bg-white px-3 py-1.5">
            {SHELL_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setShell(c.id)}
                title={c.name}
                aria-label={c.name}
                className={`h-8 w-8 rounded-full border-2 transition ${shell === c.id ? "scale-110 border-cocoa" : "border-transparent"}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {dogVision && (
          <p className="mx-auto mt-3 max-w-xl text-center text-xs text-cocoa/55">
            Dichromatic simulation after Neitz, Geist &amp; Jacobs (1989): shells mute to calm neutrals while Sky Blue (~429 nm) and Butter Yellow (~555 nm) targets stay vivid.
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="h-fit lg:sticky lg:top-24">
            <div ref={mountRef} className="relative h-[420px] w-full overflow-hidden rounded-4xl border border-white/70 bg-gradient-to-br from-blush/30 via-oat to-mint/40 shadow-soft sm:h-[560px]">
              {failed && (
                <div className="absolute inset-0 grid place-items-center p-6">
                  <Image src="/images/pawvault-smart-exploded.webp" alt="Exploded PawVault Smart" width={700} height={780} className="h-full w-auto object-contain" />
                </div>
              )}
              <span className="pointer-events-none absolute left-4 top-4 chip bg-white/85">
                {version === "smart" ? "Smart · LED + piezo" : "Pure · mechanical"} · {dogVision ? "Dog vision" : "Human view"}
              </span>
              {active && (
                <button type="button" onClick={reset} className="absolute right-4 top-4 rounded-full bg-cocoa px-4 py-2 text-xs font-bold text-oat">
                  Reset view ✕
                </button>
              )}
              <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/75 px-4 py-1.5 text-[11px] font-semibold text-cocoa/55">
                Drag to rotate · click a card to focus
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {features.map((f) => (
              <button
                key={f.key}
                data-feature={f.key}
                type="button"
                onClick={() => select(f.key)}
                className={`card block w-full p-5 text-left transition ${f.color} ${active === f.key ? "ring-4 ring-sky/30" : "hover:-translate-y-0.5"}`}
              >
                <div className="flex items-start gap-4">
                  <span className={`grid h-11 w-16 shrink-0 place-items-center rounded-xl text-xs font-bold ${active === f.key ? "bg-cocoa text-butter" : "bg-white/80"}`}>{f.time}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-cocoa/65">{f.detail}</p>
                  </div>
                </div>
              </button>
            ))}
            <div className="pt-2 text-center">
              <Link href="#configure" className="btn-ghost">Configure your PawVault →</Link>
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
      </div>
    </section>
  );
}
