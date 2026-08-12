import { Crown, Trophy } from "lucide-react";
import { topVoters } from "@/data/vote";
import { formatVotes } from "@/lib/vote";

const podium = ["text-premium", "text-secondary", "text-info"];

export function TopVoters() {
  return (
    <div className="aether-surface rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <Trophy size={17} className="text-premium" />
        <h3 className="font-display text-lg text-foreground">Top Voteurs</h3>
        <span className="ml-auto rounded-full border border-border px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Ce mois-ci
        </span>
      </div>

      <ul className="mt-6 divide-y divide-border">
        {topVoters.map((voter) => {
          const isPodium = voter.rank <= 3;
          return (
            <li key={voter.rank} className="flex items-center gap-4 py-3.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                  isPodium
                    ? `bg-accent/60 ${podium[voter.rank - 1]}`
                    : "bg-accent/30 text-muted-foreground"
                }`}
              >
                {voter.rank}
              </span>
              <span
                className={`flex items-center gap-2 text-sm ${
                  isPodium ? "font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                {voter.rank === 1 && <Crown size={14} className="text-premium" />}
                {voter.name}
              </span>
              <span className="ml-auto text-sm text-muted-foreground">
                {formatVotes(voter.votes)} votes
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-xs text-muted-foreground">
        Classement de démonstration. Le classement mensuel réel sera alimenté par
        le backend AetheriaSky.
      </p>
    </div>
  );
}
