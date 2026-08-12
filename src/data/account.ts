/**
 * Espace joueur AetheriaSky — données de démonstration.
 *
 * Architecture prévue (aucune connexion réelle ici) :
 *   Site → Backend AetheriaSky → API → AetheriaCore → Serveur Minecraft
 *
 * Le backend devra fournir : UUID, pseudo, grade + permissions, Aether Coins,
 * Éclats, votes, statistiques joueur/île, achats et récompenses.
 */

export type GradeId = "VIP" | "MVP" | "ELITE" | "ULTIME";

export type AccountGrade = {
  id: GradeId;
  /** Actif / expiré — renvoyé par le backend. */
  active: boolean;
  obtainedAt: string;
  /** null = grade permanent. */
  expiresAt: string | null;
};

export type AccountStat = {
  key:
    | "level"
    | "playtime"
    | "islandLevel"
    | "islandValue"
    | "playerRank"
    | "islandRank"
    | "votes";
  label: string;
  value: string;
};

export type RewardStatus = "available" | "claimed" | "expired";

export type AccountReward = {
  id: string;
  label: string;
  source: "vote" | "event" | "special";
  status: RewardStatus;
  detail: string;
};

export type AccountSecurity = {
  verified: boolean;
  lastLogin: string | null;
  activeSessions: number | null;
};

export type Account = {
  username: string;
  uuid: string;
  grade: AccountGrade;
  /** Monnaie premium (boutique) — distincte des Éclats. */
  aetherCoins: number;
  /** Monnaie gratuite obtenue via les votes — distincte des Aether Coins. */
  shards: number;
  monthlyVotes: number;
  totalVotes: number;
  stats: AccountStat[];
  rewards: AccountReward[];
  security: AccountSecurity;
};

export const demoAccount: Account = {
  username: "Thomas",
  uuid: "8f2c14a0-7b3d-4e91-9c55-1ad4f0b7e2c3",
  grade: {
    id: "ELITE",
    active: true,
    obtainedAt: "2 mars 2026",
    expiresAt: null,
  },
  aetherCoins: 2500,
  shards: 1250,
  monthlyVotes: 37,
  totalVotes: 128,
  stats: [
    { key: "level", label: "Niveau", value: "87" },
    { key: "playtime", label: "Temps de jeu", value: "312 h" },
    { key: "islandLevel", label: "Niveau de l'île", value: "42" },
    { key: "islandValue", label: "Valeur de l'île", value: "412 950 pts" },
    { key: "playerRank", label: "Classement joueur", value: "#127" },
    { key: "islandRank", label: "Classement île", value: "#94" },
    { key: "votes", label: "Nombre de votes", value: "128" },
  ],
  rewards: [
    {
      id: "rw-1",
      label: "Récompense de vote",
      source: "vote",
      status: "available",
      detail: "Palier de vote atteint — Éclats à définir",
    },
    {
      id: "rw-2",
      label: "Récompense de vote",
      source: "vote",
      status: "claimed",
      detail: "Palier précédent — Éclats à définir",
    },
    {
      id: "rw-3",
      label: "Récompense d'événement",
      source: "event",
      status: "available",
      detail: "Événement saisonnier — récompense à définir",
    },
    {
      id: "rw-4",
      label: "Récompense spéciale",
      source: "special",
      status: "expired",
      detail: "Offre limitée — période terminée",
    },
  ],
  security: {
    verified: false,
    lastLogin: null,
    activeSessions: null,
  },
};

export const rewardStatusLabel: Record<RewardStatus, string> = {
  available: "Disponible",
  claimed: "Récupérée",
  expired: "Expirée",
};

export const rewardStatusTone: Record<RewardStatus, string> = {
  available: "border-secondary/40 bg-secondary/10 text-secondary",
  claimed: "border-success/40 bg-success/10 text-success",
  expired: "border-border bg-accent/50 text-muted-foreground",
};

export function formatAmount(n: number): string {
  return n.toLocaleString("fr-FR");
}