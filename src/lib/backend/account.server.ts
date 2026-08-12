/* Espace joueur — lecture serveur uniquement. Le navigateur n'envoie jamais de player_id. */

export type AccountGradeDTO = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  advantages: string[];
  active: boolean;
  obtainedAt: string | null;
  expiresAt: string | null;
};

export type AccountOrderItemDTO = {
  id: string;
  name: string;
  quantity: number;
  totalPrice: number | null;
};

export type AccountOrderDTO = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  mode: string;
  currency: string;
  total: number | null;
  items: AccountOrderItemDTO[];
};

export type AccountRewardDTO = {
  id: string;
  type: string;
  status: string;
  label: string;
  detail: string;
  createdAt: string;
  deliveredAt: string | null;
};

export type AccountTierDTO = {
  id: string;
  votes: number;
  coins: number;
  bonus: string | null;
  claimed: boolean;
};

export type AccountDTO = {
  linked: boolean;
  player: {
    id: string;
    username: string | null;
    uuid: string | null;
    verified: boolean;
    createdAt: string;
    lastSeenAt: string | null;
  } | null;
  grade: AccountGradeDTO | null;
  aetherCoins: number;
  shards: number;
  votes: {
    monthly: number;
    total: number;
    coinsFromTiers: number;
    tiers: AccountTierDTO[];
  };
  orders: AccountOrderDTO[];
  rewards: AccountRewardDTO[];
};

const rewardLabels: Record<string, string> = {
  GRADE: "Grade",
  AETHER_COINS: "Aether Coins",
  SHARDS: "Éclats",
  VOTE_KEY: "Clé de Vote",
  CUSTOM: "Récompense",
};

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

const emptyAccount: AccountDTO = {
  linked: false,
  player: null,
  grade: null,
  aetherCoins: 0,
  shards: 0,
  votes: { monthly: 0, total: 0, coinsFromTiers: 0, tiers: [] },
  orders: [],
  rewards: [],
};

/** Charge l'intégralité de l'espace joueur pour l'utilisateur authentifié. */
export async function loadAccount(supabase: any, userId: string): Promise<AccountDTO> {
  const { data: player, error } = await supabase
    .from("players")
    .select(
      "id, minecraft_uuid, minecraft_username, verified, grade_id, grade_obtained_at, grade_expires_at, aether_coins_balance, shards_balance, last_seen_at, created_at",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);

  const { data: milestones } = await supabase
    .from("vote_milestones")
    .select("id, vote_count_required, aether_coins_reward, bonus_reward")
    .eq("active", true)
    .order("vote_count_required");

  const baseTiers: AccountTierDTO[] = (milestones ?? []).map((m: any) => ({
    id: m.id,
    votes: m.vote_count_required,
    coins: Number(m.aether_coins_reward ?? 0),
    bonus: m.bonus_reward ?? null,
    claimed: false,
  }));

  if (!player) return { ...emptyAccount, votes: { ...emptyAccount.votes, tiers: baseTiers } };

  const playerId = player.id as string;

  const [gradeRes, txRes, votesRes, monthVotesRes, claimsRes, ordersRes, deliveriesRes] =
    await Promise.all([
      player.grade_id
        ? supabase
            .from("grades")
            .select("id, name, slug, color, icon, advantages")
            .eq("id", player.grade_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("currency_transactions")
        .select("currency_type, amount, type")
        .eq("player_id", playerId),
      supabase
        .from("votes")
        .select("id", { count: "exact", head: true })
        .eq("player_id", playerId)
        .in("status", ["VALIDATED", "REWARDED"]),
      supabase
        .from("votes")
        .select("id", { count: "exact", head: true })
        .eq("player_id", playerId)
        .in("status", ["VALIDATED", "REWARDED"])
        .gte("voted_at", startOfMonthISO()),
      supabase
        .from("player_milestone_claims")
        .select("milestone_id, aether_coins_granted")
        .eq("player_id", playerId),
      supabase
        .from("orders")
        .select(
          "id, order_number, total_amount, currency, status, mode, created_at, order_items(id, quantity, total_price, store_products(name))",
        )
        .eq("player_id", playerId)
        .order("created_at", { ascending: false }),
      supabase
        .from("deliveries")
        .select("id, delivery_type, status, payload, created_at, delivered_at")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false })
        .limit(24),
    ]);

  // Soldes calculés à partir des transactions serveur, repli sur le solde stocké.
  let coins = 0;
  let shards = 0;
  let hasTx = false;
  for (const tx of txRes.data ?? []) {
    hasTx = true;
    const delta = (tx.type === "DEBIT" ? -1 : 1) * Number(tx.amount ?? 0);
    if (tx.currency_type === "AETHER_COINS") coins += delta;
    else if (tx.currency_type === "SHARDS") shards += delta;
  }
  if (!hasTx) {
    coins = Number(player.aether_coins_balance ?? 0);
    shards = Number(player.shards_balance ?? 0);
  }

  const claims = claimsRes.data ?? [];
  const claimedIds = new Set(claims.map((c: any) => c.milestone_id));
  const coinsFromTiers = claims.reduce(
    (sum: number, c: any) => sum + Number(c.aether_coins_granted ?? 0),
    0,
  );

  const gradeData = (gradeRes as any).data;
  const expiresAt = player.grade_expires_at as string | null;
  const grade: AccountGradeDTO | null = gradeData
    ? {
        id: gradeData.id,
        name: gradeData.name,
        slug: gradeData.slug,
        color: gradeData.color,
        icon: gradeData.icon,
        advantages: Array.isArray(gradeData.advantages)
          ? gradeData.advantages.filter((a: unknown): a is string => typeof a === "string")
          : [],
        active: !expiresAt || new Date(expiresAt).getTime() > Date.now(),
        obtainedAt: player.grade_obtained_at ?? null,
        expiresAt,
      }
    : null;

  const orders: AccountOrderDTO[] = (ordersRes.data ?? []).map((o: any) => ({
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at,
    status: o.status,
    mode: o.mode,
    currency: o.currency,
    total: o.total_amount == null ? null : Number(o.total_amount),
    items: (o.order_items ?? []).map((it: any) => ({
      id: it.id,
      name: it.store_products?.name ?? "Produit",
      quantity: it.quantity ?? 1,
      totalPrice: it.total_price == null ? null : Number(it.total_price),
    })),
  }));

  const rewards: AccountRewardDTO[] = (deliveriesRes.data ?? []).map((d: any) => {
    const amount = Number(d.payload?.amount ?? 0);
    const label = rewardLabels[d.delivery_type] ?? "Récompense";
    return {
      id: d.id,
      type: d.delivery_type,
      status: d.status,
      label,
      detail: amount > 0 ? `${amount} × ${label}` : "Détail à définir",
      createdAt: d.created_at,
      deliveredAt: d.delivered_at ?? null,
    };
  });

  return {
    linked: true,
    player: {
      id: playerId,
      username: player.minecraft_username ?? null,
      uuid: player.minecraft_uuid ?? null,
      verified: Boolean(player.verified),
      createdAt: player.created_at,
      lastSeenAt: player.last_seen_at ?? null,
    },
    grade,
    aetherCoins: coins,
    shards,
    votes: {
      monthly: monthVotesRes.count ?? 0,
      total: votesRes.count ?? 0,
      coinsFromTiers,
      tiers: baseTiers.map((t) => ({ ...t, claimed: claimedIds.has(t.id) })),
    },
    orders,
    rewards,
  };
}

/** Lie un pseudo Minecraft au compte connecté (démo : aucune vérification réelle). */
export async function linkPlayer(userId: string, username: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("players")
    .select("id, user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from("players")
      .update({ minecraft_username: username })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  }

  const { data: taken } = await supabaseAdmin
    .from("players")
    .select("id, user_id")
    .ilike("minecraft_username", username)
    .maybeSingle();

  if (taken && taken.user_id && taken.user_id !== userId) {
    return { ok: false as const, message: "Ce pseudo est déjà lié à un autre compte." };
  }

  if (taken) {
    const { error } = await supabaseAdmin
      .from("players")
      .update({ user_id: userId })
      .eq("id", taken.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  }

  const { error } = await supabaseAdmin
    .from("players")
    .insert({ user_id: userId, minecraft_username: username, verified: false });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}
