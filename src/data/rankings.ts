/**
 * Classements AetheriaSky — données de démonstration.
 *
 * Architecture prévue (aucune connexion réelle ici) :
 *   Site → Backend AetheriaSky → API / données Minecraft → AetheriaCore → Serveur
 *
 * Le backend devra fournir, par catégorie et par période, une liste
 * `RankingEntry` déjà triée + la position du joueur connecté (`MyRanking`).
 */

export type RankingCategoryId = "joueurs" | "iles" | "voteurs";

export type RankingPeriodId = "jour" | "semaine" | "mois" | "toujours";

export type RankingPeriod = { id: RankingPeriodId; label: string };

export const rankingPeriods: RankingPeriod[] = [
  { id: "jour", label: "Aujourd'hui" },
  { id: "semaine", label: "Cette semaine" },
  { id: "mois", label: "Ce mois" },
  { id: "toujours", label: "Tout le temps" },
];

/** Une ligne de classement, quelle que soit la catégorie. */
export type RankingEntry = {
  rank: number;
  /** Pseudo du joueur, ou nom de l'île. */
  name: string;
  /** Propriétaire de l'île (catégorie « iles » uniquement). */
  owner?: string;
  /** Statistique principale mise en avant (label + valeur). */
  statLabel: string;
  statValue: string;
  /** Statistique secondaire optionnelle (ex. Éclats gagnés). */
  extraLabel?: string;
  extraValue?: string;
};

export type RankingCategory = {
  id: RankingCategoryId;
  label: string;
  icon: "trophy" | "island" | "vote";
  description: string;
  /** Intitulé de la colonne principale du tableau. */
  columnLabel: string;
  entries: RankingEntry[];
};

export const rankingCategories: RankingCategory[] = [
  {
    id: "joueurs",
    label: "Top Joueurs",
    icon: "trophy",
    description:
      "Les aventuriers les plus expérimentés du royaume, classés par niveau.",
    columnLabel: "Niveau",
    entries: [
      { rank: 1, name: "Nyxeril", statLabel: "Niveau", statValue: "87", extraLabel: "Temps de jeu", extraValue: "312 h" },
      { rank: 2, name: "LunaCraft", statLabel: "Niveau", statValue: "82", extraLabel: "Temps de jeu", extraValue: "287 h" },
      { rank: 3, name: "PixelWave", statLabel: "Niveau", statValue: "79", extraLabel: "Temps de jeu", extraValue: "265 h" },
      { rank: 4, name: "Solvane", statLabel: "Niveau", statValue: "74", extraLabel: "Temps de jeu", extraValue: "241 h" },
      { rank: 5, name: "Korrin_", statLabel: "Niveau", statValue: "71", extraLabel: "Temps de jeu", extraValue: "228 h" },
      { rank: 6, name: "Ambrelys", statLabel: "Niveau", statValue: "68", extraLabel: "Temps de jeu", extraValue: "205 h" },
      { rank: 7, name: "Thal_Veyra", statLabel: "Niveau", statValue: "64", extraLabel: "Temps de jeu", extraValue: "193 h" },
      { rank: 8, name: "Miravel", statLabel: "Niveau", statValue: "61", extraLabel: "Temps de jeu", extraValue: "178 h" },
      { rank: 9, name: "Draeko", statLabel: "Niveau", statValue: "58", extraLabel: "Temps de jeu", extraValue: "166 h" },
      { rank: 10, name: "Isolde_", statLabel: "Niveau", statValue: "55", extraLabel: "Temps de jeu", extraValue: "154 h" },
    ],
  },
  {
    id: "iles",
    label: "Top Îles",
    icon: "island",
    description:
      "Les îles les plus développées, classées par points de progression.",
    columnLabel: "Points d'île",
    entries: [
      { rank: 1, name: "Cendres d'Aether", owner: "Nyxeril", statLabel: "Points", statValue: "412 950", extraLabel: "Niveau", extraValue: "42" },
      { rank: 2, name: "Havre-Nuage", owner: "LunaCraft", statLabel: "Points", statValue: "388 120", extraLabel: "Niveau", extraValue: "39" },
      { rank: 3, name: "Les Sylves", owner: "PixelWave", statLabel: "Points", statValue: "351 704", extraLabel: "Niveau", extraValue: "37" },
      { rank: 4, name: "Orée Céleste", owner: "Ambrelys", statLabel: "Points", statValue: "310 288", extraLabel: "Niveau", extraValue: "34" },
      { rank: 5, name: "Brumefall", owner: "Solvane", statLabel: "Points", statValue: "295 011", extraLabel: "Niveau", extraValue: "32" },
      { rank: 6, name: "Aube d'Argent", owner: "Korrin_", statLabel: "Points", statValue: "268 430", extraLabel: "Niveau", extraValue: "30" },
      { rank: 7, name: "Vaste-Cime", owner: "Thal_Veyra", statLabel: "Points", statValue: "241 877", extraLabel: "Niveau", extraValue: "28" },
      { rank: 8, name: "Jardin Suspendu", owner: "Miravel", statLabel: "Points", statValue: "219 640", extraLabel: "Niveau", extraValue: "26" },
      { rank: 9, name: "Roche-Étoile", owner: "Draeko", statLabel: "Points", statValue: "198 205", extraLabel: "Niveau", extraValue: "24" },
      { rank: 10, name: "Voile de Brume", owner: "Isolde_", statLabel: "Points", statValue: "176 918", extraLabel: "Niveau", extraValue: "22" },
    ],
  },
  {
    id: "voteurs",
    label: "Top Voteurs",
    icon: "vote",
    description:
      "Celles et ceux qui soutiennent le serveur chaque jour. Les votes créditent des Éclats.",
    columnLabel: "Votes",
    entries: [
      { rank: 1, name: "Miravel", statLabel: "Votes", statValue: "128", extraLabel: "Éclats gagnés", extraValue: "À définir" },
      { rank: 2, name: "Draeko", statLabel: "Votes", statValue: "119", extraLabel: "Éclats gagnés", extraValue: "À définir" },
      { rank: 3, name: "Isolde_", statLabel: "Votes", statValue: "104", extraLabel: "Éclats gagnés", extraValue: "À définir" },
      { rank: 4, name: "Fenwyn", statLabel: "Votes", statValue: "97", extraLabel: "Éclats gagnés", extraValue: "À définir" },
      { rank: 5, name: "Auren", statLabel: "Votes", statValue: "91", extraLabel: "Éclats gagnés", extraValue: "À définir" },
      { rank: 6, name: "Nyxeril", statLabel: "Votes", statValue: "86", extraLabel: "Éclats gagnés", extraValue: "À définir" },
      { rank: 7, name: "LunaCraft", statLabel: "Votes", statValue: "80", extraLabel: "Éclats gagnés", extraValue: "À définir" },
      { rank: 8, name: "PixelWave", statLabel: "Votes", statValue: "74", extraLabel: "Éclats gagnés", extraValue: "À définir" },
      { rank: 9, name: "Solvane", statLabel: "Votes", statValue: "69", extraLabel: "Éclats gagnés", extraValue: "À définir" },
      { rank: 10, name: "Ambrelys", statLabel: "Votes", statValue: "63", extraLabel: "Éclats gagnés", extraValue: "À définir" },
    ],
  },
];

/** Position du joueur connecté — fournie plus tard par le backend. */
export type MyRanking = {
  rank: number;
  name: string;
  statLabel: string;
  statValue: string;
};

export const myRankingByCategory: Record<RankingCategoryId, MyRanking> = {
  joueurs: { rank: 127, name: "Thomas", statLabel: "Points", statValue: "1 245" },
  iles: { rank: 94, name: "Île de Thomas", statLabel: "Points", statValue: "38 410" },
  voteurs: { rank: 212, name: "Thomas", statLabel: "Votes", statValue: "17" },
};

/**
 * Sélecteur unique — remplacer plus tard par un appel au backend
 * (`GET /rankings?category=...&period=...`).
 */
export function getRanking(
  categoryId: RankingCategoryId,
  _period: RankingPeriodId,
): RankingCategory {
  return rankingCategories.find((c) => c.id === categoryId) ?? rankingCategories[0]!;
}