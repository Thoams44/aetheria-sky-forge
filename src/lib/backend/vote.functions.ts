import { createServerFn } from "@tanstack/react-start";

/**
 * Données de la page Vote — lecture et logique de récompense côté serveur.
 *
 * Règles de sécurité :
 *  - le navigateur n'envoie qu'un pseudo (identification de démonstration) ;
 *  - aucune valeur de récompense, de solde ou de vote ne vient du client ;
 *  - les Clés de Vote et les Aether Coins des paliers sont calculés à partir
 *    des votes réellement VALIDÉS en base, jamais d'une action du navigateur ;
 *  - la livraison en jeu reste à la charge d'AetheriaCore (table `deliveries`).
 */

export type VotePlatformDTO = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  voteUrl: string | null;
  cooldownSeconds: number;
  order: number;
};

export type VoteTierDTO = {
  id: string;
  votes: number;
  coins: number;
  bonus: string | null;
};

export type TopVoterDTO = { rank: number; name: string; votes: number };

export type PlatformStateDTO = {
  platformId: string;
  status: "available" | "pending" | "confirmed" | "cooldown";
  nextVoteAt: string | null;
};

export type VoteHistoryDTO = {
  id: string;
  platformId: string;
  platformName: string;
  votedAt: string;
  status: "PENDING" | "VALIDATED" | "REWARDED" | "REJECTED";
  reward: string;
};

export type VoteProfileDTO = {
  found: boolean;
  username: string;
  aetherCoins: number;
  shards: number;
  monthlyVotes: number;
  totalVotes: number;
  pendingVoteKeys: number;
  coinsFromTiers: number;
  claimedTiers: number[];
  platformStates: PlatformStateDTO[];
  history: VoteHistoryDTO[];
};

export const getVotePageData = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const supabase = createPublicServerClient();

  const [platformsRes, milestonesRes, leaderboardRes] = await Promise.all([
    supabase
      .from("vote_platforms")
      .select("id, name, description, icon, vote_url, cooldown_seconds, display_order")
      .eq("enabled", true)
      .order("display_order"),
    supabase
      .from("vote_milestones")
      .select("id, vote_count_required, aether_coins_reward, bonus_reward")
      .eq("active", true)
      .order("vote_count_required"),
    supabase
      .from("leaderboard_entries")
      .select("rank, display_name, score")
      .eq("category", "VOTERS")
      .eq("period", "MONTH")
      .order("rank")
      .limit(10),
  ]);

  const platforms: VotePlatformDTO[] = (platformsRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    icon: p.icon,
    voteUrl: p.vote_url,
    cooldownSeconds: p.cooldown_seconds,
    order: p.display_order,
  }));

  const tiers: VoteTierDTO[] = (milestonesRes.data ?? []).map((m) => ({
    id: m.id,
    votes: m.vote_count_required,
    coins: Number(m.aether_coins_reward ?? 0),
    bonus: m.bonus_reward,
  }));

  const topVoters: TopVoterDTO[] = (leaderboardRes.data ?? []).map((e) => ({
    rank: e.rank,
    name: e.display_name,
    votes: Number(e.score ?? 0),
  }));

  return { platforms, tiers, topVoters };
});

/**
 * Profil de vote d'un pseudo. Le pseudo n'est PAS une authentification :
 * seules des informations publiques de progression sont renvoyées.
 */
export const getVoteProfile = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string }) => ({
    username: String(input.username ?? "").trim().slice(0, 16),
  }))
  .handler(async ({ data }): Promise<VoteProfileDTO> => {
    const empty: VoteProfileDTO = {
      found: false,
      username: data.username,
      aetherCoins: 0,
      shards: 0,
      monthlyVotes: 0,
      totalVotes: 0,
      pendingVoteKeys: 0,
      coinsFromTiers: 0,
      claimedTiers: [],
      platformStates: [],
      history: [],
    };
    if (data.username.length < 3) return empty;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id, minecraft_username, aether_coins_balance, shards_balance")
      .ilike("minecraft_username", data.username)
      .maybeSingle();

    if (!player) return empty;

    const [{ data: votes }, { data: platforms }] = await Promise.all([
      supabaseAdmin
        .from("votes")
        .select("id, platform_id, voted_at, validated_at, status, reward_claimed")
        .eq("player_id", player.id)
        .order("voted_at", { ascending: false }),
      supabaseAdmin
        .from("vote_platforms")
        .select("id, name, cooldown_seconds")
        .eq("enabled", true),
    ]);

    const allVotes = votes ?? [];
    const platformMap = new Map((platforms ?? []).map((p) => [p.id, p]));

    const validated = allVotes.filter(
      (v) => v.status === "VALIDATED" || v.status === "REWARDED",
    );
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const monthlyVotes = validated.filter(
      (v) => new Date(v.voted_at) >= monthStart,
    ).length;

    // --- Récompenses calculées et enregistrées côté serveur uniquement ---
    await ensureVoteKeyDeliveries(supabaseAdmin, player.id, allVotes);
    const { coinsFromTiers, claimedTiers } = await ensureMilestoneClaims(
      supabaseAdmin,
      player.id,
      validated.length,
    );

    const { count: pendingVoteKeys } = await supabaseAdmin
      .from("deliveries")
      .select("id", { count: "exact", head: true })
      .eq("player_id", player.id)
      .eq("delivery_type", "VOTE_KEY")
      .neq("status", "DELIVERED");

    const now = Date.now();
    const platformStates: PlatformStateDTO[] = (platforms ?? []).map((p) => {
      const last = allVotes.find((v) => v.platform_id === p.id);
      if (!last) {
        return { platformId: p.id, status: "available", nextVoteAt: null };
      }
      if (last.status === "PENDING") {
        return { platformId: p.id, status: "pending", nextVoteAt: null };
      }
      const nextAt =
        new Date(last.voted_at).getTime() + p.cooldown_seconds * 1000;
      if (nextAt > now) {
        return {
          platformId: p.id,
          status: "cooldown",
          nextVoteAt: new Date(nextAt).toISOString(),
        };
      }
      return { platformId: p.id, status: "available", nextVoteAt: null };
    });

    const history: VoteHistoryDTO[] = allVotes.slice(0, 20).map((v) => ({
      id: v.id,
      platformId: v.platform_id,
      platformName: platformMap.get(v.platform_id)?.name ?? "Plateforme",
      votedAt: v.voted_at,
      status: v.status as VoteHistoryDTO["status"],
      reward:
        v.status === "VALIDATED" || v.status === "REWARDED"
          ? "+1 Clé de Vote"
          : "—",
    }));

    return {
      found: true,
      username: player.minecraft_username ?? data.username,
      aetherCoins: Number(player.aether_coins_balance ?? 0),
      shards: Number(player.shards_balance ?? 0),
      monthlyVotes,
      totalVotes: validated.length,
      pendingVoteKeys: pendingVoteKeys ?? 0,
      coinsFromTiers,
      claimedTiers,
      platformStates,
      history,
    };
  });

/** Une Clé de Vote par vote validé — livrée par AetheriaCore, jamais par le site. */
async function ensureVoteKeyDeliveries(
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
async function ensureMilestoneClaims(
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
