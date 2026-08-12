import { useState } from "react";
import { Section, SectionHeading } from "@/components/aether/Section";
import { leaderboards } from "@/data/leaderboards";
import { cn } from "@/lib/utils";

export function LeaderboardsSection() {
  const [active, setActive] = useState(leaderboards[0]!.id);
  const board = leaderboards.find((b) => b.id === active)!;

  return (
    <Section id="classements">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Hall d'honneur"
          title="🏆 Classements"
          description="Les îles les plus hautes, les joueurs les plus assidus et celles et ceux qui soutiennent le serveur."
        />
        <div className="flex flex-wrap gap-2">
          {leaderboards.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActive(b.id)}
              className={cn(
                "h-9 rounded-full border px-4 text-xs font-semibold transition-all duration-300",
                b.id === active
                  ? "border-secondary/45 bg-accent/60 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-10 grid gap-2.5">
        {board.entries.map((entry) => (
          <li
            key={entry.rank}
            className={cn(
              "aether-surface flex items-center gap-4 rounded-2xl px-5 py-4 transition-colors duration-300 hover:border-secondary/30",
              entry.rank === 1 && "border-premium/35",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-sm",
                entry.rank === 1
                  ? "bg-premium/15 text-premium"
                  : entry.rank <= 3
                    ? "bg-secondary/12 text-secondary"
                    : "bg-accent/50 text-muted-foreground",
              )}
            >
              {entry.rank}
            </span>
            <span className="flex-1 truncate text-sm font-medium text-foreground sm:text-base">
              {entry.name}
            </span>
            <span className="text-xs text-muted-foreground sm:text-sm">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-muted-foreground">
        Classements de démonstration — bientôt synchronisés avec le serveur.
      </p>
    </Section>
  );
}