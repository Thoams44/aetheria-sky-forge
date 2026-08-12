/**
 * Système de vote AetheriaSky — données de démonstration.
 *
 * Architecture prévue (à brancher plus tard, aucune connexion réelle ici) :
 *   Site → Backend AetheriaSky → Plateformes de vote → Validation du vote
 *        → Base de données → AetheriaCore → Minecraft
 *
 * Le backend devra : enregistrer un vote, le vérifier, créditer les Éclats,
 * mettre à jour la progression et le Top Voteurs, débloquer les paliers
 * cumulatifs et empêcher toute double récompense (voir `VoteStatus`).
 */

/** Clé d'icône générique (mappée sur lucide-react côté UI). */
export type VoteIconKey = "star" | "compass" | "flag" | "signal";

/** États possibles d'un vote pour une plateforme donnée. */
export type VoteStatus =
  | "available" // le joueur peut voter maintenant
  | "pending" // vote envoyé, en attente de validation par la plateforme
  | "confirmed" // vote validé et récompense créditée (une seule fois)
  | "cooldown"; // récompense déjà obtenue, prochain vote plus tard

export type VotePlatform = {
  id: string;
  name: string;
  description: string;
  icon: VoteIconKey;
  /** URL de vote réelle — à renseigner plus tard. */
  voteUrl: string | null;
  enabled: boolean;
  /** Délai avant un nouveau vote, en heures. */
  cooldownHours: number;
  /** Récompense d'un vote individuel : 1 Clé de Vote en jeu. */
  reward: string;
  order: number;
};

/** État du vote d'un joueur pour une plateforme (fourni par le backend). */
export type PlatformVoteState = {
  platformId: string;
  status: VoteStatus;
  /** Prochain vote disponible (ISO) — null si disponible immédiatement. */
  nextVoteAt: string | null;
  /** Empêche une seconde récompense pour un même vote. */
  rewardClaimed: boolean;
};

export type VoteTier = {
  votes: number;
  /** Récompense en Aether Coins (AC) du palier. */
  coins: number;
  /** Bonus additionnel éventuel (dernier palier). */
  bonus?: string;
  /** Libellé affiché de la récompense. */
  reward: string;
};

export type VoteHistoryEntry = {
  id: string;
  platformId: string;
  platformName: string;
  date: string;
  status: Extract<VoteStatus, "pending" | "confirmed"> | "expired";
  reward: string;
};

export type TopVoter = {
  rank: number;
  name: string;
  votes: number;
};

export const votePlatforms: VotePlatform[] = [
  {
    id: "platform-1",
    name: "Plateforme de vote #1",
    description:
      "Emplacement réservé à la première plateforme partenaire. Le lien de vote sera ajouté à l'ouverture.",
    icon: "star",
    voteUrl: null,
    enabled: false,
    cooldownHours: 24,
    reward: "+1 Clé de Vote",
    order: 1,
  },
  {
    id: "platform-2",
    name: "Plateforme de vote #2",
    description:
      "Emplacement réservé à la deuxième plateforme partenaire. Vote gratuit, récompensé en Éclats.",
    icon: "compass",
    voteUrl: null,
    enabled: false,
    cooldownHours: 24,
    reward: "+1 Clé de Vote",
    order: 2,
  },
  {
    id: "platform-3",
    name: "Plateforme de vote #3",
    description:
      "Emplacement réservé à la troisième plateforme partenaire. Cooldown court prévu.",
    icon: "flag",
    voteUrl: null,
    enabled: false,
    cooldownHours: 12,
    reward: "+1 Clé de Vote",
    order: 3,
  },
  {
    id: "platform-4",
    name: "Plateforme de vote #4",
    description:
      "Emplacement réservé à la quatrième plateforme partenaire. Validation automatique à venir.",
    icon: "signal",
    voteUrl: null,
    enabled: false,
    cooldownHours: 24,
    reward: "+1 Clé de Vote",
    order: 4,
  },
];

/**
 * Paliers cumulatifs : atteindre 150 votes débloque les 6 paliers.
 * Récompense des paliers = Aether Coins (AC), jamais des Éclats.
 */
export const voteTiers: VoteTier[] = [
  { votes: 10, coins: 8, reward: "8 AC" },
  { votes: 25, coins: 16, reward: "16 AC" },
  { votes: 50, coins: 28, reward: "28 AC" },
  { votes: 75, coins: 40, reward: "40 AC" },
  { votes: 100, coins: 80, reward: "80 AC" },
  {
    votes: 150,
    coins: 120,
    bonus: "Clé spéciale — nom à définir",
    reward: "120 AC + Clé spéciale — nom à définir",
  },
];

/** Progression communautaire du mois (utilisée aussi sur l'accueil). */
export const voteProgress = {
  current: 37,
  goal: 50,
  nextReward: "8 AC au palier 10 votes",
};

/** Profil de démonstration renvoyé après saisie d'un pseudo. */
export type VoteProfile = {
  username: string;
  shards: number;
  monthlyVotes: number;
  monthlyGoal: number;
  totalVotes: number;
  platformStates: PlatformVoteState[];
  history: VoteHistoryEntry[];
};

export const demoVoteProfile: VoteProfile = {
  username: "Nyxeril",
  shards: 1250,
  monthlyVotes: 37,
  monthlyGoal: 50,
  totalVotes: 128,
  platformStates: [
    { platformId: "platform-1", status: "cooldown", nextVoteAt: null, rewardClaimed: true },
    { platformId: "platform-2", status: "available", nextVoteAt: null, rewardClaimed: false },
    { platformId: "platform-3", status: "pending", nextVoteAt: null, rewardClaimed: false },
    { platformId: "platform-4", status: "available", nextVoteAt: null, rewardClaimed: false },
  ],
  history: [
    {
      id: "vh-1",
      platformId: "platform-1",
      platformName: "Plateforme de vote #1",
      date: "Aujourd'hui",
      status: "confirmed",
      reward: "+1 Clé de Vote",
    },
    {
      id: "vh-2",
      platformId: "platform-3",
      platformName: "Plateforme de vote #3",
      date: "Aujourd'hui",
      status: "pending",
      reward: "En attente de validation",
    },
    {
      id: "vh-3",
      platformId: "platform-2",
      platformName: "Plateforme de vote #2",
      date: "Hier",
      status: "confirmed",
      reward: "+1 Clé de Vote",
    },
    {
      id: "vh-4",
      platformId: "platform-4",
      platformName: "Plateforme de vote #4",
      date: "Il y a 2 jours",
      status: "expired",
      reward: "Aucune",
    },
  ],
};

/** Classement fictif — remplacé plus tard par AetheriaCore. */
export const topVoters: TopVoter[] = [
  { rank: 1, name: "Miravel", votes: 128 },
  { rank: 2, name: "Draeko", votes: 119 },
  { rank: 3, name: "Isolde_", votes: 104 },
  { rank: 4, name: "Fenwyn", votes: 97 },
  { rank: 5, name: "Auren", votes: 91 },
];
