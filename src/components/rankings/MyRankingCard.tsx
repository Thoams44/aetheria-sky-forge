import { UserRound } from "lucide-react";
import type { MyRanking } from "@/data/rankings";

export function MyRankingCard({ data }: { data: MyRanking }) {
  return (
    <div className="aether-surface flex flex-col gap-5 rounded-2xl px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/60 text-secondary">
          <UserRound size={18} />
        </span>
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Votre classement
          </p>
          <p className="mt-1 text-base font-medium text-foreground">{data.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Position</p>
          <p className="font-display text-2xl text-foreground">#{data.rank}</p>
        </div>
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {data.statLabel}
          </p>
          <p className="font-display text-2xl text-secondary">{data.statValue}</p>
        </div>
      </div>
    </div>
  );
}