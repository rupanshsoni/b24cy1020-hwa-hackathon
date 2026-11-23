"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createHeroStage, type HeroStageHandle } from "@/components/three/heroStage";
import { CubertoButton } from "@/components/MotionPrimitives";
import { SoundWaveIcon, ArrowRightIcon } from "@/components/icons/PawVaultIcons";
import { useStore } from "@/store/StoreContext";

declare global {
  interface Window {
    __pawvaultHeroReady?: boolean;
  }
}

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
  const contentRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLSpanElement | null>(null);
  const lineRef = useRef<HTMLParagraphElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const stageRef = useRef<HeroStageHandle | null>(null);
  const beatRef = useRef(0);
  const hasMountedBeatRef = useRef(false);
  const [activeBeat, setActiveBeat] = useState(0);
  const [stageReady, setStageReady] = useState(false);
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
  const showVoiceCallout = activeBeat === 1 || activeBeat === 2;

  useEffect(() => {
    let stage: HeroStageHandle | null = null;
    const onFirstFrame = () => {
      setStageReady(true);
      window.__pawvaultHeroReady = true;
      window.dispatchEvent(new CustomEvent("pawvault:hero-ready"));
    };

    if (mountRef.current) {
      try {
        stage = createHeroStage(mountRef.current, { onFirstFrame });
        stageRef.current = stage;
      } catch {
        setWebglFailed(true);
        onFirstFrame();
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!contentRef.current) return;

    const ctx = gsap.context(() => {
      const staggerItems = contentRef.current?.querySelectorAll<HTMLElement>(".hero-stagger");
      if (staggerItems && staggerItems.length > 0) {
        gsap.fromTo(
          staggerItems,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.07,
            ease: "expo.out",
            clearProps: "transform,opacity,visibility",
          },
        );
      }
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 0.85,
            delay: 0.12,
            ease: "expo.out",
            clearProps: "transform",
          },
        );
      }
    }, contentRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 73px",
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
    if (!hasMountedBeatRef.current) {
      hasMountedBeatRef.current = true;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (headlineRef.current) {
      gsap.fromTo(
        headlineRef.current,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 0.75,
          ease: "expo.out",
          overwrite: true,
          clearProps: "transform",
        },
      );
    }

    const subTargets = [lineRef.current, subRef.current].filter(Boolean);
    if (subTargets.length > 0) {
      gsap.fromTo(
        subTargets,
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.06,
          ease: "power3.out",
          overwrite: true,
          clearProps: "transform,opacity,visibility",
        },
      );
    }
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
    const top = Math.max(0, window.scrollY + section.getBoundingClientRect().top - 73);
    const travel = Math.max(1, section.offsetHeight - (window.innerHeight - 73));
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
        className="sticky top-[73px] h-[calc(100vh-73px)] w-full overflow-hidden"
        onPointerMove={handlePointerMove}
      >
        <div
          className={`absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
            stageReady ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
          {webglFailed && (
            <img
              src="/images/pawvault-smart-hero.webp"
              alt=""
              className="h-full w-full scale-[1.06] object-cover object-[45%_48%]"
            />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(12,38,33,0.68),transparent_72%)] sm:bg-[radial-gradient(ellipse_at_left,rgba(12,38,33,0.88),transparent_68%)]" />

        <div className="section-shell relative z-10 mx-auto flex h-full w-full items-center px-6 pt-4 pb-16 sm:px-10 sm:pt-6 sm:pb-20 lg:px-16">
          <div ref={contentRef} className="max-w-xl text-cream">
            <span className="hero-stagger eyebrow chip inline-flex items-center rounded-full border border-cream/25 bg-cream/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-sm">
              A full workday of calm
            </span>

            <div className="hero-stagger mt-3.5 flex items-baseline gap-3">
              <span className="tnum text-sm font-medium tracking-[0.2em] text-butter uppercase">
                {beat.time}
              </span>
            </div>

            <h1 className="display-title font-display mt-1.5 text-4xl leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              <span className="block overflow-hidden py-[0.06em] -my-[0.06em]">
                <span ref={headlineRef} className="block will-change-transform">
                  {beat.title}
                </span>
              </span>
            </h1>

            <p
              ref={lineRef}
              className="hero-stagger mt-2.5 text-base leading-snug text-cream/90 sm:text-lg"
            >
              {beat.line(resolvedName)}
            </p>
            <p
              ref={subRef}
              className="hero-stagger mt-1.5 max-w-lg text-sm leading-relaxed text-cream/70"
            >
              {beat.sub(resolvedName)}
            </p>

            <label className="hero-stagger mt-4 block max-w-sm" htmlFor="hero-dog-name">
              <span className="mb-1.5 block text-xs font-medium tracking-wide text-cream/70 uppercase">
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
                className="w-full rounded-xl border border-cream/25 bg-pine-base/75 px-4 py-2.5 text-cream backdrop-blur-sm placeholder:text-cream/40 focus:border-butter focus:outline-none"
              />
            </label>

            <div className="mt-3.5 min-h-[76px]">
              <div
                aria-hidden={!showVoiceCallout}
                className={`flex items-start gap-3 rounded-2xl border border-cream/15 bg-pine-elevated/65 p-3.5 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                  showVoiceCallout
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <SoundWaveIcon className="h-6 w-6 shrink-0 text-butter" />
                <p className="text-sm leading-relaxed text-cream/85">
                  Owner voice, on demand. Record a few words and let {resolvedName} hear your calm
                  voice right in the middle of the day.
                </p>
              </div>
            </div>

            <div className="hero-stagger mt-4 flex flex-wrap items-center gap-4">
              <CubertoButton href="#how-it-works" variant="primary">
                Explore the Vault
                <ArrowRightIcon className="h-4 w-4" />
              </CubertoButton>
              <CubertoButton href="#configure" variant="dark">
                Build Yours
              </CubertoButton>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-6 z-20 flex items-center gap-5 sm:bottom-6 sm:left-10 lg:left-16">
          {BEATS.map((item, index) => {
            const active = index === activeBeat;
            return (
              <button
                key={item.rail}
                type="button"
                onClick={() => goToBeat(index)}
                aria-label={`Go to ${item.time}`}
                aria-current={active ? "step" : undefined}
                className={`tnum relative pb-1 text-sm tracking-wider transition-colors ${
                  active ? "font-semibold text-butter" : "text-cream/50 hover:text-cream"
                }`}
              >
                {item.rail}
                <span
                  aria-hidden="true"
                  className={`absolute right-0 bottom-0 left-0 h-[2px] rounded-full bg-butter transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
