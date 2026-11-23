"use client";

import { useState, type ElementType } from "react";
import { useStore } from "@/store/StoreContext";
import {
  HomeAnchorIcon,
  LickDomeIcon,
  BallFunnelIcon,
  PawPaddleIcon,
  ScentWheelIcon,
  CalmRestIcon,
} from "@/components/icons/PawVaultIcons";

type Stage = {
  time: string;
  title: string;
  short: string;
  icon: ElementType;
  summary: string;
  study: string;
  citation: string;
};

const stages: Stage[] = [
  {
    time: "T-10m",
    title: "Play, home anchor and scent setup",
    short: "Home anchor",
    icon: HomeAnchorIcon,
    summary:
      "Before you leave, a short play session and a worn T-shirt strip in the rear scent vent give your dog a calm, familiar anchor for the day ahead.",
    study: "Shin and Shin, 2016",
    citation: "Owner voice and worn scent lowered cortisol in shelter dogs.",
  },
  {
    time: "0:30",
    title: "Insulated frozen lick dome",
    short: "Lick dome",
    icon: LickDomeIcon,
    summary:
      "Frozen yoghurt, pumpkin or bone broth in the double wall lid. Repetitive licking shifts the nervous system toward parasympathetic recovery.",
    study: "Bennett et al., 2017",
    citation: "Licking lowered heart rate and promoted parasympathetic reset.",
  },
  {
    time: "1:30",
    title: "Ball drop seesaw and voice callout",
    short: "Ball funnel",
    icon: BallFunnelIcon,
    summary:
      "The blue funnel and rubber ball tip the seesaw, popping open the kibble tray just as your recorded voice says it is time to play.",
    study: "Shin and Shin, 2016; Bowman et al., 2015 to 2017",
    citation: "Familiar voice reduces stress and rotating audio beats a single loop.",
  },
  {
    time: "3:00",
    title: "Big paw paddle and dental chew",
    short: "Paw paddle",
    icon: PawPaddleIcon,
    summary:
      "A wide butter yellow paddle and spring damped drawer reveal a dental chew or yak cheese, a midday challenge that rewards persistence.",
    study: "Clark, 2017",
    citation: "Earning food through problem solving improves welfare more than free food.",
  },
  {
    time: "4:30",
    title: "Nose spin forage and botanical scent",
    short: "Scent wheel",
    icon: ScentWheelIcon,
    summary:
      "Raised ribs and scent vents hide treat pockets. Coconut, ginger, chamomile or lavender discs refresh the nose and prevent olfactory boredom.",
    study: "Binks et al., 2018",
    citation: "Novel coconut and ginger scents dishabituated exploratory behaviour.",
  },
  {
    time: "6:00",
    title: "Calm rest and safety cap",
    short: "Calm rest",
    icon: CalmRestIcon,
    summary:
      "The final puzzle is done and the scratch pad has gone dormant after its 3 to 4 scrapes, so nails are never over filed while you are away.",
    study: "Bennett et al., 2017",
    citation: "A capped filing cycle protects the quick while licking sustains calm.",
  },
];

export default function ScienceTimeline() {
  const { dogName } = useStore();
  const [active, setActive] = useState(0);
  const stage = stages[active];

  return (
    <div className="overflow-hidden rounded-3xl bg-cream shadow-xl shadow-pine/10">
      <div className="bg-pine px-6 py-6 text-cream sm:px-8">
        <p className="eyebrow text-cream/60">Evidence in motion</p>
        <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
          A six hour science cadence for {dogName}
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-cream/70">
          Tap any moment to see what the hardware does and which peer reviewed study shaped it.
        </p>
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex gap-2 overflow-x-auto pb-3">
          {stages.map((s, i) => (
            <button
              key={s.time}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={`flex min-w-[112px] shrink-0 flex-col items-start gap-2 rounded-2xl border p-3 text-left transition ${
                i === active
                  ? "border-pine bg-pine text-cream"
                  : "border-pine/15 bg-white/60 text-pine hover:border-pine/40"
              }`}
            >
              <span className="tnum text-xs font-bold tracking-wide">{s.time}</span>
              <span className="[&>svg]:h-7 [&>svg]:w-7">
                <s.icon />
              </span>
              <span className="text-[11px] font-semibold leading-tight opacity-80">{s.short}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-6 rounded-3xl bg-pine p-6 text-cream sm:grid-cols-[auto_1fr] sm:p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mint text-pine [&>svg]:h-9 [&>svg]:w-9">
            <stage.icon />
          </div>
          <div>
            <p className="eyebrow text-mint">
              <span className="tnum">{stage.time}</span> and what happens
            </p>
            <h4 className="mt-2 font-display text-2xl font-bold leading-snug">{stage.title}</h4>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">
              {stage.summary.replace("your dog", dogName)}
            </p>
            <div className="mt-5 rounded-2xl border border-cream/15 bg-cream/10 px-4 py-3">
              <p className="text-xs font-bold text-mint">Backed by {stage.study}</p>
              <p className="mt-1 text-sm text-cream/80">{stage.citation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
