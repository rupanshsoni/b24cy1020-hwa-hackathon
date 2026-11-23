"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createHeroStage, type HeroStageHandle } from "@/components/three/heroStage";
import { SoundWaveIcon, ArrowRightIcon } from "@/components/icons/PawVaultIcons";
import { useStore } from "@/store/StoreContext";

type Beat = {
  rail: string;
  time: string;
  title: string;
  line: (name: string) => string;
  sub: (name: string) => string;
};

const BEATS: Beat[] = [
  {
    rail: "08:30",
    time: "08:30 AM",
    title: "Door Closes",
    line: (name) => `${name} settles the moment the latch clicks.`,
    sub: (name) => `You are out the door and ${name} is already breathing easy. The workday begins with calm instead of chaos.`,
  },
  {
    rail: "09:00",
    time: "09:00 AM",
    title: "First Lick and Scratch",
    line: (name) => `A slow lick, a soft scratch, ${name} is at ease.`,
    sub: (name) => `Gentle attention arrives right on schedule, so ${name} feels connected long before you get back.`,
  },
  {
    rail: "12:00",
    time: "12:00 PM",
    title: "Ball-Drop and Paddle",
    line: (name) => `Midday play keeps ${name} moving and bright.`,
    sub: (name) => `A ball-drop session and a familiar paddle turn an empty afternoon into the best part of ${name}'s day.`,
  },
  {
    rail: "16:30",
    time: "04:30 PM",
    title: "Nose-Spin and Calm",
    line: (name) => `One last nose-spin and ${name} drifts into quiet.`,
    sub: (name) => `As the day winds down, ${name} settles into a deep, contented rest, ready to greet you at the door.`,
  },
];

export default function HeroScene() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const stageRef = useRef<HeroStageHandle | null>(null);
  const beatRef = useRef(0);
  const [activeBeat, setActiveBeat] = useState(0);
  const [webglFailed, setWebglFailed] = useState(false);
  const { dogName, setDogName } = useStore();
  const [nameDraft, setNameDraft] = useState(dogName);

  useEffect(() => {
    setNameDraft(dogName);
  }, [dogName]);

  const commitName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed) setDogName(trimmed);
  };

  const resolvedName = dogName?.trim() || "your dog";
  const beat = BEATS[activeBeat];

  useEffect(() => {
    let stage: HeroStageHandle | null = null;
    if (mountRef.current) {
      try {
        stage = createHeroStage(mountRef.current);
        stageRef.current = stage;
      } catch {
        setWebglFailed(true);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      stage?.setVisible(entry.isIntersecting);
    });
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      stage?.dispose();
      stageRef.current = null;
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        stageRef.current?.setProgress(self.progress);
        const index = Math.min(BEATS.length - 1, Math.floor(self.progress * BEATS.length));
        if (index !== beatRef.current) {
          beatRef.current = index;
          setActiveBeat(index);
        }
      },
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (!headlineRef.current) return;
    gsap.fromTo(
      headlineRef.current,
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out", overwrite: true },
    );
  }, [activeBeat]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    stageRef.current?.setPointer(nx, ny);
  };

  const goToBeat = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = window.scrollY + section.getBoundingClientRect().top;
    const travel = section.offsetHeight - window.innerHeight;
    const targetY = top + travel * ((index + 0.5) / BEATS.length);
    if (window.pawvaultLenis) window.pawvaultLenis.scrollTo(targetY);
    else window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      className="relative h-[340vh] w-full bg-gradient-to-b from-[#12352E] to-[#0D2722] lg:h-[420vh]"
    >
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        onPointerMove={handlePointerMove}
      >
        <div className="absolute inset-0">
          <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
          {webglFailed && (
            <img
              src="/images/pawvault-smart-hero.webp"
              alt=""
              className="h-full w-full scale-[1.06] object-cover object-[45%_48%]"
            />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(12,38,33,0.88),transparent_68%)]" />

        <div className="section-shell relative z-10 mx-auto flex h-full w-full items-center px-6 pt-16 sm:px-10 lg:px-16">
          <div className="max-w-xl text-cream">
            <span className="eyebrow chip inline-flex items-center rounded-full border border-cream/25 bg-cream/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-sm">
              A full workday of calm
            </span>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="tnum text-sm font-medium tracking-[0.2em] text-butter uppercase">
                {beat.time}
              </span>
            </div>

            <h1
              ref={headlineRef}
              className="display-title font-display mt-3 text-5xl leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl"
            >
              {beat.title}
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-cream/90 sm:text-xl">
              {beat.line(resolvedName)}
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/70 sm:text-base">
              {beat.sub(resolvedName)}
            </p>

            <label className="mt-7 block max-w-sm" htmlFor="hero-dog-name">
              <span className="mb-2 block text-xs font-medium tracking-wide text-cream/70 uppercase">
                Your dog&apos;s name
              </span>
              <input
                id="hero-dog-name"
                type="text"
                value={nameDraft}
                onChange={(event) => {
                  setNameDraft(event.target.value);
                  if (event.target.value.trim()) setDogName(event.target.value);
                }}
                onBlur={commitName}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitName();
                }}
                placeholder="Your dog's name"
                className="w-full rounded-xl border border-cream/25 bg-pine-base/75 backdrop-blur-sm px-4 py-3 text-cream placeholder:text-cream/40 focus:border-butter focus:outline-none"
              />
            </label>

            {(activeBeat === 1 || activeBeat === 2) && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-cream/15 bg-pine-elevated/60 p-4 backdrop-blur-sm">
                <SoundWaveIcon className="h-7 w-7 shrink-0 text-butter" />
                <p className="text-sm leading-relaxed text-cream/85">
                  Owner voice, on demand. Record a few words and let {resolvedName} hear your calm
                  voice right in the middle of the day.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#how-it-works" className="btn-primary btn-magnetic bg-butter text-cocoa">
                Explore the Vault
                <ArrowRightIcon className="ml-2 inline-block h-4 w-4" />
              </a>
              <a
                href="#configure"
                className="btn-magnetic inline-flex items-center rounded-full border border-cream/40 bg-pine-base/70 backdrop-blur-sm px-6 py-3 text-cream"
              >
                Build Yours
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-6 z-10 flex items-center gap-5 sm:left-10 lg:left-16">
          {BEATS.map((item, index) => (
            <button
              key={item.rail}
              type="button"
              onClick={() => goToBeat(index)}
              aria-label={`Go to ${item.time}`}
              className={`tnum text-sm tracking-wider transition-colors ${
                index === activeBeat ? "text-butter" : "text-cream/50 hover:text-cream"
              }`}
            >
              {item.rail}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
