"use client";

import React, { useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function splitLines(children: React.ReactNode): React.ReactNode[] {
  if (typeof children === "string") {
    const parts = children.split("\n").filter((line, idx, arr) => line.length > 0 || idx < arr.length - 1);
    return parts.length > 0 ? parts : [children];
  }

  if (Array.isArray(children)) {
    const lines: React.ReactNode[][] = [[]];
    for (const child of children) {
      if (React.isValidElement(child) && child.type === "br") {
        lines.push([]);
      } else if (typeof child === "string" && child.includes("\n")) {
        const segments = child.split("\n");
        segments.forEach((seg, idx) => {
          if (idx > 0) lines.push([]);
          if (seg.length > 0) lines[lines.length - 1].push(seg);
        });
      } else {
        lines[lines.length - 1].push(child);
      }
    }
    const nonEmpty = lines.filter((group) => group.length > 0);
    if (nonEmpty.length > 1) {
      return nonEmpty.map((group, idx) => (
        <React.Fragment key={idx}>{group}</React.Fragment>
      ));
    }
  }

  return [children];
}

export function MaskedHeading({
  children,
  as = "h2",
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const lines = splitLines(children);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const targets = el.querySelectorAll<HTMLElement>(".masked-line");
      if (targets.length === 0) return;

      const inView = el.getBoundingClientRect().top < window.innerHeight * 0.95;
      if (inView) {
        gsap.fromTo(
          targets,
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 0.85,
            stagger: 0.08,
            delay,
            ease: "expo.out",
            clearProps: "transform",
          },
        );
      } else {
        gsap.fromTo(
          targets,
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 0.85,
            stagger: 0.08,
            delay,
            ease: "expo.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 94%",
              once: true,
            },
          },
        );
      }
    }, ref);

    return () => ctx.revert();
  }, [delay]);

  const Tag = as;

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={className}
    >
      {lines.map((line, idx) => (
        <span
          key={idx}
          className="block overflow-hidden py-[0.08em] -my-[0.08em]"
        >
          <span className="masked-line block will-change-transform">{line}</span>
        </span>
      ))}
    </Tag>
  );
}

export function RevealStagger({
  children,
  className = "",
  stagger = 0.08,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const targets = Array.from(el.children) as HTMLElement[];
      if (targets.length === 0) return;

      const inView = el.getBoundingClientRect().top < window.innerHeight * 0.95;
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          stagger,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          ...(inView
            ? {}
            : {
                scrollTrigger: {
                  trigger: el,
                  start: "top 94%",
                  once: true,
                },
              }),
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [stagger, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function ParallaxFrame({
  children,
  className = "",
  speed = 6,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const scale = 1 + (Math.abs(speed) * 2.2) / 100;
      gsap.fromTo(
        inner,
        { yPercent: -speed, scale },
        {
          yPercent: speed,
          scale,
          ease: "none",
          scrollTrigger: {
            trigger: outer,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, outerRef);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={outerRef} className={`relative overflow-hidden ${className}`}>
      <div ref={innerRef} className="relative h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}

export function CountUpValue({
  value,
  className = "",
}: {
  value: string | number;
  className?: string;
}) {
  const raw = String(value);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const match = raw.match(/^([^0-9.-]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/);
    if (!match) return;

    const [, prefix, numStr, suffix] = match;
    const useCommas = numStr.includes(",");
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
    const target = parseFloat(numStr.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;

    const formatNum = (n: number) => {
      const fixed = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
      if (!useCommas) return fixed;
      const [intPart, decPart] = fixed.split(".");
      const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
    };

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const counter = { current: 0 };
      const run = () => {
        el.textContent = `${prefix}${formatNum(0)}${suffix}`;
        gsap.to(counter, {
          current: target,
          duration: 1.35,
          ease: "expo.out",
          onUpdate: () => {
            el.textContent = `${prefix}${formatNum(counter.current)}${suffix}`;
          },
          onComplete: () => {
            el.textContent = raw;
          },
        });
      };

      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
        run();
      } else {
        ScrollTrigger.create({
          trigger: el,
          start: "top 94%",
          once: true,
          onEnter: run,
        });
      }
    }, ref);

    return () => ctx.revert();
  }, [raw]);

  return (
    <span ref={ref} className={`tnum ${className}`}>
      {raw}
    </span>
  );
}

export function CubertoButton({
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
  ariaLabel,
  "aria-pressed": ariaPressed,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "ghost" | "dark";
  className?: string;
  ariaLabel?: string;
  "aria-pressed"?: boolean | "true" | "false";
}) {
  const variantClass =
    variant === "ghost"
      ? "cuberto-btn--ghost"
      : variant === "dark"
        ? "cuberto-btn--dark"
        : "cuberto-btn--primary";

  const classes = `cuberto-btn ${variantClass} btn-magnetic px-6 py-3 text-[13px] font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-butter/40 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim();

  const inner = (
    <>
      <span className="cuberto-btn-ripple" aria-hidden="true" />
      <span className="cuberto-btn-text">
        <span className="cuberto-btn-text-inner">{children}</span>
        <span className="cuberto-btn-text-clone" aria-hidden="true">
          {children}
        </span>
      </span>
    </>
  );

  if (href && !disabled) {
    const isHashOrExternal =
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");

    if (isHashOrExternal) {
      return (
        <a
          href={href}
          onClick={onClick}
          aria-label={ariaLabel}
          aria-pressed={ariaPressed}
          className={classes}
        >
          {inner}
        </a>
      );
    }

    return (
      <Link
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        className={classes}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={classes}
    >
      {inner}
    </button>
  );
}
