import { type VoteStatus, type VoteTier, voteTiers } from "@/data/vote";
import type { VoteTierDTO } from "@/lib/backend/vote.functions";

export type TierState = "unlocked" | "next" | "locked";

export type AnyTier = VoteTier | VoteTierDTO;

export type VoteTierProgress = {
  tier: { votes: number; coins: number; bonus?: string | null; reward?: string };
  state: TierState;
  /** Votes restants avant déblocage (0 si déjà débloqué). */
  remaining: number;
  percent: number;
};

/**
 * Paliers cumulatifs : tout palier dont le seuil est atteint est débloqué.
 * Le premier palier non atteint est marqué comme prochain objectif.
 */
export function getTierProgress(
  votes: number,
  tiers: AnyTier[] = voteTiers,
): VoteTierProgress[] {
  const nextTier = tiers.find((t) => votes < t.votes);
  return tiers.map((tier) => {
    const unlocked = votes >= tier.votes;
    return {
      tier: {
        votes: tier.votes,
        coins: tier.coins,
        bonus: tier.bonus ?? null,
        ...("reward" in tier ? { reward: tier.reward } : {}),
      },
      state: unlocked ? "unlocked" : tier === nextTier ? "next" : "locked",
      remaining: unlocked ? 0 : tier.votes - votes,
      percent: Math.min(100, Math.round((votes / tier.votes) * 100)),
    };
  });
}

/** Prochain palier non atteint (null si tous débloqués). */
export function getNextTier(votes: number, tiers: AnyTier[]) {
  return tiers.find((t) => votes < t.votes) ?? null;
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

/** Libellé du prochain vote, calculé depuis le cooldown réel de la plateforme. */
export function nextVoteLabel(
  status: VoteStatus,
  cooldownSeconds: number,
  nextVoteAt?: string | null,
): string {
  if (status === "available") return "Disponible maintenant";
  if (status === "pending") return "Validation en cours";
  if (nextVoteAt) {
    const diff = new Date(nextVoteAt).getTime() - Date.now();
    if (diff <= 0) return "Disponible maintenant";
    const hours = Math.floor(diff / 3_600_000);
    const minutes = Math.round((diff % 3_600_000) / 60_000);
    return hours > 0 ? `Dans ${hours}h ${minutes}min` : `Dans ${minutes} min`;
  }
  return `Toutes les ${formatCooldown(cooldownSeconds)}`;
}

export function formatCooldown(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  return hours >= 1 ? `${hours}h` : `${Math.round(seconds / 60)} min`;
}

export function formatVotes(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function formatVoteDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
