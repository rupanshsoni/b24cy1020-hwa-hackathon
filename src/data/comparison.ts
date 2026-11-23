export type ComparisonRow = {
  feature: string;
  pure: string | boolean;
  smart: string | boolean;
};

export const comparisonRows: ComparisonRow[] = [
  { feature: "Five staged enrichment puzzles", pure: true, smart: true },
  { feature: "Scratch-to-Unlock nail pad", pure: "Spring ratchet", smart: "Piezo + LED" },
  { feature: "Insulated frozen lick dome", pure: true, smart: true },
  { feature: "Ball-drop seesaw vault", pure: true, smart: true },
  { feature: "Paw-paddle treat drawer", pure: true, smart: true },
  { feature: "Nose-spin forage wheel", pure: true, smart: true },
  { feature: "Owner-scent vent", pure: true, smart: true },
  { feature: "LED blue/yellow guides", pure: false, smart: true },
  { feature: "Timed owner voice callouts", pure: false, smart: "45 to 55 dB" },
  { feature: "5-genre daily audio rotation", pure: false, smart: true },
  { feature: "10-minute calm voice track", pure: false, smart: true },
  { feature: "Battery life", pure: "None needed", smart: "14 days, USB-C" },
  { feature: "Wi-Fi or subscription", pure: "None", smart: "None" },
  { feature: "Price", pure: "Rs 2,499", smart: "Rs 4,299" },
];
