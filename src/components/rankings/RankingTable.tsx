import { Search } from "lucide-react";
import type { RankingEntry } from "@/data/rankings";
import { cn } from "@/lib/utils";

export function RankingTable({
  entries,
  columnLabel,
  showOwner,
}: {
  entries: RankingEntry[];
  columnLabel: string;
  showOwner?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <div className="aether-surface flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
        <Search size={18} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Aucun joueur trouvé pour cette recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="hidden grid-cols-[64px_1fr_140px_140px] gap-4 border-b border-border bg-surface/40 px-5 py-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:grid">
        <span>Rang</span>
        <span>{showOwner ? "Île / Propriétaire" : "Joueur"}</span>
        <span className="text-right">{columnLabel}</span>
        <span className="text-right">Détail</span>
      </div>

      <ul className="divide-y divide-border">
        {entries.map((entry) => (
          <li
            key={`${entry.rank}-${entry.name}`}
            className={cn(
              "grid grid-cols-[48px_1fr_auto] items-center gap-4 px-5 py-4 transition-colors duration-300 hover:bg-accent/25 sm:grid-cols-[64px_1fr_140px_140px]",
              entry.rank <= 3 && "bg-surface/30",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl font-display text-sm",
                entry.rank === 1
                  ? "bg-premium/15 text-premium"
                  : entry.rank <= 3
                    ? "bg-secondary/12 text-secondary"
                    : "bg-accent/50 text-muted-foreground",
              )}
            >
              {entry.rank}
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground sm:text-base">
                {entry.name}
              </span>
              {showOwner && entry.owner && (
                <span className="block truncate text-xs text-muted-foreground">
                  par {entry.owner}
                </span>
              )}
            </span>

            <span className="text-right text-sm font-semibold text-foreground">
              {entry.statValue}
            </span>

            <span className="hidden text-right text-xs text-muted-foreground sm:block">
              {entry.extraLabel ? `${entry.extraLabel} : ${entry.extraValue}` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}