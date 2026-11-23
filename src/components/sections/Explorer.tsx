"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createVaultScene,
  SHELL_COLORS,
  type PartKey,
  type SceneHandle,
} from "@/components/three/vaultScene";
import {
  EyeVisionIcon,
  CloseIcon,
  ArrowRightIcon,
} from "@/components/icons/PawVaultIcons";
import ExplorerShowcase from "@/components/sections/ExplorerShowcase";
import "@/components/SmoothScrollProvider";

type Mode = "pure" | "smart";
type Vision = "dog" | "human";

type Chapter = {
  key: PartKey;
  index: string;
  label: string;
  when: string;
  title: string;
  body: string;
  color: string;
};

const CHAPTERS: Chapter[] = [
  {
    key: "lick",
    index: "01",
    label: "lick",
    when: "T+0",
    title: "Insulated Frozen Lick Dome",
    body: "A frozen dome cools the lick plate to a precise temperature, holding the first reward just out of reach.",
    color: "#F4B8C4",
  },
  {
    key: "seesaw",
    index: "02",
    label: "seesaw",
    when: "Hour 1.5",
    title: "Ball-Drop Seesaw Vault",
    body: "A weighted ball unlocks the seesaw, tipping a sealed compartment open on a predictable rhythm.",
    color: "#85CAEF",
  },
  {
    key: "paddle",
    index: "03",
    label: "paddle",
    when: "Hour 3.0",
    title: "Big Paw-Paddle Vault",
    body: "A broad paddle rewards a full-paw press, scaling the effort to the size of the animal.",
    color: "#F5C942",
  },
  {
    key: "wheel",
    index: "04",
    label: "wheel",
    when: "Hour 4.5",
    title: "Nose-Spin Forage Wheel",
    body: "A low-friction wheel spins with a nose nudge, releasing a measured scatter of kibble.",
    color: "#8FD3C5",
  },
  {
    key: "scratch",
    index: "05",
    label: "scratch",
    when: "Every cycle",
    title: "Scratch-to-Unlock Nail Pad",
    body: "A textured nail pad must be scratched in sequence, turning a natural behavior into a key.",
    color: "#E5D4B8",
  },
  {
    key: "scent",
    index: "06",
    label: "scent",
    when: "Always on",
    title: "Rear Scent and Audio Bay",
    body: "A rear bay blends scent trails with soft audio cues, keeping the puzzle engaging between cycles.",
    color: "#F7EFE2",
  },
];

const EXPLODED_IMAGE = "/images/pawvault-smart-exploded.webp";

export default function Explorer() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  const [mode, setMode] = useState<Mode>("smart");
  const [vision, setVision] = useState<Vision>("human");
  const [shell, setShell] = useState<string>(SHELL_COLORS[0].hex);
  const [exploded, setExploded] = useState(false);
  const [active, setActive] = useState<PartKey | null>("lick");
  const [showPhoto, setShowPhoto] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    try {
      const handle = createVaultScene(mount);
      sceneRef.current = handle;
      return () => {
        handle.dispose?.();
        sceneRef.current = null;
      };
    } catch {
      setWebglFailed(true);
    }
  }, []);

  useEffect(() => {
    sceneRef.current?.setShellColor?.(shell);
  }, [shell]);

  useEffect(() => {
    sceneRef.current?.setActive(active, exploded ? 1 : 0);
  }, [active, exploded]);

  useEffect(() => {
    sceneRef.current?.setVersion(mode);
  }, [mode]);

  useEffect(() => {
    sceneRef.current?.setDogVision(vision === "dog");
  }, [vision]);

  const focusChapter = useCallback((chapter: Chapter) => {
    setActive(chapter.key);
    const el = document.getElementById(`chapter-${chapter.index}`);
    const lenis = window.pawvaultLenis;
    if (el && lenis) {
      lenis.scrollTo(el, { offset: -120, duration: 1.1 });
    } else if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const resetView = useCallback(() => {
    setActive(null);
    setExploded(false);
  }, []);

  return (
    <section
      id="how-it-works"
      data-nav-theme="light"
      className="relative z-10 -mt-10 overflow-x-clip rounded-t-[40px] bg-[#EFE3CF] text-[#12352E] lg:-mt-14 lg:rounded-t-[56px]"
    >
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 pb-20 sm:px-8 lg:px-12 lg:pt-24">
        <header className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="display-title mt-3 text-[#12352E]">
            Six puzzle layers, one happy dog
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#12352E]/70">
            Rotate the vault, peel back the shell, and follow each chapter as the day
            unfolds. Every layer is built to be understood at a glance.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div
              data-cursor="drag"
              className="relative overflow-hidden rounded-3xl bg-[#12352E] p-4 shadow-[0_30px_60px_-30px_rgba(18,53,46,0.6)]"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                <div ref={mountRef} className="absolute inset-0" />
                {webglFailed || showPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={EXPLODED_IMAGE}
                    alt="Exploded view of the PawVault smart puzzle"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="flex overflow-hidden rounded-full border border-[#EFE3CF]/25">
                  {(["pure", "smart"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`px-4 py-1.5 text-xs font-semibold capitalize transition ${
                        mode === m
                          ? "bg-[#EFE3CF] text-[#12352E]"
                          : "text-[#EFE3CF]/70 hover:text-[#EFE3CF]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setVision(vision === "dog" ? "human" : "dog")}
                  className="inline-flex items-center gap-2 rounded-full border border-[#EFE3CF]/25 px-4 py-1.5 text-xs font-semibold text-[#EFE3CF] transition hover:bg-[#EFE3CF]/10"
                >
                  <EyeVisionIcon className="h-4 w-4" />
                  {vision === "dog" ? "Dog's Eyes" : "Human View"}
                </button>

                <button
                  type="button"
                  onClick={() => setExploded((v) => !v)}
                  className="rounded-full border border-[#EFE3CF]/25 px-4 py-1.5 text-xs font-semibold text-[#EFE3CF] transition hover:bg-[#EFE3CF]/10"
                >
                  {exploded ? "Assemble" : "Explode"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPhoto((v) => !v)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                    showPhoto
                      ? "border-[#EFE3CF] bg-[#EFE3CF] text-[#12352E]"
                      : "border-[#EFE3CF]/25 text-[#EFE3CF] hover:bg-[#EFE3CF]/10"
                  }`}
                >
                  Real Photo
                </button>

                <button
                  type="button"
                  onClick={resetView}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#EFE3CF]/25 px-3 py-1.5 text-xs font-semibold text-[#EFE3CF] transition hover:bg-[#EFE3CF]/10"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                {SHELL_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={`Shell color ${c.name}`}
                    onClick={() => setShell(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-7 w-7 rounded-full border-2 transition ${
                      shell === c.hex
                        ? "border-[#EFE3CF]"
                        : "border-transparent hover:border-[#EFE3CF]/40"
                    }`}
                  />
                ))}
              </div>

              {vision === "dog" ? (
                <p className="mt-4 rounded-xl bg-[#EFE3CF]/10 px-3 py-2 text-xs leading-relaxed text-[#EFE3CF]/80">
                  Dogs are dichromats. Their vision follows the two-cone model of Neitz,
                  Geist and Jacobs (1989), seeing blues and yellows rather than reds and
                  greens.
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {CHAPTERS.map((chapter) => {
              const isActive = active === chapter.key;
              return (
                <button
                  key={chapter.index}
                  id={`chapter-${chapter.index}`}
                  type="button"
                  onClick={() => focusChapter(chapter)}
                  className={`group relative block w-full rounded-3xl p-6 text-left transition lg:sticky lg:top-24 ${
                    isActive ? "shadow-[0_24px_48px_-28px_rgba(18,53,46,0.55)]" : ""
                  }`}
                  style={{
                    backgroundColor: chapter.color,
                    top: `${96 + Number(chapter.index) * 14}px`,
                  }}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-display tnum text-4xl font-bold text-[#12352E]">
                      {chapter.index}
                    </span>
                    <span className="chip bg-[#12352E]/10 text-[#12352E]">
                      {chapter.when}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-[#12352E]">
                    {chapter.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#12352E]/75">
                    {chapter.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#12352E]/60">
                    {chapter.label}
                    <ArrowRightIcon aria-hidden="true" className="transition group-hover:translate-x-1 h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-20">
          <ExplorerShowcase />
        </div>
      </div>
    </section>
  );
}
