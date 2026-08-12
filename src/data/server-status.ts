/**
 * Informations serveur affichées sous l'IP.
 *
 * Aucune connexion temps réel ici : la structure est prête à recevoir
 * plus tard la vraie donnée (API Minecraft / backend AetheriaSky).
 */
export type ServerStatus = {
  /** Version Minecraft supportée. */
  version: string;
  /** Nombre de joueurs connectés (valeur fictive pour l'instant). */
  playersOnline: number;
  /** Passera à true quand la donnée viendra réellement du serveur. */
  live: boolean;
};

export const demoServerStatus: ServerStatus = {
  version: "1.21.11",
  playersOnline: 127,
  live: false,
};
