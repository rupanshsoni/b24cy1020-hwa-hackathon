"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { MaskedHeading } from "@/components/MotionPrimitives";
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

function pointerAngle(e: React.PointerEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  return Math.atan2(
    e.clientY - (rect.top + rect.height / 2),
    e.clientX - (rect.left + rect.width / 2),
  );
}

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
  const stageContentRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const funnelRef = useRef<HTMLDivElement>(null);
  const playfieldRef = useRef<HTMLDivElement>(null);
  const dragOriginRef = useRef<{
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
    moved: boolean;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    restCenterX: number;
    restCenterY: number;
  } | null>(null);
  const ballDroppedRef = useRef(false);
  const justDraggedRef = useRef(false);
  const ballPointerId = useRef<number | null>(null);
  const lastTurn = useRef(0);
  const toastTimer = useRef<number | null>(null);
  const stageTimer = useRef<number | null>(null);
  const scratchesRef = useRef(0);
  const wheelTurnsRef = useRef(0);
  const licksRef = useRef(0);

  useEffect(() => {
    setDragging(false);
    lastTurn.current = 0;
    if (stage !== 1) {
      ballDroppedRef.current = false;
      dragOriginRef.current = null;
      justDraggedRef.current = false;
      ballPointerId.current = null;
    }
  }, [stage]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = stageContentRef.current;
    if (!node) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { autoAlpha: 0, y: 18, scale: 0.97 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: "expo.out",
          clearProps: "transform,opacity,visibility",
        },
      );
    }, node);
    return () => ctx.revert();
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

  const pointInFunnel = useCallback((cx: number, cy: number, padding: number) => {
    const f = funnelRef.current?.getBoundingClientRect();
    if (!f) return false;
    return (
      cx >= f.left - padding &&
      cx <= f.right + padding &&
      cy >= f.top - padding &&
      cy <= f.bottom + padding
    );
  }, []);

  const dropBall = useCallback(() => {
    if (stage !== 1 || ballIn || ballDroppedRef.current) return;
    ballDroppedRef.current = true;
    const ball = ballRef.current;
    if (ball && ball.hasPointerCapture) {
      const id = dragOriginRef.current ? ballPointerId.current : null;
      if (id !== null && ball.hasPointerCapture(id)) ball.releasePointerCapture(id);
    }
    dragOriginRef.current = null;
    justDraggedRef.current = false;
    setDragging(false);
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

  const onBallDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (stage !== 1 || ballIn || ballDroppedRef.current) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      ballPointerId.current = e.pointerId;

      const ballRect = ballRef.current?.getBoundingClientRect();
      const fieldRect = playfieldRef.current?.getBoundingClientRect();
      if (!ballRect || !fieldRect) return;

      const restingLeft = ballRect.left - ballPos.x;
      const restingTop = ballRect.top - ballPos.y;
      dragOriginRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        startX: ballPos.x,
        startY: ballPos.y,
        moved: false,
        minX: fieldRect.left - restingLeft,
        maxX: fieldRect.right - ballRect.width - restingLeft,
        minY: fieldRect.top - restingTop,
        maxY: fieldRect.bottom - ballRect.height - restingTop,
        restCenterX: restingLeft + ballRect.width / 2,
        restCenterY: restingTop + ballRect.height / 2,
      };
      setDragging(true);
    },
    [ballIn, ballPos.x, ballPos.y, stage],
  );

  const onBallMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const origin = dragOriginRef.current;
      if (!origin || stage !== 1 || ballDroppedRef.current) return;

      const dx = e.clientX - origin.pointerX;
      const dy = e.clientY - origin.pointerY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) origin.moved = true;

      const nextX = Math.max(origin.minX, Math.min(origin.maxX, origin.startX + dx));
      const nextY = Math.max(origin.minY, Math.min(origin.maxY, origin.startY + dy));
      setBallPos({ x: nextX, y: nextY });

      const centerX = origin.restCenterX + nextX;
      const centerY = origin.restCenterY + nextY;
      if (pointInFunnel(centerX, centerY, 36) || pointInFunnel(e.clientX, e.clientY, 36)) {
        const ball = ballRef.current;
        if (ball && ballPointerId.current !== null && ball.hasPointerCapture(ballPointerId.current)) {
          ball.releasePointerCapture(ballPointerId.current);
        }
        ballPointerId.current = null;
        dropBall();
      }
    },
    [dropBall, pointInFunnel, stage],
  );

  const onBallUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const ball = ballRef.current;
      if (ball && ball.hasPointerCapture(e.pointerId)) ball.releasePointerCapture(e.pointerId);
      ballPointerId.current = null;

      const origin = dragOriginRef.current;
      dragOriginRef.current = null;
      setDragging(false);
      if (stage !== 1 || ballDroppedRef.current) return;

      const f = funnelRef.current?.getBoundingClientRect();
      const finalX = origin
        ? Math.max(origin.minX, Math.min(origin.maxX, e.clientX - origin.pointerX))
        : 0;
      const finalY = origin
        ? Math.max(origin.minY, Math.min(origin.maxY, e.clientY - origin.pointerY))
        : 0;
      const centerX = origin ? origin.restCenterX + finalX : e.clientX;
      const centerY = origin ? origin.restCenterY + finalY : e.clientY;
      const funnelCenterX = f ? f.left + f.width / 2 : Number.POSITIVE_INFINITY;
      const funnelCenterY = f ? f.top + f.height / 2 : Number.POSITIVE_INFINITY;
      const nearCenter = Math.hypot(e.clientX - funnelCenterX, e.clientY - funnelCenterY) <= 60;

      if (
        !origin?.moved ||
        nearCenter ||
        Math.hypot(centerX - funnelCenterX, centerY - funnelCenterY) <= 60 ||
        pointInFunnel(centerX, centerY, 36) ||
        pointInFunnel(e.clientX, e.clientY, 36)
      ) {
        dropBall();
        return;
      }

      justDraggedRef.current = true;
      setBallPos({ x: 0, y: 0 });
    },
    [dropBall, pointInFunnel, stage],
  );

  const onBallCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const ball = ballRef.current;
      if (ball && ball.hasPointerCapture(e.pointerId)) ball.releasePointerCapture(e.pointerId);
      ballPointerId.current = null;
      dragOriginRef.current = null;
      setDragging(false);
      setBallPos({ x: 0, y: 0 });
    },
    [],
  );

  const onWheelDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      lastTurn.current = pointerAngle(e);
      setDragging(true);
    },
    [],
  );

  const onWheelMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging || stage !== 3) return;
      const angle = pointerAngle(e);
      if (Math.abs(angle - lastTurn.current) > 0.6) {
        lastTurn.current = angle;
        spinWheel();
      }
    },
    [dragging, spinWheel, stage],
  );

  const endPointerCapture = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  }, []);

  const onLickDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      lick();
    },
    [lick],
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
    ballDroppedRef.current = false;
    dragOriginRef.current = null;
    justDraggedRef.current = false;
    ballPointerId.current = null;
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
          <MaskedHeading as="h2" className="display-title mt-3">
            Five puzzles. Can you calm {dogName}?
          </MaskedHeading>
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

            <div ref={stageContentRef} className="mt-8 grid min-h-[320px] place-items-center">
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
                <div className="w-full max-w-md text-center">
                  <div ref={playfieldRef} className="relative h-64 w-full">
                    <div
                      ref={funnelRef}
                      role="button"
                      tabIndex={0}
                      aria-label="Drop ball into funnel"
                      onClick={dropBall}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          dropBall();
                        }
                      }}
                      className="absolute left-1/2 top-2 h-24 w-24 -translate-x-1/2 cursor-pointer rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-led/40"
                    >
                      <FunnelTargetSvg className="h-full w-full" />
                    </div>
                    <div
                      ref={ballRef}
                      role="button"
                      tabIndex={0}
                      data-cursor="drag"
                      aria-label="Drag or press the rubber ball into the funnel"
                      onPointerDown={onBallDown}
                      onPointerMove={onBallMove}
                      onPointerUp={onBallUp}
                      onPointerCancel={onBallCancel}
                      onClick={() => {
                        if (justDraggedRef.current) {
                          justDraggedRef.current = false;
                          return;
                        }
                        dropBall();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") dropBall();
                      }}
                      className={`absolute bottom-6 left-1/2 grid h-16 w-16 touch-none select-none place-items-center active:cursor-grabbing ${
                        dragging ? "cursor-grabbing" : "cursor-grab transition-transform duration-300 ease-out"
                      } ${ballIn ? "pointer-events-none scale-75 opacity-0" : ""}`}
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
                  <button
                    type="button"
                    onClick={dropBall}
                    disabled={ballIn}
                    className="btn-ghost mt-4"
                  >
                    Drop ball into funnel
                  </button>
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
                    data-cursor="drag"
                    aria-label="Spin the forage wheel"
                    onPointerDown={onWheelDown}
                    onPointerMove={onWheelMove}
                    onPointerUp={endPointerCapture}
                    onPointerCancel={endPointerCapture}
                    onClick={spinWheel}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") spinWheel();
                    }}
                    className="mx-auto h-40 w-40 cursor-grab touch-none select-none rounded-full shadow-soft active:cursor-grabbing"
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
                    data-cursor="drag"
                    aria-label="Rub the frozen lick dome"
                    onPointerDown={onLickDown}
                    onPointerMove={(e) => {
                      if (dragging) lick();
                    }}
                    onPointerUp={endPointerCapture}
                    onPointerCancel={endPointerCapture}
                    onClick={lick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") lick();
                    }}
                    className="mx-auto h-44 w-56 cursor-pointer touch-none select-none drop-shadow-sm"
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
