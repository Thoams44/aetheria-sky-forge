import { Check, Gem, Lock, Vote } from "lucide-react";
import { voteTiers } from "@/data/vote";
import { getTierProgress } from "@/lib/vote";
import { formatAmount } from "@/data/account";
import { cn } from "@/lib/utils";

export function AccountVotes({
  monthlyVotes,
  totalVotes,
  shards,
}: {
  monthlyVotes: number;
  totalVotes: number;
  shards: number;
}) {
  const progress = getTierProgress(monthlyVotes, voteTiers);
  const next = progress.find((p) => p.state === "next");
  const goal = next?.tier.votes ?? voteTiers[voteTiers.length - 1]!.votes;
  const percent = Math.min(100, Math.round((monthlyVotes / goal) * 100));

  return (
    <div className="aether-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Vote size={16} className="text-secondary" />
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Mes votes
        </h2>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <p className="font-display text-3xl text-foreground">
          {monthlyVotes} <span className="text-muted-foreground">/ {goal} votes</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {totalVotes} votes au total ·{" "}
          <span className="inline-flex items-center gap-1 text-foreground">
            <Gem size={12} className="text-info" /> {formatAmount(shards)} Éclats gagnés
          </span>
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-accent/60">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-aether)] transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      {next && (
        <p className="mt-3 text-xs text-muted-foreground">
          Prochain palier : <span className="text-secondary">{next.tier.votes} votes</span> —
          récompense en Éclats ({next.tier.reward}). Plus que {next.remaining} votes.
        </p>
      )}

      <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {progress.map(({ tier, state }) => (
          <li
            key={tier.votes}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 text-xs",
              state === "unlocked"
                ? "border-success/35 bg-success/8"
                : state === "next"
                  ? "border-secondary/40 bg-secondary/8"
                  : "border-border bg-surface/40",
            )}
          >
            <span className="text-foreground">{tier.votes} votes</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {state === "unlocked" ? (
                <>
                  <Check size={12} className="text-success" /> Débloqué
                </>
              ) : state === "next" ? (
                <span className="text-secondary">Prochain palier</span>
              ) : (
                <>
                  <Lock size={11} /> Verrouillé
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}