import { Check, Gem, Lock } from "lucide-react";
import { voteTiers } from "@/data/vote";
import { getTierProgress } from "@/lib/vote";

export function VoteTierList({ votes }: { votes: number }) {
  const progress = getTierProgress(votes, voteTiers);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {progress.map(({ tier, state, remaining }) => (
        <article
          key={tier.votes}
          className={`relative rounded-2xl border p-6 transition-colors duration-300 ${
            state === "next"
              ? "border-secondary/50 bg-secondary/8 shadow-[0_18px_45px_-30px_var(--primary)]"
              : "border-border bg-surface/40"
          }`}
        >
          {state === "next" && (
            <span className="absolute -top-2.5 left-6 rounded-full bg-[image:var(--gradient-aether)] px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground">
              Prochain palier
            </span>
          )}
          <p className="font-display text-3xl text-foreground">{tier.votes}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">votes</p>

          <p className="mt-4 flex items-center gap-2 text-sm text-foreground">
            <Gem size={14} className="text-info" /> {tier.reward}
          </p>

          <p className="mt-4 flex items-center gap-2 text-xs font-semibold">
            {state === "unlocked" ? (
              <span className="flex items-center gap-1.5 text-success">
                <Check size={13} /> Débloqué
              </span>
            ) : state === "next" ? (
              <span className="text-secondary">Plus que {remaining} votes</span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Lock size={12} /> Verrouillé
              </span>
            )}
          </p>
        </article>
      ))}
    </div>
  );
}
