export type Study = {
  id: string;
  authors: string;
  year: string;
  title: string;
  citation: string;
  finding: string;
  feature: string;
  tag: string;
};

export const studies: Study[] = [
  {
    id: "voice-scent",
    authors: "Shin & Shin",
    year: "2016",
    title: "Owner voice and scent lower cortisol",
    citation: "Shin, Y. & Shin, S. (2016). Journal of Veterinary Behavior.",
    finding:
      "Hearing a familiar owner voice and smelling owner-worn fabric both reduced cortisol and promoted calm resting in shelter dogs.",
    feature: "Owner voice callouts + rear scent vent",
    tag: "Calm",
  },
  {
    id: "habituation",
    authors: "Bowman et al.; Brayley & Montrose",
    year: "2015 to 2017",
    title: "The 7-day auditory habituation rule",
    citation:
      "Bowman et al. (2015, 2017); Brayley & Montrose (2016). Applied Animal Behaviour Science.",
    finding:
      "Dogs habituate to a repeated sound within days. Rotating acoustic stimuli across genres sustains interest far longer than a single loop.",
    feature: "5-genre daily audio rotation",
    tag: "Anti-boredom",
  },
  {
    id: "licking",
    authors: "Bennett et al.",
    year: "2017",
    title: "Licking as a parasympathetic reset",
    citation: "Bennett, S. et al. (2017). Physiology & Behavior.",
    finding:
      "Repetitive licking lowered heart rate and shifted autonomic balance toward parasympathetic recovery, a measurable calming effect.",
    feature: "Insulated Frozen Lick Dome",
    tag: "Stress relief",
  },
  {
    id: "vision",
    authors: "Neitz, Geist & Jacobs",
    year: "1989",
    title: "Canine dichromatic vision",
    citation: "Neitz, J., Geist, T. & Jacobs, G. (1989). Vision Research.",
    finding:
      "Dogs discriminate blue (~429 nm) and yellow (~555 nm) cleanly, while pinks and greens read as soft neutrals, the basis of our target colours.",
    feature: "Sky Blue + Butter Yellow cues on neutral shells",
    tag: "Design",
  },
  {
    id: "cognition",
    authors: "Clark; Contrafreeloading Study",
    year: "2017; 2024",
    title: "Cognitive enrichment works",
    citation: "Clark, F. (2017); Contrafreeloading study (2024).",
    finding:
      "Problem-solving tasks that make dogs work for food improve welfare and reduce reactivity; earning food can be more rewarding than free food.",
    feature: "Five staged micro-puzzles",
    tag: "IQ",
  },
  {
    id: "olfactory",
    authors: "Binks et al.",
    year: "2018",
    title: "Olfactory dishabituation with botanicals",
    citation: "Binks, L. et al. (2018). Veterinary Journal.",
    finding:
      "Novel scents such as coconut and ginger refreshed exploratory behaviour and reduced stereotypy in kennelled dogs.",
    feature: "4-scent botanical rotation discs",
    tag: "Scent",
  },
];
