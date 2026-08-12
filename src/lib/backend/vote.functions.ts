import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Données de la page Vote — lecture et logique de récompense côté serveur.
 *
 * Règles :
 *  - un clic ne donne jamais de récompense : seul un vote confirmé par la
 *    plateforme (callback signé) crée un vote VALIDÉ et 1 Clé de Vote ;
 *  - les Aether Coins ne viennent que des paliers, réclamés explicitement ;
 *  - les Éclats n'interviennent jamais dans le système de vote ;
 *  - cooldown, disponibilité, compteurs et classement sont calculés serveur.
 */

export type VotePlatformDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  voteUrl: string | null;
  domain: string | null;
  cooldownSeconds: number;
  order: number;
};

export type VoteTierDTO = {
  id: string;
  votes: number;
  coins: number;
  bonus: string | null;
  claimed?: boolean;
  reached?: boolean;
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
  monthlyVotes: number;
  totalVotes: number;
  rank: number | null;
  pendingVoteKeys: number;
  coinsFromTiers: number;
  tiers: VoteTierDTO[];
  platformStates: PlatformStateDTO[];
  history: VoteHistoryDTO[];
  /** Le joueur consulté est-il celui connecté (réclamation possible) ? */
  owned: boolean;
};

function domainOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export const getVotePageData = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const supabase = createPublicServerClient();

  const [platformsRes, milestonesRes] = await Promise.all([
    supabase
      .from("vote_platforms")
      .select("id, name, slug, description, icon, vote_url, cooldown_seconds, display_order")
      .eq("enabled", true)
      .order("display_order"),
    supabase
      .from("vote_milestones")
      .select("id, vote_count_required, aether_coins_reward, bonus_reward")
      .eq("active", true)
      .order("vote_count_required"),
  ]);

  const platforms: VotePlatformDTO[] = (platformsRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    icon: p.icon,
    voteUrl: p.vote_url,
    domain: domainOf(p.vote_url),
    cooldownSeconds: p.cooldown_seconds,
    order: p.display_order,
  }));

  const tiers: VoteTierDTO[] = (milestonesRes.data ?? []).map((m) => ({
    id: m.id,
    votes: m.vote_count_required,
    coins: Number(m.aether_coins_reward ?? 0),
    bonus: m.bonus_reward,
  }));

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { loadVoterLeaderboard } = await import("./vote.server");
  const { top } = await loadVoterLeaderboard(supabaseAdmin, 10);
  const topVoters: TopVoterDTO[] = top.map(({ rank, name, votes }) => ({
    rank,
    name,
    votes,
  }));

  return { platforms, tiers, topVoters };
});

async function buildProfile(
  supabaseAdmin: any,
  player: { id: string; minecraft_username: string | null; aether_coins_balance: number | null },
  owned: boolean,
): Promise<VoteProfileDTO> {
  const { isValidated, platformState, loadVoterLeaderboard } = await import("./vote.server");
  const { ensureVoteKeyDeliveries, readMilestoneState } = await import(
    "./vote-rewards.server"
  );

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
  const platformMap = new Map<string, any>((platforms ?? []).map((p: any) => [p.id, p]));
  const validated = allVotes.filter(isValidated);

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const monthlyVotes = validated.filter(
    (v: any) => new Date(v.voted_at) >= monthStart,
  ).length;

  // 1 vote validé = exactement 1 Clé de Vote (idempotent).
  await ensureVoteKeyDeliveries(supabaseAdmin, player.id, allVotes);

  const { tiers, coinsFromTiers } = await readMilestoneState(
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

  const { rankByPlayer } = await loadVoterLeaderboard(supabaseAdmin, 1);

  const platformStates: PlatformStateDTO[] = (platforms ?? []).map((p: any) => {
    const state = platformState(p, allVotes);
    return { platformId: p.id, status: state.status, nextVoteAt: state.nextVoteAt };
  });

  const history: VoteHistoryDTO[] = allVotes.slice(0, 20).map((v: any) => ({
    id: v.id,
    platformId: v.platform_id,
    platformName: platformMap.get(v.platform_id)?.name ?? "Plateforme",
    votedAt: v.voted_at,
    status: v.status,
    reward: isValidated(v) ? "+1 Clé de Vote" : "—",
  }));

  return {
    found: true,
    username: player.minecraft_username ?? "",
    aetherCoins: Number(player.aether_coins_balance ?? 0),
    monthlyVotes,
    totalVotes: validated.length,
    rank: rankByPlayer.get(player.id)?.rank ?? null,
    pendingVoteKeys: pendingVoteKeys ?? 0,
    coinsFromTiers,
    tiers: tiers.map((t) => ({
      id: t.id,
      votes: t.votes,
      coins: t.coins,
      bonus: t.bonus,
      claimed: t.claimed,
      reached: t.reached,
    })),
    platformStates,
    history,
    owned,
  };
}

const emptyProfile = (username: string): VoteProfileDTO => ({
  found: false,
  username,
  aetherCoins: 0,
  monthlyVotes: 0,
  totalVotes: 0,
  rank: null,
  pendingVoteKeys: 0,
  coinsFromTiers: 0,
  tiers: [],
  platformStates: [],
  history: [],
  owned: false,
});

/** Progression publique d'un pseudo (consultation, aucune réclamation possible). */
export const getVoteProfile = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string }) => ({
    username: String(input.username ?? "").trim().slice(0, 16),
  }))
  .handler(async ({ data }): Promise<VoteProfileDTO> => {
    if (data.username.length < 3) return emptyProfile(data.username);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id, minecraft_username, aether_coins_balance")
      .ilike("minecraft_username", data.username)
      .maybeSingle();

    if (!player) return emptyProfile(data.username);
    return buildProfile(supabaseAdmin, player as any, false);
  });

/** Progression du joueur connecté — seule variante autorisant la réclamation. */
export const getMyVoteProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VoteProfileDTO> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id, minecraft_username, aether_coins_balance")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!player) return emptyProfile("");
    return buildProfile(supabaseAdmin, player as any, true);
  });

/**
 * Ouverture d'un vote : vérifie côté serveur que la plateforme est active et
 * que le joueur peut voter. Ne crée aucun vote et ne donne aucune récompense.
 */
export const startVote = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; platformId: string }) => ({
    username: String(input?.username ?? "").trim().slice(0, 16),
    platformId: String(input?.platformId ?? ""),
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { platformState } = await import("./vote.server");

    const { data: platform } = await supabaseAdmin
      .from("vote_platforms")
      .select("id, name, vote_url, cooldown_seconds, enabled")
      .eq("id", data.platformId)
      .maybeSingle();

    if (!platform || !platform.enabled) {
      return { ok: false as const, message: "Plateforme indisponible.", voteUrl: null };
    }
    if (!platform.vote_url) {
      return {
        ok: false as const,
        message: "Le lien de vote de cette plateforme n'est pas encore configuré.",
        voteUrl: null,
      };
    }

    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id")
      .ilike("minecraft_username", data.username)
      .maybeSingle();

    if (player) {
      const { data: votes } = await supabaseAdmin
        .from("votes")
        .select("id, platform_id, voted_at, status, reward_claimed")
        .eq("player_id", player.id)
        .eq("platform_id", platform.id)
        .order("voted_at", { ascending: false })
        .limit(5);

      const state = platformState(platform as any, (votes ?? []) as any);
      if (state.status === "cooldown") {
        return {
          ok: false as const,
          message: "Vote encore en cooldown sur cette plateforme.",
          voteUrl: null,
        };
      }
    }

    return { ok: true as const, message: "", voteUrl: platform.vote_url as string };
  });

/** Réclamation d'un palier — authentifiée, montant relu en base, une seule fois. */
export const claimVoteMilestone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { milestoneId: string }) => ({
    milestoneId: String(input?.milestoneId ?? ""),
  }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isValidated } = await import("./vote.server");
    const { claimMilestoneReward } = await import("./vote-rewards.server");

    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!player) {
      return { ok: false as const, message: "Aucun profil joueur lié à ce compte.", coins: 0 };
    }

    const { data: votes } = await supabaseAdmin
      .from("votes")
      .select("id, status")
      .eq("player_id", player.id);

    const validated = (votes ?? []).filter(isValidated).length;
    return claimMilestoneReward(supabaseAdmin, player.id, data.milestoneId, validated);
  });
