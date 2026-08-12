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
    const { data: existing } = await supabaseAdmin
      .from("deliveries")
      .select("id")
      .eq("player_id", playerId)
      .eq("delivery_type", "VOTE_KEY")
      .contains("payload", { vote_id: vote.id })
      .maybeSingle();
    if (existing) continue;

    await supabaseAdmin.from("deliveries").insert({
      player_id: playerId,
      delivery_type: "VOTE_KEY",
      status: "PENDING",
      payload: { vote_id: vote.id, amount: 1, source: "VOTE" },
    });
    await supabaseAdmin
      .from("votes")
      .update({ reward_claimed: true, status: "REWARDED" })
      .eq("id", vote.id)
      .eq("reward_claimed", false);
  }
}

/** Paliers cumulatifs : une seule récompense par palier (player_milestone_claims). */
export async function ensureMilestoneClaims(
  supabaseAdmin: any,
  playerId: string,
  validatedVotes: number,
): Promise<{ coinsFromTiers: number; claimedTiers: number[] }> {
  const { data: milestones } = await supabaseAdmin
    .from("vote_milestones")
    .select("id, vote_count_required, aether_coins_reward, bonus_reward")
    .eq("active", true)
    .order("vote_count_required");

  const { data: claims } = await supabaseAdmin
    .from("player_milestone_claims")
    .select("milestone_id, aether_coins_granted")
    .eq("player_id", playerId);

  const claimed = new Set<string>((claims ?? []).map((c: any) => c.milestone_id));
  let coinsFromTiers = (claims ?? []).reduce(
    (sum: number, c: any) => sum + Number(c.aether_coins_granted ?? 0),
    0,
  );
  const claimedTiers: number[] = [];

  for (const m of milestones ?? []) {
    if (validatedVotes < m.vote_count_required) continue;
    claimedTiers.push(m.vote_count_required);
    if (claimed.has(m.id)) continue;

    const coins = Number(m.aether_coins_reward ?? 0);
    const { error } = await supabaseAdmin.from("player_milestone_claims").insert({
      player_id: playerId,
      milestone_id: m.id,
      aether_coins_granted: coins,
      shards_granted: 0,
    });
    if (error) continue; // contrainte d'unicité : déjà réclamé

    if (coins > 0) {
      await supabaseAdmin.from("currency_transactions").insert({
        player_id: playerId,
        currency_type: "AETHER_COINS",
        amount: coins,
        type: "CREDIT",
        reason: `Palier de vote ${m.vote_count_required}`,
        reference_id: m.id,
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
      coinsFromTiers += coins;
    }

    if (m.bonus_reward) {
      // Livraison préparée pour AetheriaCore : rien n'est donné en jeu par le site.
      await supabaseAdmin.from("deliveries").insert({
        player_id: playerId,
        delivery_type: "CUSTOM",
        status: "PENDING",
        payload: {
          milestone_id: m.id,
          bonus: m.bonus_reward,
          source: "VOTE_MILESTONE",
        },
      });
    }
  }

  return { coinsFromTiers, claimedTiers };
}
