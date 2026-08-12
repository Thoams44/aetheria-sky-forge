import { Check, Coins, Crown, KeyRound, Lock, Unlock } from "lucide-react";
import type { VoteTierDTO } from "@/lib/backend/vote.functions";
import { buttonClasses } from "@/components/aether/AetherButton";

export type TierDisplayState = "locked" | "available" | "claimed";

export function VoteTierList({
  votes,
  tiers,
  onClaim,
  claimingId,
  canClaim = false,
}: {
  votes: number;
  tiers: VoteTierDTO[];
  onClaim?: (tier: VoteTierDTO) => void;
  claimingId?: string | null;
  canClaim?: boolean;
}) {
  if (tiers.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        Les paliers de vote seront bientôt disponibles.
      </p>
    );
  }

  const finalVotes = tiers[tiers.length - 1]?.votes ?? 150;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {tiers.map((tier) => {
        const reached = tier.reached ?? votes >= tier.votes;
        const claimed = tier.claimed ?? false;
        const state: TierDisplayState = claimed
          ? "claimed"
          : reached
            ? "available"
            : "locked";
        const isFinal = tier.votes === finalVotes;
        const remaining = Math.max(0, tier.votes - votes);

        return (
          <article
            key={tier.id ?? tier.votes}
            className={`relative rounded-2xl border p-6 transition-colors duration-300 ${
              state === "available"
                ? "border-secondary/50 bg-secondary/8 shadow-[0_18px_45px_-30px_var(--primary)]"
                : isFinal
                  ? "border-premium/40 bg-premium/8 shadow-[0_18px_45px_-30px_var(--premium)]"
                  : "border-border bg-surface/40"
            }`}
          >
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
              {state === "claimed" ? (
                <span className="flex items-center gap-1.5 text-success">
                  <Check size={13} /> Réclamé
                </span>
              ) : state === "available" ? (
                <span className="flex items-center gap-1.5 text-secondary">
                  <Unlock size={13} /> Disponible
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Lock size={12} /> Verrouillé — encore {remaining} votes
                </span>
              )}
            </p>

            {state === "available" && canClaim && (
              <button
                type="button"
                disabled={claimingId === tier.id}
                onClick={() => onClaim?.(tier)}
                className={`${buttonClasses("primary", "sm")} mt-4 w-full`}
              >
                {claimingId === tier.id ? "Réclamation…" : "Réclamer"}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
