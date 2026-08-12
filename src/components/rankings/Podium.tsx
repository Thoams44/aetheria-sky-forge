import { Crown, Medal, Trees } from "lucide-react";
import type { RankingCategoryId, RankingEntry } from "@/data/rankings";
import { cn } from "@/lib/utils";

const order = [1, 0, 2]; // 2e — 1er — 3e

export function Podium({
  entries,
  categoryId,
}: {
  entries: RankingEntry[];
  categoryId: RankingCategoryId;
}) {
  const top = entries.slice(0, 3);
  if (top.length < 3) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
      {order.map((i) => {
        const entry = top[i]!;
        const first = entry.rank === 1;
        return (
          <article
            key={entry.rank}
            className={cn(
              "aether-surface relative flex flex-col items-center rounded-2xl px-5 text-center transition-transform duration-500 hover:-translate-y-1",
              first
                ? "border-premium/40 py-10 shadow-[0_28px_70px_-40px_var(--premium)] sm:py-14"
                : "border-border/80 py-8 sm:py-10",
            )}
          >
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                first
                  ? "bg-premium/15 text-premium"
                  : entry.rank === 2
                    ? "bg-secondary/12 text-secondary"
                    : "bg-accent/60 text-muted-foreground",
              )}
            >
              {first ? <Crown size={22} /> : categoryId === "iles" ? <Trees size={20} /> : <Medal size={20} />}
            </span>

            <p
              className={cn(
                "mt-4 font-display",
                first ? "text-4xl text-premium" : "text-3xl text-foreground",
              )}
            >
              #{entry.rank}
            </p>

            <p className={cn("mt-2 font-medium text-foreground", first ? "text-lg" : "text-base")}>
              {entry.name}
            </p>
            {entry.owner && (
              <p className="mt-1 text-xs text-muted-foreground">par {entry.owner}</p>
            )}

            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {entry.statLabel}
            </p>
            <p className={cn("font-display", first ? "text-2xl text-foreground" : "text-xl text-foreground")}>
              {entry.statValue}
            </p>

            {entry.extraLabel && (
              <p className="mt-3 text-xs text-muted-foreground">
                {entry.extraLabel} : <span className="text-foreground">{entry.extraValue}</span>
              </p>
            )}

            <span
              aria-hidden
              className={cn(
                "mt-6 w-full rounded-xl border border-border/70",
                first ? "h-4 bg-premium/15" : entry.rank === 2 ? "h-3 bg-secondary/10" : "h-2 bg-accent/40",
              )}
            />
          </article>
        );
      })}
    </div>
  );
}