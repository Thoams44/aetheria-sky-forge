export type OrderStatus = "delivered" | "pending" | "cancelled";

export type Order = {
  id: string;
  date: string;
  items: string[];
  status: OrderStatus;
  /** Récompense livrée en jeu ou non. */
  delivered: boolean;
};

/** Historique de démonstration — sera alimenté par les commandes réelles. */
export const demoOrders: Order[] = [
  {
    id: "AET-1042",
    date: "12 mars 2026",
    items: ["1 000 Aether Coins"],
    status: "delivered",
    delivered: true,
  },
  {
    id: "AET-1021",
    date: "2 mars 2026",
    items: ["Grade ELITE"],
    status: "delivered",
    delivered: true,
  },
  {
    id: "AET-1008",
    date: "24 février 2026",
    items: ["500 Aether Coins"],
    status: "pending",
    delivered: false,
  },
];

export const orderStatusLabel: Record<OrderStatus, string> = {
  delivered: "Confirmée",
  pending: "En attente",
  cancelled: "Annulée",
};
