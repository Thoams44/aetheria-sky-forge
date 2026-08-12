import { Check, Coins, Crown, KeyRound, Lock } from "lucide-react";
import type { VoteTierDTO } from "@/lib/backend/vote.functions";
import { getTierProgress } from "@/lib/vote";

export function VoteTierList({ votes, tiers }: { votes: number; tiers: VoteTierDTO[] }) {
  if (tiers.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        Les paliers de vote seront bientôt disponibles.
      </p>
    );
  }
  const progress = getTierProgress(votes, tiers);
  const finalVotes = tiers[tiers.length - 1]?.votes ?? 150;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {progress.map(({ tier, state, remaining }) => {
        const isFinal = tier.votes === finalVotes;
        return (
          <article
            key={tier.votes}
            className={`relative rounded-2xl border p-6 transition-colors duration-300 ${
              state === "next"
                ? "border-secondary/50 bg-secondary/8 shadow-[0_18px_45px_-30px_var(--primary)]"
                : isFinal
                  ? "border-premium/40 bg-premium/8 shadow-[0_18px_45px_-30px_var(--premium)]"
                  : "border-border bg-surface/40"
            }`}
          >
            {state === "next" && !isFinal && (
              <span className="absolute -top-2.5 left-6 rounded-full bg-[image:var(--gradient-aether)] px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground">
                Prochain palier
              </span>
            )}
            {isFinal && (
              <span className="absolute -top-2.5 right-6 flex items-center gap-1 rounded-full bg-premium/15 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-premium">
                <Crown size={10} />
                Palier final
              </span>
            )}
            <p className="font-display text-3xl text-foreground">{tier.votes}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">votes</p>

            <p className="mt-4 flex items-center gap-2 text-sm text-foreground">
              <Coins size={14} className="text-premium" /> {tier.coins} AC
            </p>
            {tier.bonus && (
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <KeyRound size={13} className="text-premium" /> {tier.bonus}
              </p>
            )}

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
        );
      })}
    </div>
  );
}
