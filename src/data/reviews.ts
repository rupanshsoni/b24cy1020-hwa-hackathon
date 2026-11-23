export type Review = {
  id: string;
  name: string;
  dog: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  version: "Pure" | "Smart";
};

export const initialReviews: Review[] = [
  {
    id: "r1",
    name: "Ananya R.",
    dog: "Miso",
    rating: 5,
    title: "Three hours of actual quiet",
    body: "Miso used to shred the sofa by 11am. The staged puzzles keep her busy until I'm back, and the lick dome is her absolute favourite.",
    date: "12 Aug 2026",
    version: "Smart",
  },
  {
    id: "r2",
    name: "Rohit K.",
    dog: "Bruno",
    rating: 5,
    title: "The voice callout is magic",
    body: "Recording my own voice for the 1.5 hour puzzle changed everything. Bruno perks up, then settles again. The LED guides are gentle, not flashy.",
    date: "28 Jul 2026",
    version: "Smart",
  },
  {
    id: "r3",
    name: "Priya M.",
    dog: "Coco",
    rating: 4,
    title: "Solid, heavy, genuinely chew-proof",
    body: "Coco is a determined chewer and this has survived three weeks. Took a day to figure out the seesaw but now she races through it.",
    date: "9 Jul 2026",
    version: "Pure",
  },
  {
    id: "r4",
    name: "Dev S.",
    dog: "Simba",
    rating: 5,
    title: "Worth it for the nail pad alone",
    body: "Simba hated nail clippers. Now he files his own claws while playing. Our vet noticed the difference at the last check-up.",
    date: "21 Jun 2026",
    version: "Pure",
  },
  {
    id: "r5",
    name: "Meera J.",
    dog: "Luna",
    rating: 4,
    title: "Beautiful on the floor, clever in the room",
    body: "The mint shell looks lovely in our living room. The scent disc rotation is a nice touch, and Luna investigates the ginger one every time.",
    date: "3 Jun 2026",
    version: "Smart",
  },
  {
    id: "r6",
    name: "Arjun P.",
    dog: "Rusty",
    rating: 3,
    title: "Great build, steep learning curve",
    body: "Really well made and the mission is why I bought it. Rusty needed a week of help with the paddle drawer, but he loves it now.",
    date: "17 May 2026",
    version: "Pure",
  },
];
