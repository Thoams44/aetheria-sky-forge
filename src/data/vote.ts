export type VotePlatform = {
  id: string;
  name: string;
  /** URL de vote — à renseigner plus tard. */
  url: string | null;
  cooldownHours: number;
};

export type VoteTier = {
  votes: number;
  /** Récompense en Éclats — quantités à définir. */
  reward: string;
};

/** État de démonstration. Sera fourni plus tard par le backend AetheriaSky. */
export const voteProgress = {
  current: 37,
  goal: 50,
  nextReward: "Éclats — récompense à définir",
};

export const votePlatforms: VotePlatform[] = [
  { id: "serveur-prive", name: "Serveur-Privé", url: null, cooldownHours: 24 },
  { id: "top-serveurs", name: "Top-Serveurs", url: null, cooldownHours: 24 },
  { id: "serveurs-minecraft", name: "Serveurs-Minecraft", url: null, cooldownHours: 12 },
  { id: "liste-serveurs", name: "Liste-Serveurs", url: null, cooldownHours: 24 },
];

export const voteTiers: VoteTier[] = [
  { votes: 10, reward: "Récompense à définir" },
  { votes: 25, reward: "Récompense à définir" },
  { votes: 50, reward: "Récompense à définir" },
  { votes: 100, reward: "Récompense à définir" },
];