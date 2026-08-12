export type Grade = {
  id: string;
  name: string;
  price: string;
  accent: "secondary" | "info" | "premium" | "primary";
  perks: string[];
  highlight?: boolean;
};

export const grades: Grade[] = [
  {
    id: "vip",
    name: "VIP",
    price: "Prix à définir",
    accent: "info",
    perks: ["Préfixe VIP", "2 homes supplémentaires", "Kit hebdomadaire"],
  },
  {
    id: "mvp",
    name: "MVP",
    price: "Prix à définir",
    accent: "secondary",
    perks: ["Avantages VIP", "Accès aux warps privés", "Couleurs de chat"],
  },
  {
    id: "elite",
    name: "ELITE",
    price: "Prix à définir",
    accent: "primary",
    highlight: true,
    perks: ["Avantages MVP", "Extension d'île +25%", "File d'attente prioritaire"],
  },
  {
    id: "ultime",
    name: "ULTIME",
    price: "Prix à définir",
    accent: "premium",
    perks: ["Tous les avantages", "Cosmétiques exclusifs", "Familier légendaire"],
  },
];

export type CoinPack = {
  id: string;
  amount: string;
  price: string;
  bonus?: string;
};

export const coinPacks: CoinPack[] = [
  { id: "pack-1", amount: "500 Aether Coins", price: "4,99 €" },
  { id: "pack-2", amount: "1 200 Aether Coins", price: "9,99 €", bonus: "+10% offerts" },
  { id: "pack-3", amount: "3 000 Aether Coins", price: "24,99 €", bonus: "+20% offerts" },
];