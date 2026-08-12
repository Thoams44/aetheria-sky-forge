export type VotePlatform = {
  id: string;
  name: string;
  /** URL de vote — à renseigner plus tard. */
  url: string | null;
  cooldownHours: number;
};

export type VoteTier = {
  votes: number;
  reward: string;
};

/** État de démonstration. Sera fourni plus tard par le backend AetheriaSky. */
export const voteProgress = {
  current: 37,
  goal: 50,
  nextReward: "Clé Légendaire",
};

export const votePlatforms: VotePlatform[] = [
  { id: "serveur-prive", name: "Serveur-Privé", url: null, cooldownHours: 24 },
  { id: "top-serveurs", name: "Top-Serveurs", url: null, cooldownHours: 24 },
  { id: "serveurs-minecraft", name: "Serveurs-Minecraft", url: null, cooldownHours: 12 },
  { id: "liste-serveurs", name: "Liste-Serveurs", url: null, cooldownHours: 24 },
];

export const voteTiers: VoteTier[] = [
  { votes: 10, reward: "Clé Commune" },
  { votes: 25, reward: "Coffre d'Aether" },
  { votes: 50, reward: "Clé Légendaire" },
  { votes: 100, reward: "Familier Céleste" },
];