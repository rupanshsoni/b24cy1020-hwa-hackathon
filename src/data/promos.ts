export type Promo = {
  code: string;
  percent: number;
  label: string;
};

export const promos: Promo[] = [
  { code: "GOODBOY15", percent: 15, label: "15% off" },
  { code: "CALMPUP10", percent: 10, label: "10% off" },
];

export const FREE_DELIVERY_THRESHOLD = 3000;
