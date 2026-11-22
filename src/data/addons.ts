export type AddOn = {
  id: string;
  name: string;
  price: number;
  detail: string;
  icon: string;
};

export const addOns: AddOn[] = [
  {
    id: "freezer-trays",
    name: "Extra 2-Pack Silicone Freezer Lick Trays",
    price: 499,
    detail: "Keep a second flavour ready while the first is in the freezer.",
    icon: "snow",
  },
  {
    id: "nail-sheets",
    name: "6-Pack Replacement Fine-Grit Nail Sheets",
    price: 299,
    detail: "Six months of gentle, natural front-claw filing.",
    icon: "file",
  },
  {
    id: "botanical-discs",
    name: "4-Scent Botanical Rotation Discs",
    price: 349,
    detail: "Coconut, Ginger, Chamomile and Lavender for the scent bay.",
    icon: "leaf",
  },
];

export function getAddOn(id: string): AddOn | undefined {
  return addOns.find((a) => a.id === id);
}
