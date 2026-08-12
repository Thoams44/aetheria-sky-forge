import { createServerFn } from "@tanstack/react-start";

/** Lectures publiques du catalogue AetheriaSky (grades, boutique, votes, classements). */

export const getGrades = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const { data, error } = await createPublicServerClient()
    .from("grades")
    .select("id, name, slug, description, price, currency, color, icon, advantages, display_order")
    .eq("active", true)
    .order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getStoreProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const { data, error } = await createPublicServerClient()
    .from("store_products")
    .select("id, name, slug, type, description, price, currency, quantity, grade_id, display_order")
    .eq("active", true)
    .order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getVotePlatforms = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const { data, error } = await createPublicServerClient()
    .from("vote_platforms")
    .select("id, name, slug, description, icon, vote_url, cooldown_seconds, display_order")
    .eq("enabled", true)
    .order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getVoteMilestones = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const { data, error } = await createPublicServerClient()
    .from("vote_milestones")
    .select(
      "id, vote_count_required, aether_coins_reward, bonus_reward, shards_reward, display_order",
    )
    .eq("active", true)
    .order("vote_count_required");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((input: { category: "PLAYERS" | "ISLANDS" | "VOTERS"; period?: "DAY" | "WEEK" | "MONTH" | "ALL_TIME" }) => input)
  .handler(async ({ data: input }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const { data, error } = await createPublicServerClient()
      .from("leaderboard_entries")
      .select("rank, display_name, secondary_label, score, metadata")
      .eq("category", input.category)
      .eq("period", input.period ?? "ALL_TIME")
      .order("rank");
    if (error) throw new Error(error.message);
    return data ?? [];
  });
