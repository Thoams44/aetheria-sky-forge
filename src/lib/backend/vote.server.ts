/* Système de vote — toute la logique de décision est ici, côté serveur. */

export type VoteRow = {
  id: string;
  platform_id: string;
  voted_at: string;
  status: string;
  reward_claimed: boolean;
};

export type PlatformRow = {
  id: string;
  name: string;
  cooldown_seconds: number;
};

export const VALIDATED_STATUSES = ["VALIDATED", "REWARDED"];

export function isValidated(v: { status: string }) {
  return VALIDATED_STATUSES.includes(v.status);
}

/**
 * Disponibilité d'une plateforme pour un joueur, calculée à partir du dernier
 * vote enregistré et du cooldown propre à CETTE plateforme.
 */
export function platformState(platform: PlatformRow, votes: VoteRow[]) {
  const last = votes
    .filter((v) => v.platform_id === platform.id && v.status !== "REJECTED")
    .sort((a, b) => +new Date(b.voted_at) - +new Date(a.voted_at))[0];

  if (!last) return { status: "available" as const, nextVoteAt: null };
  if (last.status === "PENDING") {
    return { status: "pending" as const, nextVoteAt: null };
  }
  const nextAt = new Date(last.voted_at).getTime() + platform.cooldown_seconds * 1000;
  if (nextAt > Date.now()) {
    return {
      status: "cooldown" as const,
      nextVoteAt: new Date(nextAt).toISOString(),
    };
  }
  return { status: "available" as const, nextVoteAt: null };
}

/** Classement des voteurs calculé depuis les votes réellement validés. */
export async function loadVoterLeaderboard(
  supabaseAdmin: any,
  limit = 10,
): Promise<{
  top: Array<{ rank: number; name: string; votes: number; playerId: string }>;
  rankByPlayer: Map<string, { rank: number; votes: number }>;
  total: number;
}> {
  const { data } = await supabaseAdmin
    .from("votes")
    .select("player_id, status, players(minecraft_username)")
    .in("status", VALIDATED_STATUSES);

  const counts = new Map<string, { name: string; votes: number }>();
  for (const row of (data ?? []) as any[]) {
    const current = counts.get(row.player_id) ?? {
      name: row.players?.minecraft_username ?? "Joueur",
      votes: 0,
    };
    current.votes += 1;
    counts.set(row.player_id, current);
  }

  const sorted = [...counts.entries()].sort(
    (a, b) => b[1].votes - a[1].votes || a[1].name.localeCompare(b[1].name),
  );

  const rankByPlayer = new Map<string, { rank: number; votes: number }>();
  sorted.forEach(([playerId, entry], index) => {
    rankByPlayer.set(playerId, { rank: index + 1, votes: entry.votes });
  });

  const top = sorted.slice(0, limit).map(([playerId, entry], index) => ({
    rank: index + 1,
    name: entry.name,
    votes: entry.votes,
    playerId,
  }));

  return { top, rankByPlayer, total: sorted.length };
}

/**
 * Confirmation d'un vote par une plateforme (callback signé).
 * Idempotent : l'index unique (platform_id, external_vote_id) empêche
 * tout doublon de vote, de compteur et de Clé de Vote.
 */
export async function confirmVote(
  supabaseAdmin: any,
  input: { playerId: string; platformId: string; externalVoteId: string; votedAt?: string },
): Promise<{ ok: boolean; duplicated: boolean; voteId: string | null }> {
  const { data: existing } = await supabaseAdmin
    .from("votes")
    .select("id")
    .eq("platform_id", input.platformId)
    .eq("external_vote_id", input.externalVoteId)
    .maybeSingle();

  if (existing) {
    const { ensureVoteKeyDelivery } = await import("./vote-rewards.server");
    await ensureVoteKeyDelivery(supabaseAdmin, input.playerId, existing.id);
    return { ok: true, duplicated: true, voteId: existing.id };
  }

  const nowIso = new Date().toISOString();
  const { data: inserted, error } = await supabaseAdmin
    .from("votes")
    .insert({
      player_id: input.playerId,
      platform_id: input.platformId,
      external_vote_id: input.externalVoteId,
      status: "VALIDATED",
      voted_at: input.votedAt ?? nowIso,
      validated_at: nowIso,
    })
    .select("id")
    .maybeSingle();

  if (error || !inserted) {
    // Course : le vote existe déjà (contrainte d'unicité).
    const { data: raced } = await supabaseAdmin
      .from("votes")
      .select("id")
      .eq("platform_id", input.platformId)
      .eq("external_vote_id", input.externalVoteId)
      .maybeSingle();
    if (!raced) return { ok: false, duplicated: false, voteId: null };
    const { ensureVoteKeyDelivery } = await import("./vote-rewards.server");
    await ensureVoteKeyDelivery(supabaseAdmin, input.playerId, raced.id);
    return { ok: true, duplicated: true, voteId: raced.id };
  }

  const { ensureVoteKeyDelivery } = await import("./vote-rewards.server");
  await ensureVoteKeyDelivery(supabaseAdmin, input.playerId, inserted.id);

  await supabaseAdmin.from("audit_logs").insert({
    action: "VOTE_VALIDATED",
    target_id: input.playerId,
    metadata: {
      vote_id: inserted.id,
      platform_id: input.platformId,
      external_vote_id: input.externalVoteId,
      reward: "VOTE_KEY x1",
    },
  });

  return { ok: true, duplicated: false, voteId: inserted.id };
}
