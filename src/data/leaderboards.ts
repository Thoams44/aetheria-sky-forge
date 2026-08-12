export type LeaderboardEntry = {
  rank: number;
  name: string;
  value: string;
};

export type Leaderboard = {
  id: "joueurs" | "iles" | "voteurs";
  label: string;
  unit: string;
  entries: LeaderboardEntry[];
};

/** Données de démonstration — remplacées plus tard par AetheriaCore. */
export const leaderboards: Leaderboard[] = [
  {
    id: "joueurs",
    label: "Top Joueurs",
    unit: "niveau",
    entries: [
      { rank: 1, name: "Nyxeril", value: "Niveau 184" },
      { rank: 2, name: "Solvane", value: "Niveau 171" },
      { rank: 3, name: "Korrin_", value: "Niveau 165" },
      { rank: 4, name: "Ambrelys", value: "Niveau 152" },
      { rank: 5, name: "Thal_Veyra", value: "Niveau 149" },
    ],
  },
  {
    id: "iles",
    label: "Top Îles",
    unit: "points",
    entries: [
      { rank: 1, name: "Cendres d'Aether", value: "412 950 pts" },
      { rank: 2, name: "Havre-Nuage", value: "388 120 pts" },
      { rank: 3, name: "Les Sylves", value: "351 704 pts" },
      { rank: 4, name: "Orée Céleste", value: "310 288 pts" },
      { rank: 5, name: "Brumefall", value: "295 011 pts" },
    ],
  },
  {
    id: "voteurs",
    label: "Top Voteurs",
    unit: "votes",
    entries: [
      { rank: 1, name: "Miravel", value: "128 votes" },
      { rank: 2, name: "Draeko", value: "119 votes" },
      { rank: 3, name: "Isolde_", value: "104 votes" },
      { rank: 4, name: "Fenwyn", value: "97 votes" },
      { rank: 5, name: "Auren", value: "91 votes" },
    ],
  },
];