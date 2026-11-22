export type ProductId = "pure" | "smart";

export type Product = {
  id: ProductId;
  name: string;
  shortName: string;
  price: number;
  tagline: string;
  description: string;
  image: string;
  color: string;
  accent: string;
  highlights: string[];
  features: string[];
  bestFor: string;
};

export const products: Product[] = [
  {
    id: "pure",
    name: "PawVault Pure",
    shortName: "Pure",
    price: 2499,
    tagline: "Quiet by design. Brilliant by nature.",
    description:
      "The fully mechanical 5-in-1 enrichment vault. A wind-up timer ring and spring-ratchet latch pace five puzzles across a 4–6 hour workday — no batteries, no screens, no noise.",
    image: "/images/pawvault-pure-assembled.webp",
    color: "bg-blush",
    accent: "#F6D1D8",
    highlights: ["Mechanical wind-up timer ring", "Spring-ratchet nail pad", "Zero electronics"],
    features: [
      "Scratch-to-Unlock nail pad with spring ratchet",
      "Insulated Frozen Lick Dome",
      "Ball-Drop Seesaw Vault",
      "Big Paw-Paddle Vault",
      "Nose-Spin Forage Wheel",
      "Owner-scent vent in the sealed rear bay",
    ],
    bestFor: "Dogs who love quiet, tactile problem-solving",
  },
  {
    id: "smart",
    name: "PawVault Smart",
    shortName: "Smart",
    price: 4299,
    tagline: "A calmer workday, guided by your voice.",
    description:
      "Everything in Pure, plus a piezo scratch sensor, Sky Blue and Butter Yellow LED guides, timed owner voice callouts and a 5-genre daily audio rotation — all sealed in a USB-C audio core with 14-day battery life.",
    image: "/images/pawvault-smart-hero.webp",
    color: "bg-mint",
    accent: "#BFE3DC",
    highlights: ["Piezo scratch sensor + LED guides", "Owner voice callouts", "5-genre audio, no Wi-Fi"],
    features: [
      "All five puzzle compartments from Pure",
      "Piezo sensor with blue/yellow LED guides",
      "Timed owner voice callouts (45–55 dB)",
      "10-minute calm voice track",
      "5-genre daily rotation with low-pass filter",
      "USB-C sealed core, 14-day battery, zero subscription",
    ],
    bestFor: "Separation-prone dogs who respond to your voice",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export const shellColors = [
  { id: "blush", name: "Blush Pink", hex: "#F6D1D8" },
  { id: "mint", name: "Light Seafoam Mint", hex: "#BFE3DC" },
  { id: "oat", name: "Warm Oat Cream", hex: "#FAF6F0" },
];

export const dogSizes = [
  { id: "small", name: "Small", detail: "Under 10 kg" },
  { id: "medium", name: "Medium", detail: "10–25 kg" },
  { id: "large", name: "Large", detail: "Over 25 kg" },
];
