import { useMemo, useState } from "react";
import { Search, Trees, Trophy, Vote } from "lucide-react";
import { Section, SectionHeading } from "@/components/aether/Section";
import { MyRankingCard } from "@/components/rankings/MyRankingCard";
import { Podium } from "@/components/rankings/Podium";
import { RankingTable } from "@/components/rankings/RankingTable";
import {
  getRanking,
  myRankingByCategory,
  rankingCategories,
  rankingPeriods,
  type RankingCategoryId,
  type RankingPeriodId,
} from "@/data/rankings";
import { cn } from "@/lib/utils";

const icons = { trophy: Trophy, island: Trees, vote: Vote } as const;

export function RankingsBoard() {
  const [category, setCategory] = useState<RankingCategoryId>("joueurs");
  const [period, setPeriod] = useState<RankingPeriodId>("mois");
  const [query, setQuery] = useState("");

  const board = getRanking(category, period);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return board.entries;
    return board.entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.owner?.toLowerCase().includes(q) ?? false),
    );
  }, [board, query]);

  return (
    <Section>
      {/* Onglets de catégorie */}
      <div className="flex flex-wrap gap-2.5">
        {rankingCategories.map((c) => {
          const Icon = icons[c.icon];
          const active = c.id === category;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-full border px-5 text-xs font-semibold transition-all duration-300",
                active
                  ? "border-secondary/45 bg-accent/60 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={14} className={active ? "text-secondary" : undefined} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Période + recherche */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-full border border-border bg-surface/40 p-1.5">
          {rankingPeriods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={cn(
                "h-8 rounded-full px-4 text-[0.7rem] font-semibold transition-colors duration-300",
                p.id === period
                  ? "bg-accent/70 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="relative w-full lg:w-72">
          <Search
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un joueur..."
            aria-label="Rechercher un joueur dans les classements"
            className="h-11 w-full rounded-full border border-border bg-surface/40 pl-10 pr-4 text-sm text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground focus:border-secondary/50"
          />
        </label>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{board.description}</p>

      {/* Podium */}
      <div className="mt-10">
        <Podium entries={board.entries} categoryId={board.id} />
      </div>

      {/* Tableau complet */}
      <div className="mt-10">
        <SectionHeading eyebrow="Classement complet" title={board.label} />
        <div className="mt-6">
          <RankingTable
            entries={filtered}
            columnLabel={board.columnLabel}
            showOwner={board.id === "iles"}
          />
        </div>
      </div>

      {/* Mon classement */}
      <div className="mt-10">
        <MyRankingCard data={myRankingByCategory[board.id]} />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Classements de démonstration — les périodes et les statistiques seront
        alimentées plus tard par AetheriaCore.
      </p>
    </Section>
  );
}