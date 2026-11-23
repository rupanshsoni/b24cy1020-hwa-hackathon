"use client";

import { useRef, useState } from "react";
import ScienceTimeline from "@/components/sections/ScienceTimeline";
import SoundLab from "@/components/sections/SoundLab";
import { MaskedHeading, ParallaxFrame } from "@/components/MotionPrimitives";
import { studies } from "@/data/studies";
import { useStore } from "@/store/StoreContext";
import {
  BotanicalLeafIcon,
  ChevronDownIcon,
} from "@/components/icons/PawVaultIcons";

function byId(id: string) {
  return studies.find((s) => s.id === id) ?? studies[0];
}

function Citation({
  study,
  variant = "light",
}: {
  study: (typeof studies)[number];
  variant?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const dark = variant === "dark";
  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        dark ? "border-cream/15 bg-cream/10" : "border-pine/15 bg-white/50"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold ${
          dark ? "text-cream" : "text-pine"
        }`}
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`chip ${dark ? "bg-cream/15 text-cream" : "bg-blush/40"}`}>{study.tag}</span>
          <span>{study.title}</span>
        </span>
        <span className={`flex shrink-0 items-center gap-1 text-xs transition-opacity duration-300 ${open ? "opacity-100" : "opacity-70"}`}>
          {open ? "Hide" : "Citation"}
          <span className={`transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "rotate-180" : ""}`}>
            <ChevronDownIcon />
          </span>
        </span>
      </button>
      <div className="cuberto-accordion" data-open={open ? "true" : "false"}>
        <div className="cuberto-accordion-inner overflow-hidden">
          <div
            className={`space-y-3 border-t px-4 py-4 text-sm ${
              dark ? "border-cream/15 text-cream/75" : "border-pine/15 text-cocoa/75"
            }`}
          >
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-mint" : "text-cocoa/45"}`}>
                Journal citation
              </p>
              <p className="mt-1">{study.citation}</p>
              <p className={`mt-1 text-xs ${dark ? "text-cream/55" : "text-cocoa/50"}`}>
                {study.authors} ({study.year})
              </p>
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-mint" : "text-cocoa/45"}`}>
                Key finding
              </p>
              <p className="mt-1">{study.finding}</p>
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-mint" : "text-cocoa/45"}`}>
                PawVault hardware mapping
              </p>
              <p className={`mt-1 rounded-xl px-3 py-2 font-semibold ${dark ? "bg-mint/20 text-mint" : "bg-mint/40 text-pine"}`}>
                {study.feature}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisionSlider() {
  const [split, setSplit] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);

  function updateFromEvent(clientX: number) {
    const node = frameRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSplit(pct);
  }

  const handleDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromEvent(e.clientX);
  };

  return (
    <div
      ref={frameRef}
      data-cursor="drag"
      className="relative mt-8 aspect-[16/10] w-full max-w-4xl select-none overflow-hidden rounded-3xl border border-cream/20 bg-cocoa"
      onPointerDown={handleDown}
      onPointerMove={(e) => {
        if (e.buttons === 1) updateFromEvent(e.clientX);
      }}
    >
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="canine-dichromatic">
            <feColorMatrix
              type="matrix"
              values="0.20 0.60 0.20 0 0
                      0.20 0.60 0.20 0 0
                      0.00 0.55 0.45 0 0
                      0    0    0    1 0"
            />
          </filter>
        </defs>
      </svg>

      <div className="absolute inset-0">
        <img
          src="/images/pawvault-smart-hero-large.webp"
          alt="Dichromatic simulation of a dog's view"
          draggable={false}
          className="h-full w-full scale-[1.06] object-cover object-[45%_48%]"
          style={{ filter: "url(#canine-dichromatic)" }}
        />
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
      >
        <img
          src="/images/pawvault-smart-hero-large.webp"
          alt="Human trichromatic view"
          draggable={false}
          className="h-full w-full scale-[1.06] object-cover object-[45%_48%]"
        />
      </div>

      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-bold text-pine">
        Human Trichromatic
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-pine/85 px-3 py-1 text-xs font-bold text-cream">
        Canine Dichromatic
      </span>
      <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-butter/90 px-3 py-1 text-xs font-bold text-cocoa">
        429 nm blue
      </span>
      <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-butter/90 px-3 py-1 text-xs font-bold text-cocoa">
        555 nm yellow
      </span>

      <div
        className="pointer-events-none absolute inset-y-0 w-1 bg-cream shadow-lg"
        style={{ left: `${split}%` }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-pine shadow-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M8 7 3 12l5 5" />
            <path d="M16 7l5 5-5 5" />
            <path d="M3 12h18" />
          </svg>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={split}
        onChange={(e) => setSplit(Number(e.target.value))}
        aria-label="Comparison slider between human and canine vision"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

export default function Science() {
  const { dogName } = useStore();
  const vision = byId("vision");
  const cognition = byId("cognition");
  const licking = byId("licking");
  const olfactory = byId("olfactory");
  const voiceScent = byId("voice-scent");
  const habituation = byId("habituation");

  return (
    <div>
      <section data-nav-theme="dark" id="science" className="relative z-10 -mt-10 scroll-mt-24 rounded-t-[40px] bg-pine pt-20 pb-28 text-cream lg:-mt-14 lg:rounded-t-[56px]">
        <div className="section-shell mx-auto max-w-6xl">
          <p className="eyebrow text-butter">Chapter 01 and the evidence</p>
          <MaskedHeading as="h2" className="display-title mt-3 max-w-3xl text-cream">
            Six studies, built into every hour of the hardware.
          </MaskedHeading>
          <p className="mt-4 max-w-2xl text-cream/70">
            Follow a full workday of science, hear the audio modes for yourself, then open any study to see exactly what backs each feature.
          </p>

          <div className="mt-14 grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="font-display text-7xl font-bold text-butter/30">01</span>
              <p className="eyebrow mt-3 text-butter">Canine dichromatic vision</p>
              <MaskedHeading as="h3" className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
                He does not see your world in full colour. He sees a smarter one.
              </MaskedHeading>
              <p className="mt-4 text-cream/70">
                Neitz, Geist and Jacobs (1989) showed that dogs read the world through two cone types, anchored near 429 nm blue and 555 nm yellow. PawVault shapes every surface and signal around that dichromatic palette, so contrast does the work that colour cannot.
              </p>
              <div className="mt-6 max-w-lg">
                <Citation study={vision} variant="dark" />
              </div>
            </div>
            <VisionSlider />
          </div>
          <p className="mt-4 text-xs text-cream/50">
            Drag the handle or use the slider to compare human trichromatic and canine dichromatic rendering in real time.
          </p>
        </div>
      </section>

      <section data-nav-theme="light" className="relative z-10 -mt-10 rounded-t-[40px] bg-mint pt-20 pb-28 text-pine lg:-mt-14 lg:rounded-t-[56px]">
        <div className="section-shell mx-auto max-w-6xl">
          <p className="eyebrow text-pine/60">Chapter 02 and cognitive welfare</p>
          <div className="mt-3 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <span className="font-display text-7xl font-bold text-pine/20">02</span>
              <MaskedHeading as="h3" className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
                A lick is a reset button for the nervous system.
              </MaskedHeading>
              <div className="cuberto-card-media mt-6 overflow-hidden rounded-3xl border-4 border-cream shadow-2xl shadow-pine/20">
                <ParallaxFrame>
                  <img
                    src="/images/editorial-lick-dome-macro.webp"
                    alt="Macro detail of the frozen lick dome"
                    className="cuberto-card-media-inner aspect-[4/3] w-full object-cover"
                  />
                </ParallaxFrame>
              </div>
            </div>
            <div className="space-y-6 pt-6">
              <p className="text-lg leading-relaxed text-pine/80">
                Bennett et al. (2017) linked repetitive licking to a lowered heart rate and a parasympathetic shift. Clark (2017) added the cognitive layer: dogs who work for food through problem solving show better welfare than dogs fed for free. The lick dome and the reward puzzles are engineered around both findings.
              </p>
              <div className="ml-0 max-w-md translate-y-0 rounded-3xl bg-cream p-6 shadow-xl shadow-pine/10 sm:ml-6">
                <p className="eyebrow text-cocoa/50">Proof one and parasympathetic reset</p>
                <p className="mt-2 font-display text-2xl font-bold text-pine">Licking lowers heart rate.</p>
                <p className="mt-2 text-sm text-cocoa/70">
                  The double wall frozen lid keeps the dome cold long enough for a sustained licking session, turning food into a calm down ritual.
                </p>
                <div className="mt-4"><Citation study={licking} /></div>
              </div>
              <div className="ml-0 max-w-md rounded-3xl bg-butter p-6 shadow-xl shadow-pine/10 sm:ml-auto">
                <p className="eyebrow text-cocoa/55">Proof two and cognitive welfare</p>
                <p className="mt-2 font-display text-2xl font-bold text-pine">Effort beats a free bowl.</p>
                <p className="mt-2 text-sm text-cocoa/75">
                  The seesaw, paddle and drawer make {dogName} solve a small problem before each reward, keeping the mind busy while you are away.
                </p>
                <div className="mt-4"><Citation study={cognition} /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-nav-theme="light" className="relative z-10 -mt-10 rounded-t-[40px] bg-blush pt-20 pb-28 text-pine lg:-mt-14 lg:rounded-t-[56px]">
        <div className="section-shell mx-auto max-w-6xl">
          <p className="eyebrow text-pine/60">Chapter 03 and the scent anchor</p>
          <MaskedHeading as="h3" className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Your smell calms him. A new smell wakes his nose back up.
          </MaskedHeading>
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="cuberto-card-media relative overflow-hidden rounded-3xl border-4 border-cream shadow-2xl shadow-pine/20">
                <ParallaxFrame>
                  <img
                    src="/images/editorial-botanical-scent.webp"
                    alt="Botanical scent sources arranged for olfactory foraging"
                    className="cuberto-card-media-inner aspect-[16/10] w-full object-cover"
                  />
                </ParallaxFrame>
                <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full bg-cream/90 px-4 py-2 text-sm font-bold text-pine">
                  <span className="[&>svg]:h-5 [&>svg]:w-5"><BotanicalLeafIcon /></span>
                  Olfactory dishabituation
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-cream p-6 shadow-lg shadow-pine/10">
                  <p className="eyebrow text-cocoa/50">Owner cortisol anchor</p>
                  <p className="mt-2 font-display text-xl font-bold text-pine">A worn shirt lowers stress.</p>
                  <p className="mt-2 text-sm text-cocoa/70">
                    Shin and Shin (2016) found that familiar human scent and voice reduced cortisol, so the rear vent carries your smell into every rest cycle.
                  </p>
                  <div className="mt-4"><Citation study={voiceScent} /></div>
                </div>
                <div className="rounded-3xl bg-cream p-6 shadow-lg shadow-pine/10">
                  <p className="eyebrow text-cocoa/50">Olfactory dishabituation</p>
                  <p className="mt-2 font-display text-xl font-bold text-pine">Novel scent renews curiosity.</p>
                  <p className="mt-2 text-sm text-cocoa/70">
                    Binks et al. (2018) showed coconut and ginger refreshed exploratory behaviour, so the scent wheel rotates discs across the workday.
                  </p>
                  <div className="mt-4"><Citation study={olfactory} /></div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-pine p-7 text-cream shadow-2xl shadow-pine/30 lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
              <span className="font-display text-6xl font-bold text-mint/30">+</span>
              <p className="eyebrow mt-2 text-mint">The contrast proof</p>
              <h4 className="mt-3 font-display text-2xl font-bold leading-snug">
                Familiar to settle, novel to stir.
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-cream/75">
                Two opposing scent strategies share one machine. The owner anchor runs during rest, while botanical discs cycle through the forage pockets to stop the nose from switching off.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="chip bg-cream/15 text-cream">Coconut</span>
                <span className="chip bg-cream/15 text-cream">Ginger</span>
                <span className="chip bg-cream/15 text-cream">Chamomile</span>
                <span className="chip bg-cream/15 text-cream">Lavender</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-nav-theme="light" className="relative z-10 -mt-10 rounded-t-[40px] bg-mint pt-20 pb-28 text-pine lg:-mt-14 lg:rounded-t-[56px]">
        <div className="section-shell mx-auto max-w-6xl">
          <p className="eyebrow text-pine/60">Chapter 04 and the habituation rule</p>
          <div className="mt-3 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <MaskedHeading as="h3" className="max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
              Seven days, then the sound goes quiet.
            </MaskedHeading>
            <span className="font-display text-7xl font-bold text-pine/20">04</span>
          </div>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-pine/80">
            Bowman et al. (2015 to 2017) and Brayley and Montrose (2016) showed that dogs habituate to a single repeated sound but keep responding when audio rotates. PawVault runs a seven day learning window, then eases the voice and soundscape into rest so the signal stays meaningful instead of becoming noise.
          </p>
          <div className="mt-6 max-w-2xl"><Citation study={habituation} /></div>

          <div className="mt-14 space-y-6">
            <ScienceTimeline />
            <SoundLab />
          </div>
        </div>
      </section>
    </div>
  );
}
