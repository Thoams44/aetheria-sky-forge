export type Supporter = {
  id: string;
  username: string;
  /** Libellé de l'achat — jamais de montant ni de donnée personnelle. */
  item: string;
  kind: "grade" | "coins";
  date: string;
};

/**
 * Données de démonstration.
 * Cette liste sera alimentée plus tard par les commandes confirmées de la boutique.
 */
export const recentSupporters: Supporter[] = [
  { id: "s1", username: "Nyxeril", item: "ELITE", kind: "grade", date: "Il y a 2 h" },
  { id: "s2", username: "Aerlyn", item: "Aether Coins", kind: "coins", date: "Il y a 5 h" },
  { id: "s3", username: "Solvanne", item: "VIP", kind: "grade", date: "Hier" },
  { id: "s4", username: "Kaeltris", item: "Aether Coins", kind: "coins", date: "Hier" },
  { id: "s5", username: "Orvaline", item: "MVP", kind: "grade", date: "Il y a 2 j" },
  { id: "s6", username: "Zephyros", item: "ULTIME", kind: "grade", date: "Il y a 3 j" },
];