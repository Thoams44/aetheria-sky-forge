/* Logique de récompense des votes — serveur uniquement, jamais pilotée par le navigateur. */

/** Une Clé de Vote par vote validé — livrée par AetheriaCore, jamais par le site. */
export async function ensureVoteKeyDeliveries(
  supabaseAdmin: any,
  playerId: string,
  votes: Array<{ id: string; status: string; reward_claimed: boolean }>,
) {
  const pending = votes.filter(
    (v) => (v.status === "VALIDATED" || v.status === "REWARDED") && !v.reward_claimed,
  );
  for (const vote of pending) {
    await ensureVoteKeyDelivery(supabaseAdmin, playerId, vote.id);
  }
}

/** Idempotent : une seule livraison VOTE_KEY (quantité 1) par vote confirmé. */
export async function ensureVoteKeyDelivery(
  supabaseAdmin: any,
  playerId: string,
  voteId: string,
) {
  const { data: existing } = await supabaseAdmin
    .from("deliveries")
    .select("id")
    .eq("player_id", playerId)
    .eq("delivery_type", "VOTE_KEY")
    .contains("payload", { vote_id: voteId })
    .maybeSingle();

  if (!existing) {
    await supabaseAdmin.from("deliveries").insert({
      player_id: playerId,
      delivery_type: "VOTE_KEY",
      status: "PENDING",
      payload: { vote_id: voteId, amount: 1, source: "VOTE" },
    });
  }

  await supabaseAdmin
    .from("votes")
    .update({ reward_claimed: true, status: "REWARDED" })
    .eq("id", voteId)
    .eq("reward_claimed", false);
}

export type MilestoneStateRow = {
  id: string;
  votes: number;
  coins: number;
  bonus: string | null;
  claimed: boolean;
  reached: boolean;
};

/**
 * Lecture seule : état des paliers pour un joueur.
 * Aucun crédit n'est effectué ici — la réclamation est une action explicite.
 */
export async function readMilestoneState(
  supabaseAdmin: any,
  playerId: string | null,
  validatedVotes: number,
): Promise<{ tiers: MilestoneStateRow[]; coinsFromTiers: number }> {
  const { data: milestones } = await supabaseAdmin
    .from("vote_milestones")
    .select("id, vote_count_required, aether_coins_reward, bonus_reward")
    .eq("active", true)
    .order("vote_count_required");

  let claims: any[] = [];
  if (playerId) {
    const { data } = await supabaseAdmin
      .from("player_milestone_claims")
      .select("milestone_id, aether_coins_granted")
      .eq("player_id", playerId);
    claims = data ?? [];
  }

  const claimed = new Set<string>(claims.map((c) => c.milestone_id));
  const coinsFromTiers = claims.reduce(
    (sum, c) => sum + Number(c.aether_coins_granted ?? 0),
    0,
  );

  const tiers: MilestoneStateRow[] = (milestones ?? []).map((m: any) => ({
    id: m.id,
    votes: m.vote_count_required,
    coins: Number(m.aether_coins_reward ?? 0),
    bonus: m.bonus_reward,
    claimed: claimed.has(m.id),
    reached: validatedVotes >= m.vote_count_required,
  }));

  return { tiers, coinsFromTiers };
}

/**
 * Réclamation d'un palier : montant relu en base, unicité garantie par la
 * contrainte (player_id, milestone_id). Les Éclats ne sont jamais crédités.
 */
export async function claimMilestoneReward(
  supabaseAdmin: any,
  playerId: string,
  milestoneId: string,
  validatedVotes: number,
): Promise<{ ok: boolean; message: string; coins: number }> {
  const { data: milestone } = await supabaseAdmin
    .from("vote_milestones")
    .select("id, vote_count_required, aether_coins_reward, bonus_reward, active")
    .eq("id", milestoneId)
    .maybeSingle();

  if (!milestone || !milestone.active) {
    return { ok: false, message: "Palier introuvable.", coins: 0 };
  }
  if (validatedVotes < milestone.vote_count_required) {
    return {
      ok: false,
      message: `Palier non atteint (${validatedVotes}/${milestone.vote_count_required} votes).`,
      coins: 0,
    };
  }

  const coins = Number(milestone.aether_coins_reward ?? 0);

  const { error } = await supabaseAdmin.from("player_milestone_claims").insert({
    player_id: playerId,
    milestone_id: milestone.id,
    aether_coins_granted: coins,
    shards_granted: 0,
  });
  if (error) {
    return { ok: false, message: "Ce palier a déjà été réclamé.", coins: 0 };
  }

  if (coins > 0) {
    await supabaseAdmin.from("currency_transactions").insert({
      player_id: playerId,
      currency_type: "AETHER_COINS",
      amount: coins,
      type: "CREDIT",
      reason: `Palier de vote ${milestone.vote_count_required}`,
      reference_id: milestone.id,
    });
    const { data: p } = await supabaseAdmin
      .from("players")
      .select("aether_coins_balance")
      .eq("id", playerId)
      .maybeSingle();
    await supabaseAdmin
      .from("players")
      .update({ aether_coins_balance: Number(p?.aether_coins_balance ?? 0) + coins })
      .eq("id", playerId);
  }

  if (milestone.bonus_reward) {
    // Nom commercial non défini : identifiant interne SPECIAL_VOTE_KEY.
    await supabaseAdmin.from("deliveries").insert({
      player_id: playerId,
      delivery_type: "CUSTOM",
      status: "PENDING",
      payload: {
        milestone_id: milestone.id,
        item: "SPECIAL_VOTE_KEY",
        amount: 1,
        source: "VOTE_MILESTONE",
      },
    });
  }

  await supabaseAdmin.from("audit_logs").insert({
    action: "VOTE_MILESTONE_CLAIMED",
    target_id: playerId,
    metadata: {
      milestone_id: milestone.id,
      votes_required: milestone.vote_count_required,
      aether_coins: coins,
      bonus: milestone.bonus_reward ? "SPECIAL_VOTE_KEY" : null,
    },
  });

  return { ok: true, message: `Palier réclamé : +${coins} AC.`, coins };
}
