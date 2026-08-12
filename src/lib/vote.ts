import {
  type VoteStatus,
  type VoteTier,
  voteTiers,
} from "@/data/vote";

export type TierState = "unlocked" | "next" | "locked";

export type VoteTierProgress = {
  tier: VoteTier;
  state: TierState;
  /** Votes restants avant déblocage (0 si déjà débloqué). */
  remaining: number;
  percent: number;
};

/**
 * Paliers cumulatifs : tout palier dont le seuil est atteint est débloqué.
 * Le premier palier non atteint est marqué comme prochain objectif.
 */
export function getTierProgress(votes: number, tiers: VoteTier[] = voteTiers): VoteTierProgress[] {
  const nextTier = tiers.find((t) => votes < t.votes);
  return tiers.map((tier) => {
    const unlocked = votes >= tier.votes;
    return {
      tier,
      state: unlocked ? "unlocked" : tier === nextTier ? "next" : "locked",
      remaining: unlocked ? 0 : tier.votes - votes,
      percent: Math.min(100, Math.round((votes / tier.votes) * 100)),
    };
  });
}

export const voteStatusLabel: Record<VoteStatus, string> = {
  available: "Disponible",
  pending: "Vote en attente",
  confirmed: "Vote confirmé",
  cooldown: "Cooldown",
};

export const voteStatusTone: Record<VoteStatus, string> = {
  available: "border-secondary/40 bg-secondary/10 text-secondary",
  pending: "border-premium/40 bg-premium/10 text-premium",
  confirmed: "border-success/40 bg-success/10 text-success",
  cooldown: "border-border bg-accent/50 text-muted-foreground",
};

/** Libellé du prochain vote disponible (démo — pas de compte à rebours réel). */
export function nextVoteLabel(status: VoteStatus, cooldownHours: number): string {
  if (status === "available") return "Disponible maintenant";
  if (status === "pending") return "Validation en cours";
  return `Dans moins de ${cooldownHours}h`;
}

export function formatVotes(n: number): string {
  return n.toLocaleString("fr-FR");
}
