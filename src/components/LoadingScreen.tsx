"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import PawIcon from "@/components/PawIcon";

declare global {
  interface Window {
    __pawvaultHeroReady?: boolean;
  }
}

const SAFETY_TIMEOUT = 8500;
const MIN_DISPLAY = 400;
const HOLD_AT_FULL = 160;
const EXIT_DURATION = 750;

export default function LoadingScreen() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);

  const readyRef = useRef(false);
  const finishStartedRef = useRef(false);
  const startedAtRef = useRef(0);
  const reducedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const waitTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  const beginFinish = useCallback(() => {
    if (finishStartedRef.current) return;
    finishStartedRef.current = true;

    const complete = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setProgress(100);

      if (reducedRef.current) {
        setDone(true);
        return;
      }

      holdTimerRef.current = window.setTimeout(() => {
        setExiting(true);
        exitTimerRef.current = window.setTimeout(() => setDone(true), EXIT_DURATION);
      }, HOLD_AT_FULL);
    };

    const remaining = MIN_DISPLAY - (Date.now() - startedAtRef.current);
    if (remaining > 0) {
      waitTimerRef.current = window.setTimeout(complete, remaining);
    } else {
      complete();
    }
  }, []);

  useEffect(() => {
    startedAtRef.current = Date.now();
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let current = 0;
    const tick = () => {
      if (readyRef.current || finishStartedRef.current) return;
      current += (92 - current) * 0.045;
      if (current > 91.9) current = 92;
      setProgress(current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onReady = () => {
      if (readyRef.current) return;
      readyRef.current = true;
      beginFinish();
    };

    let safety: number | null = null;
    if (pathname !== "/") {
      onReady();
    } else {
      if (window.__pawvaultHeroReady) onReady();
      window.addEventListener("pawvault:hero-ready", onReady);
      safety = window.setTimeout(onReady, SAFETY_TIMEOUT);
    }

    return () => {
      window.removeEventListener("pawvault:hero-ready", onReady);
      readyRef.current = false;
      finishStartedRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (safety !== null) window.clearTimeout(safety);
      if (waitTimerRef.current !== null) window.clearTimeout(waitTimerRef.current);
      if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current);
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
    };
  }, [beginFinish, pathname]);

  if (done) return null;

  return (
    <div
      role="status"
      aria-label="Loading PawVault"
      className={`motion-reduce:!transition-none fixed inset-0 z-[100] flex items-center justify-center bg-[#12352E] ${
        exiting ? "pointer-events-none -translate-y-full rounded-b-[40px] lg:rounded-b-[56px]" : "translate-y-0"
      }`}
      style={{
        transition:
          "transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.75s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="flex w-full flex-col items-center px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#F7EFE2]/35 bg-[#F5C942] shadow-[0_14px_44px_rgba(0,0,0,0.28)]">
          <PawIcon className="h-10 w-10 text-[#12352E]" />
        </div>

        <div className="font-display mt-6 text-4xl tracking-tight text-[#F7EFE2] sm:text-5xl">
          PawVault
        </div>

        <p className="mt-3 text-sm text-[#F7EFE2]/75 sm:text-base">
          Preparing your dog&apos;s calm workday...
        </p>

        <div className="mt-10 w-full max-w-xs" aria-hidden="true">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F7EFE2]/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F5C942] via-[#4DA8DA] to-[#85CAEF]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="tnum mt-3 flex items-center justify-between text-[13px] font-semibold tracking-wide text-[#F7EFE2]/75">
            <span>LOADING</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
