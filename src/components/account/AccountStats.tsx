import { BarChart3, Clock, Gauge, Trees, Trophy, Vote, Coins } from "lucide-react";
import { SOON } from "@/data/account";

const slots = [
  { key: "level", label: "Niveau", Icon: Gauge },
  { key: "playtime", label: "Temps de jeu", Icon: Clock },
  { key: "islandLevel", label: "Niveau de l'île", Icon: Trees },
  { key: "islandValue", label: "Valeur de l'île", Icon: Coins },
  { key: "playerRank", label: "Classement joueur", Icon: Trophy },
  { key: "islandRank", label: "Classement île", Icon: Trophy },
  { key: "votes", label: "Nombre de votes", Icon: Vote },
] as const;

/** Seul le nombre de votes est réel ; le reste viendra d'AetheriaCore. */
export function AccountStats({ totalVotes }: { totalVotes: number | null }) {
  return (
    <div className="aether-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <BarChart3 size={16} className="text-secondary" />
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Mes statistiques
        </h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {slots.map(({ key, label, Icon }) => {
          const value = key === "votes" && totalVotes != null ? String(totalVotes) : null;
          return (
            <div
              key={key}
              className="rounded-xl border border-border bg-surface/40 p-4 transition-colors duration-300 hover:border-secondary/30"
            >
              <Icon size={15} className="text-muted-foreground" />
              <p className="mt-3 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </p>
              <p
                className={
                  value
                    ? "mt-1 font-display text-lg text-foreground"
                    : "mt-1 text-xs text-muted-foreground"
                }
              >
                {value ?? SOON}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
