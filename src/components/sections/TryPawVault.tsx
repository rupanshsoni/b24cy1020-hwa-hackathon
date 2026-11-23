"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/StoreContext";
import {
  ScratchPadIcon,
  BallFunnelIcon,
  PawPaddleIcon,
  ScentWheelIcon,
  LickDomeIcon,
  TrophySparkIcon,
  CheckIcon,
  RotateCcwIcon,
  PawIcon,
  ArrowRightIcon,
} from "@/components/icons/PawVaultIcons";
import {
  DogMoodIllustration,
  ScratchDeckSvg,
  FunnelTargetSvg,
  RubberBallSvg,
  KibbleClusterSvg,
  DentalChewSvg,
  ForageWheelSvg,
  TreatBiscuitSvg,
  LickDomeSvg,
  type DogMood,
} from "@/components/icons/PuzzleSvgs";

type Feedback = "tick" | "success" | "chime" | "purr";

type StageInfo = {
  title: string;
  hint: string;
  icon: "scratch" | "ball" | "paddle" | "scent" | "lick";
  bg: string;
};

const stageInfo: StageInfo[] = [
  { title: "Scratch-to-Unlock Nail Pad", hint: "Scrape the grit pad 4 times, then lock the safety cap.", icon: "scratch", bg: "bg-sand" },
  { title: "Ball-Drop Seesaw Vault", hint: "Drag or click the blue ball into the funnel.", icon: "ball", bg: "bg-sky-surface" },
  { title: "Big Paw-Paddle Vault", hint: "Press the butter-yellow paddle to slide out the drawer.", icon: "paddle", bg: "bg-butter" },
  { title: "Nose-Spin Forage Wheel", hint: "Spin or nudge the pink wheel to reveal the treats.", icon: "scent", bg: "bg-blush" },
  { title: "Insulated Frozen Lick Dome", hint: "Rub the dome until your dog is completely calm.", icon: "lick", bg: "bg-mint" },
];

function StageIcon({ kind, className }: { kind: StageInfo["icon"]; className?: string }) {
  if (kind === "scratch") return <ScratchPadIcon className={className} />;
  if (kind === "ball") return <BallFunnelIcon className={className} />;
  if (kind === "paddle") return <PawPaddleIcon className={className} />;
  if (kind === "scent") return <ScentWheelIcon className={className} />;
  return <LickDomeIcon className={className} />;
}

const confettiColors = ["#4DA8DA", "#F5C942", "#F4B8C4"];

export default function TryPawVault() {
  const { dogName, applyPromo, openCart } = useStore();

  const [stage, setStage] = useState(0);
  const [scratches, setScratches] = useState(0);
  const [padLocked, setPadLocked] = useState(false);
  const [ballIn, setBallIn] = useState(false);
  const [drawerOut, setDrawerOut] = useState(false);
  const [wheelTurns, setWheelTurns] = useState(0);
  const [licks, setLicks] = useState(0);
  const [calmness, setCalmness] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [toast, setToast] = useState("");
  const [dragging, setDragging] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });

  const audioRef = useRef<AudioContext | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const funnelRef = useRef<HTMLDivElement>(null);
  const lastTurn = useRef(0);
  const toastTimer = useRef<number | null>(null);
  const stageTimer = useRef<number | null>(null);
  const scratchesRef = useRef(0);
  const wheelTurnsRef = useRef(0);
  const licksRef = useRef(0);

  useEffect(() => {
    setDragging(false);
    lastTurn.current = 0;
  }, [stage]);

  const speak = useCallback((kind: Feedback) => {
    try {
      if (!audioRef.current) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioRef.current = new Ctor();
      }
      const ctx = audioRef.current;
      void ctx.resume();
      const notes =
        kind === "success"
          ? [523.25, 659.25, 783.99]
          : kind === "chime"
            ? [659.25, 880]
            : kind === "purr"
              ? [180, 200]
              : [440];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const start = ctx.currentTime + i * 0.09;
        osc.type = kind === "tick" ? "square" : "sine";
        osc.frequency.setValueAtTime(f, start);
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(kind === "tick" ? 0.05 : 0.12, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + (kind === "purr" ? 0.5 : 0.28));
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.6);
      });
    } catch {
      // Audio is a bonus and never blocks play.
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (stageTimer.current !== null) window.clearTimeout(stageTimer.current);
      void audioRef.current?.close();
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2400);
  }, []);

  const bumpCalm = useCallback((points: number) => {
    setCalmness((c) => Math.min(100, c + points));
  }, []);

  const completeStage = useCallback(
    (next: number, message: string, finalCalm: boolean) => {
      speak("success");
      showToast(message);
      if (finalCalm) {
        setCalmness(100);
        setStage(5);
        setCelebrate(true);
        return;
      }
      bumpCalm(18);
      if (stageTimer.current !== null) window.clearTimeout(stageTimer.current);
      stageTimer.current = window.setTimeout(() => {
        setStage(next);
      }, 700);
    },
    [bumpCalm, showToast, speak],
  );

  const scratch = useCallback(() => {
    if (stage !== 0 || padLocked || scratchesRef.current >= 4) return;
    const next = scratchesRef.current + 1;
    scratchesRef.current = next;
    setScratches(next);
    speak("tick");
    if (next >= 4) {
      setPadLocked(true);
      completeStage(1, "Nails filed and pad locked. Over-filing cap on!", false);
    }
  }, [completeStage, padLocked, speak, stage]);

  const dropBall = useCallback(() => {
    if (stage !== 1 || ballIn) return;
    setBallIn(true);
    setBallPos({ x: 0, y: 0 });
    completeStage(2, "Seesaw tipped. Kibble treats are bouncing out!", false);
  }, [ballIn, completeStage, stage]);

  const pressPaddle = useCallback(() => {
    if (stage !== 2 || drawerOut) return;
    setDrawerOut(true);
    completeStage(3, "Drawer slid open. Dental chew revealed!", false);
  }, [completeStage, drawerOut, stage]);

  const spinWheel = useCallback(() => {
    if (stage !== 3 || wheelTurnsRef.current >= 3) return;
    const next = wheelTurnsRef.current + 1;
    wheelTurnsRef.current = next;
    setWheelTurns(next);
    speak("tick");
    if (next >= 3) completeStage(4, "Scent window aligned. Hidden treats dropped!", false);
  }, [completeStage, speak, stage]);

  const lick = useCallback(() => {
    if (stage !== 4 || licksRef.current >= 12) return;
    const next = licksRef.current + 1;
    licksRef.current = next;
    setLicks(next);
    setCalmness((c) => Math.min(100, c + 8));
    if (next % 3 === 0) speak("purr");
    if (next >= 12) completeStage(5, `${dogName} is calm and happy!`, true);
  }, [completeStage, dogName, speak, stage]);

  const onBallMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || stage !== 1) return;
      const funnel = funnelRef.current?.getBoundingClientRect();
      const ball = ballRef.current?.getBoundingClientRect();
      if (!funnel || !ball) return;
      setBallPos({
        x: e.clientX - ball.left - ball.width / 2,
        y: e.clientY - ball.top - ball.height / 2,
      });
      const bx = e.clientX;
      const by = e.clientY;
      if (
        bx >= funnel.left - 20 &&
        bx <= funnel.right + 20 &&
        by >= funnel.top - 20 &&
        by <= funnel.bottom + 20
      ) {
        dropBall();
      }
    },
    [dragging, dropBall, stage],
  );

  const onWheelMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging || stage !== 3) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const angle = Math.atan2(
        e.clientY - (rect.top + rect.height / 2),
        e.clientX - (rect.left + rect.width / 2),
      );
      if (Math.abs(angle - lastTurn.current) > 0.6) {
        lastTurn.current = angle;
        spinWheel();
      }
    },
    [dragging, spinWheel, stage],
  );

  const playAgain = useCallback(() => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    if (stageTimer.current !== null) window.clearTimeout(stageTimer.current);
    setStage(0);
    scratchesRef.current = 0;
    wheelTurnsRef.current = 0;
    licksRef.current = 0;
    setScratches(0);
    setPadLocked(false);
    setBallIn(false);
    setDrawerOut(false);
    setWheelTurns(0);
    setLicks(0);
    setCalmness(0);
    setCelebrate(false);
    setToast("");
    setDragging(false);
    setBallPos({ x: 0, y: 0 });
    lastTurn.current = 0;
  }, []);

  const applyDiscount = useCallback(() => {
    const result = applyPromo("GOODBOY15");
    showToast(result.message);
    speak("chime");
    openCart();
  }, [applyPromo, openCart, showToast, speak]);

  const dogMood: DogMood =
    calmness >= 100 ? "calm" : calmness >= 70 ? "settled" : calmness >= 35 ? "curious" : "restless";

  const confetti = celebrate
    ? Array.from({ length: 40 }).map((_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${(i * 19) % 60}%`,
        backgroundColor: confettiColors[i % confettiColors.length],
        animationDelay: `${((i * 7) % 8) / 10}s`,
        animationDuration: `${1.2 + ((i * 3) % 10) / 10}s`,
      }))
    : [];

  return (
    <section
      id="try"
      data-nav-theme="light"
      className="scroll-mt-24 -mt-10 rounded-t-[40px] bg-sky-surface pt-24 pb-28 text-pine lg:-mt-14 lg:rounded-t-[56px]"
    >
      <div className="section-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Try PawVault yourself</p>
          <h2 className="display-title mt-3">Five puzzles. Can you calm {dogName}?</h2>
          <p className="mt-4 text-cocoa/65">
            Play through the same sequence a dog experiences. Drag, swipe or simply click. Every
            interaction is accessible, with gentle synthesized feedback.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div
            ref={stageRef}
            className={`card relative min-h-[520px] overflow-hidden p-6 sm:p-8 ${
              stage < 5 ? stageInfo[stage].bg : "bg-mint"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Stage {Math.min(stage + 1, 5)} of 5</p>
                <h3 className="mt-1 font-display text-2xl font-bold">
                  {stage < 5 ? stageInfo[stage].title : "All five puzzles complete!"}
                </h3>
                <p className="mt-1 text-sm text-cocoa/60">
                  {stage < 5 ? stageInfo[stage].hint : "You did it. Go claim your reward."}
                </p>
              </div>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/70">
                {stage < 5 ? (
                  <StageIcon kind={stageInfo[stage].icon} className="h-8 w-8 text-pine" />
                ) : (
                  <TrophySparkIcon className="h-8 w-8 text-butter-ink" />
                )}
              </span>
            </div>

            <div className="mt-8 grid min-h-[320px] place-items-center">
              {stage === 0 && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={scratch}
                    disabled={padLocked}
                    className="mx-auto block rounded-2xl transition active:translate-y-1 disabled:opacity-100"
                    aria-label="Scratch the grit pad"
                  >
                    <ScratchDeckSvg
                      scrapes={scratches}
                      locked={padLocked}
                      className={`h-52 w-72 drop-shadow-sm ${padLocked ? "ring-4 ring-sky/50" : ""}`}
                    />
                  </button>
                  <div
                    className={`mx-auto mt-3 h-2 w-48 rounded-full ${
                      padLocked ? "bg-sky shadow-[0_0_18px_#4DA8DA]" : "bg-cocoa/10"
                    }`}
                  />
                  <p className="mt-4 text-sm font-bold">
                    {padLocked
                      ? "Sky Blue LED lit. Safety Cap locked"
                      : `Scrapes: ${scratches} / 4`}
                  </p>
                  {padLocked && (
                    <span className="chip mt-2 bg-sky/15">
                      <CheckIcon className="h-4 w-4 text-pine" />
                      Over-Filing Safety Cap
                    </span>
                  )}
                </div>
              )}

              {stage === 1 && (
                <div className="relative h-64 w-full max-w-md">
                  <div
                    ref={funnelRef}
                    className="absolute left-1/2 top-2 h-24 w-24 -translate-x-1/2"
                  >
                    <FunnelTargetSvg className="h-full w-full" />
                  </div>
                  <div
                    ref={ballRef}
                    role="button"
                    tabIndex={0}
                    aria-label="Drag or press the rubber ball into the funnel"
                    onPointerDown={() => {
                      setDragging(true);
                    }}
                    onPointerMove={onBallMove}
                    onPointerUp={() => setDragging(false)}
                    onClick={dropBall}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") dropBall();
                    }}
                    className="absolute bottom-6 left-1/2 grid h-16 w-16 cursor-grab place-items-center active:cursor-grabbing"
                    style={{
                      transform: `translate(calc(-50% + ${ballPos.x}px), ${ballPos.y}px)`,
                    }}
                  >
                    <RubberBallSvg className={`pointer-events-none h-full w-full ${dragging ? "drop-shadow-lg" : ""}`} />
                  </div>
                  {ballIn && (
                    <div className="fade-up absolute bottom-2 right-4">
                      <KibbleClusterSvg className="h-20 w-32" />
                    </div>
                  )}
                </div>
              )}

              {stage === 2 && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={pressPaddle}
                    disabled={drawerOut}
                    className={`mx-auto flex h-20 w-56 items-center justify-center gap-2 rounded-3xl bg-butter text-lg font-bold text-cocoa shadow-soft transition active:translate-y-1 ${
                      drawerOut ? "ring-4 ring-butter/60" : ""
                    }`}
                    aria-label="Press the paw paddle"
                  >
                    <PawIcon className="h-6 w-6" />
                    Press the paddle
                  </button>
                  <div
                    className={`mx-auto mt-2 h-20 w-48 overflow-hidden rounded-2xl border-4 border-cocoa/10 bg-[#f0e4cd] transition-all duration-700 ${
                      drawerOut ? "translate-y-6" : ""
                    }`}
                  >
                    <span className="grid h-full place-items-center">
                      {drawerOut && <DentalChewSvg className="h-16 w-40" />}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-bold">
                    {drawerOut ? "Dental chew revealed!" : "Spring-damped drawer ready"}
                  </p>
                </div>
              )}

              {stage === 3 && (
                <div className="text-center">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Spin the forage wheel"
                    onPointerDown={() => {
                      setDragging(true);
                    }}
                    onPointerMove={onWheelMove}
                    onPointerUp={() => setDragging(false)}
                    onClick={spinWheel}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") spinWheel();
                    }}
                    className="mx-auto h-40 w-40 cursor-grab rounded-full shadow-soft active:cursor-grabbing"
                  >
                    <ForageWheelSvg className="pointer-events-none h-full w-full" rotation={wheelTurns * 45} />
                  </div>
                  <p className="mt-5 text-sm font-bold">
                    Scent window turns: {wheelTurns} / 3
                  </p>
                  {wheelTurns >= 3 && (
                    <div className="fade-up mt-1 flex justify-center">
                      <TreatBiscuitSvg className="h-20 w-36" />
                    </div>
                  )}
                </div>
              )}

              {stage === 4 && (
                <div className="text-center">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Rub the frozen lick dome"
                    onPointerDown={() => {
                      setDragging(true);
                      lick();
                    }}
                    onPointerMove={(e) => {
                      if (dragging) lick();
                    }}
                    onPointerUp={() => setDragging(false)}
                    onClick={lick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") lick();
                    }}
                    className="mx-auto h-44 w-56 cursor-pointer drop-shadow-sm"
                  >
                    <LickDomeSvg licks={licks} className="pointer-events-none h-full w-full" />
                  </div>
                  <p className="mt-4 text-sm font-bold">Rubs: {licks} / 12. Keep going!</p>
                </div>
              )}

              {stage === 5 && (
                <div className="fade-up text-center">
                  <div className="mx-auto h-28 w-28">
                    <DogMoodIllustration mood="calm" className="h-full w-full" />
                  </div>
                  <p className="mt-4 font-display text-2xl font-bold">
                    {dogName} is calm, happy and ready for you.
                  </p>
                  <span className="chip mt-4 bg-mint/60">
                    <CheckIcon className="h-4 w-4 text-pine" />
                    GOODBOY15 unlocked. 15% off
                  </span>
                  <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={applyDiscount} className="btn-primary">
                      Apply GOODBOY15 to Cart
                    </button>
                    <Link href="#configure" className="btn-ghost" onClick={() => applyPromo("GOODBOY15")}>
                      Configure with 15% off
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {celebrate && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {confetti.map((style, i) => (
                  <span key={i} className="absolute block h-2 w-2 animate-bounce rounded-sm" style={style} />
                ))}
              </div>
            )}

            {toast && (
              <div className="fade-up absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-cocoa px-5 py-2 text-sm font-semibold text-cream shadow-lift">
                {toast}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="card bg-cream p-6">
              <p className="eyebrow">Dog calmness meter</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-16 w-16 shrink-0">
                  <DogMoodIllustration mood={dogMood} className="h-full w-full" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-3xl font-bold tnum">{calmness}%</p>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-cocoa/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky to-butter transition-all duration-500"
                      style={{ width: `${calmness}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-cocoa/55">
                {calmness >= 100
                  ? `${dogName} is completely calm. Well played!`
                  : "Each interaction raises calmness. Finish all five stages to reach 100%."}
              </p>
            </div>

            <div className="card bg-cream p-6">
              <p className="eyebrow">Your journey</p>
              <ol className="mt-3 space-y-2">
                {stageInfo.map((s, i) => (
                  <li
                    key={s.title}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                      i < stage
                        ? "bg-mint/40"
                        : i === stage
                          ? "bg-sky/15 font-bold"
                          : "text-cocoa/40"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${
                        i < stage ? "bg-cocoa text-butter" : "bg-cocoa/10"
                      }`}
                    >
                      {i < stage ? <CheckIcon className="h-4 w-4" /> : i + 1}
                    </span>
                    {s.title}
                  </li>
                ))}
              </ol>
            </div>

            <button type="button" onClick={playAgain} className="btn-ghost w-full">
              <RotateCcwIcon className="h-4 w-4" />
              Play again
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
