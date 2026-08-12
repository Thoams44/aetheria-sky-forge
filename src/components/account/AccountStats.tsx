import {
  BarChart3,
  Clock,
  Gauge,
  Trees,
  Trophy,
  Vote,
  Coins,
} from "lucide-react";
import type { AccountStat } from "@/data/account";

const icons = {
  level: Gauge,
  playtime: Clock,
  islandLevel: Trees,
  islandValue: Coins,
  playerRank: Trophy,
  islandRank: Trophy,
  votes: Vote,
} as const;

export function AccountStats({ stats }: { stats: AccountStat[] }) {
  return (
    <div className="aether-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <BarChart3 size={16} className="text-secondary" />
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Mes statistiques
        </h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = icons[stat.key];
          return (
            <div
              key={stat.key}
              className="rounded-xl border border-border bg-surface/40 p-4 transition-colors duration-300 hover:border-secondary/30"
            >
              <Icon size={15} className="text-muted-foreground" />
              <p className="mt-3 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-lg text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}