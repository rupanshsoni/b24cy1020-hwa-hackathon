"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/store/StoreContext";

declare global {
  interface Window {
    pawvaultLenis?: Lenis;
  }
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const { cartOpen } = useStore();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.documentElement.dataset.smoothScroll = "off";
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });
    lenisRef.current = lenis;
    window.pawvaultLenis = lenis;
    document.documentElement.dataset.smoothScroll = "on";

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    const onAnchor = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const el = document.querySelector(hash);
      if (!(el instanceof HTMLElement)) return;
      event.preventDefault();
      lenis.scrollTo(el, { offset: -72, duration: 1.1 });
      if (window.location.hash !== hash) {
        window.history.pushState(null, "", hash);
      }
    };
    document.addEventListener("click", onAnchor);

    return () => {
      document.removeEventListener("click", onAnchor);
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
      delete window.pawvaultLenis;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (cartOpen) lenis.stop();
    else lenis.start();
  }, [cartOpen]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const cursor = document.createElement("div");
    cursor.className = "cuberto-cursor";
    cursor.setAttribute("data-mode", "default");

    const dot = document.createElement("div");
    dot.className = "cuberto-cursor-dot";

    const arrow = document.createElement("span");
    arrow.className = "cuberto-cursor-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.innerHTML =
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';

    const label = document.createElement("span");
    label.className = "cuberto-cursor-label";

    dot.appendChild(arrow);
    dot.appendChild(label);
    cursor.appendChild(dot);
    document.body.appendChild(cursor);

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const moveX = gsap.quickTo(cursor, "x", { duration: 0.22, ease: "power3.out" });
    const moveY = gsap.quickTo(cursor, "y", { duration: 0.22, ease: "power3.out" });

    let lastX = 0;
    let lastY = 0;
    let pointerActive = false;
    let currentMode = "default";
    let currentLabel = "";

    const setMode = (mode: string, text: string) => {
      if (mode !== currentMode) {
        currentMode = mode;
        cursor.setAttribute("data-mode", mode);
      }
      if (text !== currentLabel) {
        currentLabel = text;
        label.textContent = text;
      }
    };

    setMode("default", "");

    const updateMode = () => {
      if (!pointerActive) return;
      const el = document.elementFromPoint(lastX, lastY) as HTMLElement | null;
      if (!el) {
        setMode("default", "");
        return;
      }

      if (el.closest("[data-cursor='drag']")) {
        setMode("drag", el.closest<HTMLElement>("[data-cursor='drag']")?.dataset.cursorLabel || "Drag");
        return;
      }
      if (el.closest("[data-cursor-icon='arrow-up-right']")) {
        setMode("arrow", "");
        return;
      }
      const zone = el.closest<HTMLElement>("[data-cursor]");
      if (zone?.dataset.cursor) {
        setMode("drag", zone.dataset.cursor);
        return;
      }
      if (el.closest("a, button, [role='button'], input, select, textarea, label")) {
        setMode("pointer", "");
        return;
      }
      setMode("default", "");
    };

    let magneticEl: HTMLElement | null = null;

    const resetMagnet = () => {
      if (magneticEl) gsap.to(magneticEl, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      magneticEl = null;
    };

    const onPointerMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      pointerActive = true;
      cursor.style.opacity = "1";
      moveX(e.clientX);
      moveY(e.clientY);

      const target = (e.target as HTMLElement)?.closest<HTMLElement>(".btn-magnetic");
      if (target !== magneticEl) {
        resetMagnet();
        magneticEl = target;
      }
      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(magneticEl, { x: x * 0.22, y: y * 0.3, duration: 0.35, ease: "power2.out" });
      }

      updateMode();
    };

    const onPointerLeave = () => {
      pointerActive = false;
      setMode("default", "");
      cursor.style.opacity = "0";
      resetMagnet();
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", updateMode, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", updateMode);
      document.removeEventListener("pointerleave", onPointerLeave);
      resetMagnet();
      gsap.killTweensOf(cursor);
      cursor.remove();
    };
  }, []);

  return <>{children}</>;
}
