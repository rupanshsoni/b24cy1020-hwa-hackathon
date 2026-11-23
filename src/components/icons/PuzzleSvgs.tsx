type Common = { className?: string };

export type DogMood = "restless" | "curious" | "settled" | "calm";

const SKY = "#4DA8DA";
const SKY_SURFACE = "#85CAEF";
const SKY_INK = "#114B7A";
const BLUSH = "#F4B8C4";
const BUTTER = "#F5C942";
const OAT = "#FAF6F0";
const SAND = "#EFE3CF";
const COCOA = "#211A17";

export function DogMoodIllustration({ mood = "curious", className = "" }: Common & { mood?: DogMood }) {
  const restless = mood === "restless";
  const curious = mood === "curious";
  const calm = mood === "calm";
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <path d="M18 34c-9-3-12-12-8-18 7-2 14 4 15 13Z" fill={SAND} stroke={COCOA} strokeWidth="2" transform={restless ? "rotate(-12 18 34)" : curious ? "rotate(-4 18 34)" : ""} />
      <path d="M62 34c9-3 12-12 8-18-7-2-14 4-15 13Z" fill={SAND} stroke={COCOA} strokeWidth="2" transform={restless ? "rotate(12 62 34)" : curious ? "rotate(4 62 34)" : ""} />
      <ellipse cx="40" cy="45" rx="25" ry="23" fill={OAT} stroke={COCOA} strokeWidth="2" />
      <ellipse cx="32" cy="49" rx="10" ry="8" fill="#fff" opacity="0.5" />
      {calm ? (
        <>
          <path d="M26 43q5 5 10 0M44 43q5 5 10 0" fill="none" stroke={COCOA} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M31 51q9 9 18 0Z" fill={COCOA} />
          <path d="M36 54q4 4 8 0" fill="#E8899B" />
        </>
      ) : (
        <>
          <ellipse cx="31" cy="43" rx="3.6" ry={restless ? 4.6 : 4} fill={COCOA} />
          <ellipse cx="49" cy="43" rx="3.6" ry={restless ? 4.6 : 4} fill={COCOA} />
          <circle cx="32.2" cy="41.6" r="1.1" fill="#fff" />
          <circle cx="50.2" cy="41.6" r="1.1" fill="#fff" />
          <path d={restless ? "M26 36l9 2M45 38l9-2" : curious ? "M26 37l9-1M45 36l9 1" : "M26 37q5-2 9 0M45 37q5-2 9 0"} fill="none" stroke={COCOA} strokeWidth="2" strokeLinecap="round" />
          {restless ? <path d="M35 55q5-4 10 0" fill="none" stroke={COCOA} strokeWidth="2.5" strokeLinecap="round" /> : curious ? <ellipse cx="40" cy="55" rx="3" ry="3.6" fill={COCOA} /> : <path d="M32 53q8 7 16 0" fill="none" stroke={COCOA} strokeWidth="2.5" strokeLinecap="round" />}
        </>
      )}
      <ellipse cx="40" cy="51" rx="4" ry="2.8" fill={COCOA} />
      <path d="M40 54v3" stroke={COCOA} strokeWidth="1.6" strokeLinecap="round" />
      {calm && <path d="M40 3l1.6 3.4L45 8l-3.4 1.6L40 13l-1.6-3.4L35 8l3.4-1.6Z" fill={BUTTER} />}
    </svg>
  );
}

export function ScratchDeckSvg({ scrapes = 0, locked = false, className = "" }: Common & { scrapes?: number; locked?: boolean }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
      <path d="M22 14h76l10 62H12Z" fill="#E7DFD2" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
      <path d="M28 20h64l7 48H21Z" fill="#F6F1E8" />
      {Array.from({ length: Math.min(scrapes, 4) }).map((_, i) => (
        <path key={i} d={`M${30 + i * 4} ${64 - i * 10}l${56 - i * 6} ${-24 + i * 4}`} stroke="#B7A98F" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={36 + i * 16} cy={30 + (i % 2) * 20} r="1.3" fill="#C9BBA1" />
      ))}
      <rect x="14" y="76" width="92" height="9" rx="4.5" fill={locked ? SKY : "#D8CEBE"} stroke={locked ? SKY_INK : "#B7A98F"} strokeWidth="1.5" />
      {locked && <circle cx="60" cy="80.5" r="3" fill="#EAF7FF" opacity="0.9" />}
    </svg>
  );
}

export function FunnelTargetSvg({ className = "" }: Common) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <circle cx="40" cy="40" r="34" fill={SKY_SURFACE} stroke={SKY_INK} strokeWidth="2" />
      <circle cx="40" cy="40" r="26" fill={SKY} />
      <circle cx="40" cy="40" r="18" fill="#0E3E63" />
      <circle cx="40" cy="40" r="11" fill="#07283F" />
      <path d="M20 22q20-10 40 0" fill="none" stroke="#EAF7FF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function RubberBallSvg({ className = "" }: Common) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="ballShade" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={SKY_SURFACE} />
          <stop offset="60%" stopColor={SKY} />
          <stop offset="100%" stopColor={SKY_INK} />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="32" fill="url(#ballShade)" stroke={SKY_INK} strokeWidth="2" />
      <path d="M24 28q10-10 22-6" fill="none" stroke="#EAF7FF" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="30" cy="30" rx="6" ry="4" fill="#fff" opacity="0.35" transform="rotate(-30 30 30)" />
      <path d="M40 14v52M18 40h44" stroke={SKY_INK} strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}

export function KibbleClusterSvg({ className = "" }: Common) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      {[
        { x: 32, y: 50, r: 16 },
        { x: 62, y: 42, r: 14 },
        { x: 88, y: 54, r: 15 },
      ].map((k, i) => (
        <g key={i}>
          <path d={`M${k.x - k.r} ${k.y}q${k.r} ${-k.r * 1.6} ${k.r * 2} 0`} fill="#B9824F" stroke="#7A512F" strokeWidth="2" />
          <ellipse cx={k.x} cy={k.y} rx={k.r} ry={k.r * 0.8} fill="#C99660" stroke="#7A512F" strokeWidth="2" />
          <ellipse cx={k.x - k.r * 0.3} cy={k.y - k.r * 0.25} rx={k.r * 0.35} ry={k.r * 0.2} fill="#E3B888" opacity="0.7" />
          <path d={`M${k.x - 5} ${k.y}q5 4 10 0`} fill="none" stroke="#7A512F" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

export function DentalChewSvg({ className = "" }: Common) {
  return (
    <svg viewBox="0 0 120 70" className={className} aria-hidden="true">
      <path d="M14 35c0-8 8-14 20-14h52c12 0 20 6 20 14s-8 14-20 14H34c-12 0-20-6-20-14Z" fill="#E6F3EE" stroke="#4E8F80" strokeWidth="2" />
      {[26, 40, 54, 68, 82, 96].map((x) => (
        <path key={x} d={`M${x} 24v22`} stroke="#8FD3C5" strokeWidth="4" strokeLinecap="round" />
      ))}
      <circle cx="30" cy="35" r="5" fill="#8FD3C5" />
      <path d="M20 30q6-6 14-6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function ForageWheelSvg({ rotation = 0, className = "" }: Common & { rotation?: number }) {
  const pockets = Array.from({ length: 6 });
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#F6D1D8" stroke="#C98A99" strokeWidth="2" />
      <g transform={`rotate(${rotation} 50 50)`}>
        {pockets.map((_, i) => {
          const a = (i * 60 * Math.PI) / 180;
          const px = 50 + Math.cos(a) * 29;
          const py = 50 + Math.sin(a) * 29;
          return (
            <g key={i}>
              <circle cx={px} cy={py} r="9" fill="#E9AEBB" stroke="#C98A99" strokeWidth="1.5" />
              <circle cx={px} cy={py} r="4.5" fill="#C99660" />
            </g>
          );
        })}
      </g>
      <circle cx="50" cy="50" r="12" fill="#fff" stroke="#C98A99" strokeWidth="2" />
      <circle cx="50" cy="50" r="4" fill={BLUSH} />
    </svg>
  );
}

export function TreatBiscuitSvg({ className = "" }: Common) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      {[
        { x: 30, y: 44, rot: -12 },
        { x: 62, y: 34, rot: 8 },
        { x: 92, y: 46, rot: -6 },
      ].map((b, i) => (
        <g key={i} transform={`rotate(${b.rot} ${b.x} ${b.y})`}>
          <path d={`M${b.x - 16} ${b.y}h32a7 7 0 0 1 0 14h-32a7 7 0 0 1 0-14Z`} fill="#D9A566" stroke="#9A6B35" strokeWidth="2" />
          <circle cx={b.x - 14} cy={b.y - 2} r="6" fill="#D9A566" stroke="#9A6B35" strokeWidth="2" />
          <circle cx={b.x - 14} cy={b.y + 10} r="6" fill="#D9A566" stroke="#9A6B35" strokeWidth="2" />
          <circle cx={b.x + 14} cy={b.y - 2} r="6" fill="#D9A566" stroke="#9A6B35" strokeWidth="2" />
          <circle cx={b.x + 14} cy={b.y + 10} r="6" fill="#D9A566" stroke="#9A6B35" strokeWidth="2" />
          <circle cx={b.x} cy={b.y + 4} r="2" fill="#9A6B35" />
        </g>
      ))}
    </svg>
  );
}

export function LickDomeSvg({ licks = 0, className = "" }: Common & { licks?: number }) {
  const frost = Math.max(0, 1 - licks / 12);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d="M18 62a32 32 0 0 1 64 0Z" fill="#EAF7FF" stroke={SKY_INK} strokeWidth="2" />
      <path d="M18 62a32 32 0 0 1 64 0Z" fill={SKY_SURFACE} opacity={frost * 0.9} />
      {[30, 44, 58, 72].map((x, i) => (
        <circle key={x} cx={x} cy={44 - (i % 2) * 8} r="3" fill="#fff" opacity={frost * 0.85} />
      ))}
      <path d="M12 62h76v10a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V62Z" fill={BLUSH} stroke="#C98A99" strokeWidth="2" />
      <path d="M20 72h60" stroke="#fff" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <path d="M14 34q10-14 24-18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
