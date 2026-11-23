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

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.style.opacity = "0";
    document.body.appendChild(dot);
    let currentLabel = "";
    const setLabel = (label: string) => {
      if (label === currentLabel) return;
      currentLabel = label;
      dot.textContent = label;
      dot.style.width = label ? "auto" : "10px";
      dot.style.height = label ? "auto" : "10px";
      dot.style.padding = label ? "8px 14px" : "0";
    };
    setLabel("");

    let lastX = 0;
    let lastY = 0;
    let pointerActive = false;

    const updateCursorLabel = () => {
      if (!pointerActive) return;
      const el = document.elementFromPoint(lastX, lastY) as HTMLElement | null;
      const zone = el?.closest<HTMLElement>("[data-cursor]");
      setLabel(zone?.dataset.cursor ?? "");
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
      dot.style.opacity = "1";

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

      updateCursorLabel();
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out", overwrite: true });
    };

    const onPointerLeave = () => {
      pointerActive = false;
      setLabel("");
      dot.style.opacity = "0";
      resetMagnet();
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", updateCursorLabel, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", updateCursorLabel);
      document.removeEventListener("pointerleave", onPointerLeave);
      resetMagnet();
      dot.remove();
    };
  }, []);

  return <>{children}</>;
}
