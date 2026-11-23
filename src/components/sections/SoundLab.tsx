"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CubertoButton } from "@/components/MotionPrimitives";
import { useStore } from "@/store/StoreContext";
import {
  PianoKeysIcon,
  ReggaePulseIcon,
  AcousticGuitarIcon,
  VoiceWaveIcon,
  RainCloudIcon,
  PlayTriangleIcon,
  StopSquareIcon,
} from "@/components/icons/PawVaultIcons";

type ModeId = "piano" | "reggae" | "rock" | "voice" | "rain";

type Mode = {
  id: ModeId;
  name: string;
  detail: string;
  icon: ReactNode;
};

const modes: Mode[] = [
  { id: "piano", name: "Solo Piano", detail: "55 BPM gentle arpeggios", icon: <PianoKeysIcon className="h-6 w-6" /> },
  { id: "reggae", name: "Soft Reggae Pulse", detail: "Laid-back offbeat skank", icon: <ReggaePulseIcon className="h-6 w-6" /> },
  { id: "rock", name: "Soft Rock Acoustic", detail: "Warm fingerpicked chords", icon: <AcousticGuitarIcon className="h-6 w-6" /> },
  { id: "voice", name: "Calm Owner Voice Prompt", detail: "Warm chime + speech cadence", icon: <VoiceWaveIcon className="h-6 w-6" /> },
  { id: "rain", name: "Gentle Rain & Audiobook Hum", detail: "Soft noise bed + low murmur", icon: <RainCloudIcon className="h-6 w-6" /> },
];

const PIANO_NOTES = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23];

const MODE_TEMPO: Record<ModeId, number> = {
  piano: 2.4,
  reggae: 3.2,
  rock: 4.2,
  voice: 2.0,
  rain: 1.4,
};

const BAR_COUNT = 16;

export default function SoundLab() {
  const { dogName } = useStore();
  const [mode, setMode] = useState<ModeId>("piano");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [db, setDb] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const nodesRef = useRef<AudioScheduledSourceNode[]>([]);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const volumeRef = useRef(volume);

  volumeRef.current = volume;

  function ensureContext() {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0.0001;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1800;
      filter.Q.value = 0.6;
      filter.connect(master);
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      filterRef.current = filter;
    }
    return ctxRef.current;
  }

  function tone(ctx: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, gain: number) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(filterRef.current!);
    osc.start(start);
    osc.stop(start + dur + 0.05);
    nodesRef.current.push(osc);
  }

  function noise(ctx: AudioContext, start: number, dur: number, gain: number) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g);
    g.connect(filterRef.current!);
    src.start(start);
    nodesRef.current.push(src);
  }

  function schedulePattern() {
    const ctx = ctxRef.current;
    if (!ctx || !playing) return;
    const now = ctx.currentTime + 0.05;

    if (mode === "piano") {
      PIANO_NOTES.forEach((f, i) => tone(ctx, f, now + i * (60 / 55) * 0.5, 0.85, "sine", 0.16));
    } else if (mode === "reggae") {
      for (let i = 0; i < 8; i++) {
        tone(ctx, [220, 277.18, 329.63, 277.18][i % 4], now + i * 0.3 + (i % 2 ? 0.15 : 0), 0.22, "triangle", 0.1);
      }
      tone(ctx, 110, now, 0.5, "sine", 0.14);
      tone(ctx, 110, now + 1.2, 0.5, "sine", 0.14);
    } else if (mode === "rock") {
      [196, 246.94, 293.66, 392].forEach((f, i) => tone(ctx, f, now + i * 0.18, 1.4, "triangle", 0.09));
      tone(ctx, 98, now, 1.6, "sine", 0.12);
    } else if (mode === "voice") {
      tone(ctx, 523.25, now, 0.6, "sine", 0.15);
      tone(ctx, 659.25, now + 0.18, 0.7, "sine", 0.12);
      [261.63, 293.66, 329.63, 293.66, 261.63].forEach((f, i) => tone(ctx, f, now + 0.5 + i * 0.22, 0.18, "sine", 0.07));
    } else if (mode === "rain") {
      noise(ctx, now, 2.2, 0.035);
      [174.61, 196, 220].forEach((f, i) => tone(ctx, f, now + i * 0.4, 1.8, "sine", 0.05));
    }
  }

  useEffect(() => {
    if (!playing) return;
    const ctx = ensureContext();
    void ctx.resume();
    masterRef.current?.gain.setTargetAtTime(Math.max(0.0001, volume / 100 * 0.6), ctx.currentTime, 0.05);
    schedulePattern();
    timerRef.current = window.setInterval(schedulePattern, mode === "piano" ? 2200 : 2000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, mode]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (ctx && masterRef.current) {
      masterRef.current.gain.setTargetAtTime(playing ? Math.max(0.0001, volume / 100 * 0.6) : 0.0001, ctx.currentTime, 0.05);
    }
  }, [volume, playing]);

  useEffect(() => {
    if (!playing) { setDb(0); return; }
    const id = window.setInterval(() => {
      setDb(Math.round(45 + Math.random() * 10));
    }, 700);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    const bars = barsRef.current;
    const setBars = (fn: (bar: HTMLSpanElement, i: number) => void) => {
      bars.forEach((bar, i) => {
        if (!bar) return;
        bar.style.transformOrigin = "bottom";
        fn(bar, i);
      });
    };

    if (!playing) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setBars((bar) => { bar.style.transform = "scaleY(0.18)"; });
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBars((bar, i) => {
        const value = 0.25 + Math.abs(Math.sin(i * 0.9 + i)) * 0.6;
        bar.style.transform = `scaleY(${value.toFixed(3)})`;
      });
      return;
    }

    const tempo = MODE_TEMPO[mode];
    const start = performance.now();
    const animate = (now: number) => {
      const t = (now - start) / 1000;
      const amp = 0.25 + (volumeRef.current / 100) * 0.75;
      setBars((bar, i) => {
        const wave =
          Math.sin(t * tempo + i * 0.55) * 0.5 +
          Math.sin(t * tempo * 1.7 + i * 0.31) * 0.3 +
          Math.sin(t * tempo * 0.6 + i * 0.83) * 0.2;
        const height = Math.min(1, Math.max(0.12, 0.4 + wave * amp * 0.6));
        bar.style.transform = `scaleY(${height.toFixed(3)})`;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, mode]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      nodesRef.current.forEach((n) => { try { n.stop(); } catch {} });
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  function stop() {
    setPlaying(false);
    const ctx = ctxRef.current;
    if (ctx && masterRef.current) masterRef.current.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.03);
    nodesRef.current.forEach((n) => { try { n.stop(); } catch {} });
    nodesRef.current = [];
  }

  const activeMode = modes.find((m) => m.id === mode)!;

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-pine/10 bg-gradient-to-r from-sky-surface/30 to-butter/30 px-6 py-6 sm:px-8">
        <p className="eyebrow">Web Audio Sound Lab</p>
        <h3 className="font-display mt-1 text-2xl font-bold text-pine">Five modes, one safe listening zone.</h3>
        <p className="mt-2 max-w-2xl text-sm text-pine/70">
          Synthesized live in your browser with the Web Audio API, no audio files and no Wi-Fi. Every mode runs through a low-pass filter and stays inside the 45 to 55 dB canine comfort zone.
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card bg-cream p-5 sm:p-6">
          <p className="eyebrow">Choose a soundscape</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { stop(); setMode(m.id); }}
                className={`rounded-2xl border p-3 text-left transition ${
                  mode === m.id
                    ? "border-sky bg-sky/10 text-pine ring-4 ring-sky/15"
                    : "border-pine/15 bg-sand/60 text-pine hover:border-pine/35"
                }`}
              >
                <span className="inline-flex text-pine">{m.icon}</span>
                <p className="mt-2 text-sm font-bold leading-snug">{m.name}</p>
                <p className="mt-0.5 text-[11px] text-pine/60">{m.detail}</p>
              </button>
            ))}
          </div>

          {mode === "voice" && (
            <div className="fade-up mt-4 rounded-2xl border border-sky/40 bg-cream px-4 py-3">
              <p className="text-xs text-pine/55">Owner voice caption</p>
              <p className="font-display text-lg font-bold text-pine">&ldquo;Come {dogName}, it&apos;s time to play!&rdquo;</p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <CubertoButton
              type="button"
              variant="primary"
              onClick={() => { ensureContext(); setPlaying(true); }}
              disabled={playing}
              aria-pressed={playing}
              className="inline-flex items-center gap-2"
            >
              <PlayTriangleIcon className="h-4 w-4" />
              {playing ? "Playing " : "Play "}{activeMode.name}
            </CubertoButton>
            <button
              type="button"
              onClick={stop}
              disabled={!playing}
              className="btn-ghost inline-flex items-center gap-2 disabled:opacity-50"
            >
              <StopSquareIcon className="h-4 w-4" />
              Stop
            </button>
            <span className="chip bg-sand/70 text-pine">{mode === "piano" ? "55 BPM" : "Rotating genre"}</span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label htmlFor="volume" className="text-sm font-semibold text-pine">Volume (safe-zone capped)</label>
              <span className="tnum text-sm font-bold text-pine">{volume}%</span>
            </div>
            <input
              id="volume"
              type="range"
              min={20}
              max={55}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="mt-2 w-full accent-sky"
            />
            <div className="mt-1 flex justify-between text-[11px] text-pine/55">
              <span>45 dB floor</span>
              <span>55 dB canine comfort ceiling</span>
            </div>
          </div>
        </div>

        <div className="card-dark flex flex-col gap-4 rounded-3xl bg-pine p-6 text-cream">
          <div>
            <p className="eyebrow text-mint">Live safe-zone meter</p>
            <p className="font-display tnum mt-2 text-5xl font-bold text-butter">
              {playing ? db : "--"}<span className="ml-1 text-lg">dB</span>
            </p>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-cream/15">
              <div className="w-[82%] bg-sky" />
              <div className="w-[18%] bg-butter" />
            </div>
            <div className="tnum mt-2 flex justify-between text-[11px] text-cream/60">
              <span>45 dB</span>
              <span>Safe zone</span>
              <span>55 dB</span>
            </div>
          </div>
          <div className="rounded-2xl bg-pine-elevated p-4">
            <p className="text-xs font-bold text-sky">Low-pass filter active</p>
            <p className="mt-1 text-sm text-cream/80">Harsh high frequencies above 1.8 kHz are filtered out. What remains is warm, muffled and dog-friendly.</p>
            <div className="mt-3 flex h-8 items-end gap-1">
              {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <span
                  key={i}
                  ref={(el) => { barsRef.current[i] = el; }}
                  className={`h-full flex-1 origin-bottom rounded-t will-change-transform ${
                    i % 2 === 0 ? "bg-butter/85" : "bg-sky/85"
                  }`}
                  style={{ transform: "scaleY(0.18)" }}
                />
              ))}
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-cream/60">
            Auditory habituation research (Bowman 2015/17; Brayley &amp; Montrose 2016) supports rotating genres across the week instead of looping one sound.
          </p>
        </div>
      </div>
    </div>
  );
}
