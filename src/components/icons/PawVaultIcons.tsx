import type { ReactNode } from "react";

export { default as PawIcon } from "../PawIcon";

export type IconProps = { className?: string; strokeWidth?: number };

type SvgProps = IconProps & { children: ReactNode; fill?: string; viewBox?: string };

function Svg({ children, className = "", strokeWidth = 1.75, fill = "none", viewBox = "0 0 24 24" }: SvgProps) {
  return (
    <svg viewBox={viewBox} className={className} fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export function CartBagIcon(p: IconProps) {
  return <Svg {...p}><path d="M5 8h14l1 12H4L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Svg>;
}

export function SoundWaveIcon(p: IconProps) {
  return <Svg {...p}><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9a4 4 0 0 1 0 6" /><path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" /></Svg>;
}

export function EyeVisionIcon(p: IconProps) {
  return <Svg {...p}><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.75" /></Svg>;
}

export function CloseIcon(p: IconProps) {
  return <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
}

export function ChevronDownIcon(p: IconProps) {
  return <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>;
}

export function CheckIcon(p: IconProps) {
  return <Svg {...p}><path d="m5 12 4.5 4.5L19 7" /></Svg>;
}

export function CheckCircleIcon(p: IconProps) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.8 2.8L16.5 9" /></Svg>;
}

export function DashMutedIcon(p: IconProps) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></Svg>;
}

export function StarIcon({ filled = false, ...p }: IconProps & { filled?: boolean }) {
  const d = "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z";
  return <Svg {...p} fill={filled ? "currentColor" : "none"}><path d={d} /></Svg>;
}

export function MailIcon(p: IconProps) {
  return <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></Svg>;
}

export function ClockIcon(p: IconProps) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Svg>;
}

export function MapPinIcon(p: IconProps) {
  return <Svg {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></Svg>;
}

export function RotateCcwIcon(p: IconProps) {
  return <Svg {...p}><path d="M4 11a8 8 0 1 1 2 6" /><path d="M4 5v6h6" /></Svg>;
}

export function PlayTriangleIcon(p: IconProps) {
  return <Svg {...p}><path d="M8 5.5 19 12 8 18.5v-13Z" /></Svg>;
}

export function StopSquareIcon(p: IconProps) {
  return <Svg {...p}><rect x="6" y="6" width="12" height="12" rx="1.5" /></Svg>;
}

export function ArrowRightIcon(p: IconProps) {
  return <Svg {...p}><path d="M4 12h16" /><path d="m14 6 6 6-6 6" /></Svg>;
}

export function MinusIcon(p: IconProps) {
  return <Svg {...p}><path d="M5 12h14" /></Svg>;
}

export function PlusIcon(p: IconProps) {
  return <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
}

export function UpiPhoneIcon(p: IconProps) {
  return <Svg {...p}><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M10 5.5h4" /><path d="M9 18h6" /><path d="m10.5 10 1.5 1.5L14 9" /></Svg>;
}

export function CardChipIcon(p: IconProps) {
  return <Svg {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><rect x="7" y="9" width="6" height="6" rx="1" /><path d="M16 10h3M16 14h3" /></Svg>;
}

export function CashNoteIcon(p: IconProps) {
  return <Svg {...p}><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M5.5 12h.01M18.5 12h.01" /></Svg>;
}

export function SnowflakeTrayIcon(p: IconProps) {
  return <Svg {...p}><path d="M3 17h18l-1.5 3H4.5L3 17Z" /><path d="M12 3v9M12 3 9 5.5M12 3l3 2.5M8 8.5 16 12M16 8.5 8 12" /></Svg>;
}

export function GritSheetIcon(p: IconProps) {
  return <Svg {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" strokeWidth="2.5" /></Svg>;
}

export function BotanicalLeafIcon(p: IconProps) {
  return <Svg {...p}><path d="M20 4c0 9-5 14-13 14a6 6 0 0 1 0-12c5 0 9-1 13-2Z" /><path d="M4 20c2-5 6-9 12-12" /></Svg>;
}

export function EmptyBowlDogIcon(p: IconProps) {
  return <Svg {...p}><path d="M3 11h18a9 9 0 0 1-18 0Z" /><path d="M7 7c0-1.5 1-1.5 1-3M12 6c0-1.5 1-1.5 1-3M17 7c0-1.5 1-1.5 1-3" /><path d="M2 21h20" /></Svg>;
}

export function LickDomeIcon(p: IconProps) {
  return <Svg {...p}><path d="M4 16a8 8 0 0 1 16 0" fill="#85CAEF" stroke="#114B7A" /><path d="M3 16h18v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3Z" fill="#F4B8C4" /><path d="M8 11v2M12 9.5v2.5M16 11v2" stroke="#fff" /></Svg>;
}

export function AddonBoxIcon(p: IconProps) {
  return <Svg {...p}><path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" /><path d="M3 7.5v9L12 21l9-4.5v-9" /><path d="M12 12v9" /></Svg>;
}

export function HomeAnchorIcon(p: IconProps) {
  return <Svg {...p}><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10" /><circle cx="12" cy="14" r="2" /><path d="M12 16v4" /></Svg>;
}

export function BallFunnelIcon(p: IconProps) {
  return <Svg {...p}><path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" /><circle cx="12" cy="4" r="2" fill="#4DA8DA" stroke="#114B7A" /></Svg>;
}

export function PawPaddleIcon(p: IconProps) {
  return <Svg {...p}><rect x="9" y="9" width="7" height="12" rx="3" transform="rotate(30 12.5 15)" /><circle cx="7" cy="7" r="1.4" /><circle cx="11" cy="5" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="17" cy="9" r="1.4" /></Svg>;
}

export function ScentWheelIcon(p: IconProps) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M18.4 5.6l-4.2 4.2M9.8 14.2l-4.2 4.2" /></Svg>;
}

export function CalmRestIcon(p: IconProps) {
  return <Svg {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" /><path d="M16 4.5a3 3 0 0 1 3.5 3.5A3 3 0 0 1 16 4.5Z" /></Svg>;
}

export function PianoKeysIcon(p: IconProps) {
  return <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M9 5v9M15 5v9" /><path d="M7 5v5h2V5M13 5v5h2V5M17 5v5h1" fill="currentColor" stroke="none" /></Svg>;
}

export function ReggaePulseIcon(p: IconProps) {
  return <Svg {...p}><path d="M2 12h4l2-5 3 10 3-13 3 16 2-8h3" /></Svg>;
}

export function AcousticGuitarIcon(p: IconProps) {
  return <Svg {...p}><path d="M14.5 4.5 19 3l-1.5 4.5" /><path d="M14 5 8 11" /><path d="M9 10c-3 0-5 2.4-5 5.2A4.8 4.8 0 0 0 8.8 20c2.8 0 5.2-2 5.2-5 0-2.5-1.5-4.5-3.5-5" /><circle cx="9.5" cy="15" r="1.8" /></Svg>;
}

export function VoiceWaveIcon(p: IconProps) {
  return <Svg {...p}><path d="M5 10v4M9 7v10M13 4v16M17 8v8M21 10v4" /></Svg>;
}

export function RainCloudIcon(p: IconProps) {
  return <Svg {...p}><path d="M7 15a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.3 1.4A3.6 3.6 0 0 1 17 15H7Z" /><path d="M8 18v2M12 18v2M16 18v2" /></Svg>;
}

export function ScratchPadIcon(p: IconProps) {
  return <Svg {...p}><path d="M5 4h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="m7 16 3-4 2 2 3-5" /><path d="M14 6h3" /></Svg>;
}

export function TrophySparkIcon(p: IconProps) {
  return <Svg {...p}><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v3M9 20h6M10 17h4" /><path d="m19 14 .6 1.4L21 16l-1.4.6L19 18l-.6-1.4L17 16l1.4-.6L19 14Z" fill="#F5C942" stroke="none" /></Svg>;
}
