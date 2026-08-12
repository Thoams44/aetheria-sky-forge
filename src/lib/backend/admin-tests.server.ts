/**
 * Système de TEST boutique — réservé FONDATEUR / ADMIN.
 * Toutes les opérations sont contrôlées côté serveur :
 * - le rôle est vérifié en base (jamais depuis le navigateur),
 * - les prix et totaux sont relus depuis la base,
 * - seules les commandes `mode = TEST` sont manipulables,
 * - aucun paiement réel, aucun contact avec Minecraft / AetheriaCore.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type UserClient = SupabaseClient<Database>;

export type TestPlayerDTO = {
  id: string;
  username: string | null;
  uuid: string | null;
  verified: boolean;
  gradeName: string | null;
};

export type TestProductDTO = {
  id: string;
  name: string;
  slug: string;
  type: "GRADE" | "AETHER_COINS";
  price: number | null;
  currency: string;
  quantity: number | null;
};

export type TestDeliveryDTO = {
  id: string;
  type: string;
  status: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  deliveredAt: string | null;
  preview: string;
};

export type TestOrderDTO = {
  id: string;
  orderNumber: string;
  status: string;
  mode: string;
  currency: string;
  total: number | null;
  createdAt: string;
  player: { id: string | null; username: string | null; uuid: string | null };
  actorEmail: string | null;
  items: { name: string; quantity: number; totalPrice: number | null }[];
  delivery: TestDeliveryDTO | null;
};

export type TestTimelineEntryDTO = {
  action: string;
  createdAt: string;
  actorEmail: string | null;
};

export type TestDashboardDTO = {
  stats: { total: number; delivered: number; failed: number; pending: number };
  orders: TestOrderDTO[];
};

export class ForbiddenError extends Error {
  constructor() {
    super("Accès refusé : réservé aux rôles FONDATEUR et ADMIN.");
  }
}

/** Vérification serveur du rôle FONDATEUR / ADMIN (lecture de user_roles via RLS). */
export async function assertAdmin(supabase: UserClient, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new ForbiddenError();
  const roles = (data ?? []).map((r) => String(r.role).toLowerCase());
  const allowed = roles.some((r) => r === "fondateur" || r === "founder" || r === "admin");
  if (!allowed) throw new ForbiddenError();
  return roles;
}

async function actorEmails(ids: (string | null)[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  const map = new Map<string, string>();
  await Promise.all(
    unique.map(async (id) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id);
      if (data?.user?.email) map.set(id, data.user.email);
    }),
  );
  return map;
}

export function previewMessage(product: {
  type: string;
  name: string;
  quantity: number | null;
}, quantity: number): string {
  if (product.type === "GRADE") {
    return `[TEST] AetheriaSky\nLe joueur recevrait le grade ${product.name.replace(/^Grade\s+/i, "").toUpperCase()}.`;
  }
  const amount = (product.quantity ?? 0) * quantity;
  return `[TEST] AetheriaSky\nLe joueur recevrait ${amount.toLocaleString("fr-FR")} Aether Coins.`;
}

async function logAudit(
  action: string,
  actorId: string,
  targetId: string | null,
  metadata: Record<string, unknown>,
) {
  await supabaseAdmin.from("audit_logs").insert({
    action,
    actor_id: actorId,
    target_id: targetId,
    metadata: metadata as never,
  });
}

/* ---------------------------------------------------------------- lectures */

export async function searchPlayers(query: string): Promise<TestPlayerDTO[]> {
  const term = query.trim();
  let request = supabaseAdmin
    .from("players")
    .select("id, minecraft_username, minecraft_uuid, verified, grade_id")
    .limit(10);

  if (term) {
    const isUuid = /^[0-9a-fA-F-]{8,36}$/.test(term) && term.includes("-");
    request = isUuid
      ? request.eq("minecraft_uuid", term)
      : request.ilike("minecraft_username", `%${term}%`);
  }

  const { data, error } = await request;
  if (error) throw new Error(error.message);

  const gradeIds = [...new Set((data ?? []).map((p) => p.grade_id).filter(Boolean))] as string[];
  const gradeMap = new Map<string, string>();
  if (gradeIds.length) {
    const { data: grades } = await supabaseAdmin.from("grades").select("id, name").in("id", gradeIds);
    (grades ?? []).forEach((g) => gradeMap.set(g.id, g.name));
  }

  return (data ?? []).map((p) => ({
    id: p.id,
    username: p.minecraft_username,
    uuid: p.minecraft_uuid,
    verified: p.verified,
    gradeName: p.grade_id ? (gradeMap.get(p.grade_id) ?? null) : null,
  }));
}

export async function listTestProducts(): Promise<TestProductDTO[]> {
  const { data, error } = await supabaseAdmin
    .from("store_products")
    .select("id, name, slug, type, price, currency, quantity, display_order")
    .eq("active", true)
    .order("display_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: p.type as "GRADE" | "AETHER_COINS",
    price: p.price === null ? null : Number(p.price),
    currency: p.currency,
    quantity: p.quantity,
  }));
}

async function mapOrders(rows: Record<string, unknown>[]): Promise<TestOrderDTO[]> {
  const orderIds = rows.map((o) => o["id"] as string);
  if (!orderIds.length) return [];

  const [{ data: items }, { data: deliveries }, { data: logs }, { data: players }] =
    await Promise.all([
      supabaseAdmin
        .from("order_items")
        .select("order_id, quantity, total_price, product_id")
        .in("order_id", orderIds),
      supabaseAdmin
        .from("deliveries")
        .select("id, order_id, delivery_type, status, attempts, last_error, created_at, delivered_at, payload")
        .in("order_id", orderIds),
      supabaseAdmin
        .from("audit_logs")
        .select("actor_id, target_id, action, created_at")
        .in("target_id", orderIds)
        .eq("action", "TEST_ORDER_CREATED"),
      supabaseAdmin.from("players").select("id, minecraft_username, minecraft_uuid"),
    ]);

  const productIds = [...new Set((items ?? []).map((i) => i.product_id).filter(Boolean))] as string[];
  const productMap = new Map<string, string>();
  if (productIds.length) {
    const { data: products } = await supabaseAdmin
      .from("store_products")
      .select("id, name")
      .in("id", productIds);
    (products ?? []).forEach((p) => productMap.set(p.id, p.name));
  }

  const playerMap = new Map((players ?? []).map((p) => [p.id, p]));
  const emails = await actorEmails((logs ?? []).map((l) => l.actor_id));

  return rows.map((o) => {
    const id = o["id"] as string;
    const playerId = (o["player_id"] as string | null) ?? null;
    const player = playerId ? playerMap.get(playerId) : undefined;
    const delivery = (deliveries ?? []).find((d) => d.order_id === id);
    const log = (logs ?? []).find((l) => l.target_id === id);
    const payload = (delivery?.payload ?? {}) as Record<string, unknown>;

    return {
      id,
      orderNumber: o["order_number"] as string,
      status: o["status"] as string,
      mode: o["mode"] as string,
      currency: o["currency"] as string,
      total: o["total_amount"] === null ? null : Number(o["total_amount"]),
      createdAt: o["created_at"] as string,
      player: {
        id: playerId,
        username: player?.minecraft_username ?? (o["minecraft_username"] as string | null),
        uuid: player?.minecraft_uuid ?? null,
      },
      actorEmail: log?.actor_id ? (emails.get(log.actor_id) ?? null) : null,
      items: (items ?? [])
        .filter((i) => i.order_id === id)
        .map((i) => ({
          name: i.product_id ? (productMap.get(i.product_id) ?? "Produit") : "Produit",
          quantity: i.quantity,
          totalPrice: i.total_price === null ? null : Number(i.total_price),
        })),
      delivery: delivery
        ? {
            id: delivery.id,
            type: delivery.delivery_type,
            status: delivery.status,
            attempts: delivery.attempts,
            lastError: delivery.last_error,
            createdAt: delivery.created_at,
            deliveredAt: delivery.delivered_at,
            preview: String(payload["preview"] ?? ""),
          }
        : null,
    } satisfies TestOrderDTO;
  });
}

export async function loadDashboard(): Promise<TestDashboardDTO> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, status, mode, currency, total_amount, created_at, player_id, minecraft_username")
    .eq("mode", "TEST")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);

  const orders = await mapOrders((data ?? []) as unknown as Record<string, unknown>[]);

  return {
    stats: {
      total: orders.length,
      delivered: orders.filter((o) => o.delivery?.status === "DELIVERED").length,
      failed: orders.filter((o) => o.delivery?.status === "FAILED").length,
      pending: orders.filter((o) => o.delivery && ["PENDING", "PROCESSING"].includes(o.delivery.status))
        .length,
    },
    orders,
  };
}

export async function loadTimeline(orderId: string): Promise<TestTimelineEntryDTO[]> {
  const { data, error } = await supabaseAdmin
    .from("audit_logs")
    .select("action, created_at, actor_id")
    .eq("target_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const emails = await actorEmails((data ?? []).map((l) => l.actor_id));
  return (data ?? []).map((l) => ({
    action: l.action,
    createdAt: l.created_at,
    actorEmail: l.actor_id ? (emails.get(l.actor_id) ?? null) : null,
  }));
}

/* ---------------------------------------------------------------- actions */

async function requireTestOrder(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, status, mode, player_id")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) throw new Error("Commande introuvable.");
  if (data.mode !== "TEST") throw new Error("Cette commande n'est pas une commande TEST.");
  return data;
}

export async function createTestOrder(
  actorId: string,
  input: { playerId: string; productId: string; quantity: number },
) {
  const { data: player, error: playerError } = await supabaseAdmin
    .from("players")
    .select("id, minecraft_username")
    .eq("id", input.playerId)
    .maybeSingle();
  if (playerError || !player) throw new Error("Joueur cible introuvable.");

  const { data: product, error: productError } = await supabaseAdmin
    .from("store_products")
    .select("id, name, type, price, currency, quantity, active")
    .eq("id", input.productId)
    .maybeSingle();
  if (productError || !product || !product.active) throw new Error("Produit introuvable ou inactif.");

  const quantity =
    product.type === "GRADE" ? 1 : Math.min(Math.max(Math.trunc(input.quantity) || 1, 1), 20);
  const unitPrice = product.price === null ? null : Number(product.price);
  const totalPrice = unitPrice === null ? null : unitPrice * quantity;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      player_id: player.id,
      minecraft_username: player.minecraft_username,
      total_amount: totalPrice ?? 0,
      currency: product.currency,
      status: "PENDING",
      mode: "TEST",
    })
    .select("id, order_number")
    .single();
  if (orderError || !order) throw new Error("La commande TEST n'a pas pu être créée.");

  const { error: itemError } = await supabaseAdmin.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    quantity,
    unit_price: unitPrice,
    total_price: totalPrice,
  });
  if (itemError) throw new Error("Les lignes de la commande TEST n'ont pas pu être créées.");

  await logAudit("TEST_ORDER_CREATED", actorId, order.id, {
    order_number: order.order_number,
    player_id: player.id,
    product_id: product.id,
    product_name: product.name,
    quantity,
    total: totalPrice,
    mode: "TEST",
  });

  return { orderId: order.id, orderNumber: order.order_number };
}

export async function simulatePayment(actorId: string, orderId: string) {
  const order = await requireTestOrder(orderId);
  if (order.status !== "PENDING") throw new Error("Le paiement simulé n'est possible qu'en statut En attente.");

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "PAID" })
    .eq("id", orderId)
    .eq("mode", "TEST");
  if (error) throw new Error("Le paiement simulé a échoué.");

  await logAudit("TEST_PAYMENT_SIMULATED", actorId, orderId, {
    order_number: order.order_number,
    provider: "AUCUN — simulation",
  });
  return { ok: true as const };
}

export async function createTestDelivery(actorId: string, orderId: string) {
  const order = await requireTestOrder(orderId);
  if (order.status !== "PAID") throw new Error("Simule d'abord le paiement.");

  const { data: existing } = await supabaseAdmin
    .from("deliveries")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();
  if (existing) throw new Error("Une livraison TEST existe déjà pour cette commande.");

  const { data: item } = await supabaseAdmin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId)
    .maybeSingle();
  if (!item?.product_id) throw new Error("Aucun produit associé à cette commande.");

  const { data: product } = await supabaseAdmin
    .from("store_products")
    .select("id, name, type, quantity")
    .eq("id", item.product_id)
    .maybeSingle();
  if (!product) throw new Error("Produit introuvable.");

  const preview = previewMessage(product, item.quantity);
  const deliveryType = product.type === "GRADE" ? "GRADE" : "AETHER_COINS";

  const { data: delivery, error } = await supabaseAdmin
    .from("deliveries")
    .insert({
      order_id: orderId,
      player_id: order.player_id,
      delivery_type: deliveryType,
      status: "PENDING",
      payload: {
        mode: "TEST",
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        amount: product.type === "GRADE" ? null : (product.quantity ?? 0) * item.quantity,
        preview,
        note: "Simulation — aucune récompense réelle n'est envoyée dans Minecraft.",
      } as never,
    })
    .select("id")
    .single();
  if (error || !delivery) throw new Error("La livraison TEST n'a pas pu être créée.");

  await supabaseAdmin.from("orders").update({ status: "PROCESSING" }).eq("id", orderId).eq("mode", "TEST");

  await logAudit("TEST_DELIVERY_CREATED", actorId, orderId, {
    delivery_id: delivery.id,
    delivery_type: deliveryType,
    preview,
  });

  return { deliveryId: delivery.id, preview };
}

async function requireTestDelivery(deliveryId: string) {
  const { data, error } = await supabaseAdmin
    .from("deliveries")
    .select("id, order_id, status, attempts, delivery_type")
    .eq("id", deliveryId)
    .maybeSingle();
  if (error || !data?.order_id) throw new Error("Livraison introuvable.");
  await requireTestOrder(data.order_id);
  return data;
}

export async function simulateDelivery(actorId: string, deliveryId: string) {
  const delivery = await requireTestDelivery(deliveryId);
  if (delivery.status === "DELIVERED") throw new Error("Cette livraison est déjà terminée.");

  const { error } = await supabaseAdmin
    .from("deliveries")
    .update({ status: "DELIVERED", delivered_at: new Date().toISOString() })
    .eq("id", deliveryId);
  if (error) throw new Error("La simulation de livraison a échoué.");

  await supabaseAdmin
    .from("orders")
    .update({ status: "DELIVERED" })
    .eq("id", delivery.order_id!)
    .eq("mode", "TEST");

  await logAudit("TEST_DELIVERY_COMPLETED", actorId, delivery.order_id, {
    delivery_id: deliveryId,
    note: "Livraison simulée — aucune récompense réelle n'a été envoyée dans Minecraft.",
  });
  return { ok: true as const };
}

export async function failDelivery(actorId: string, deliveryId: string, reason?: string) {
  const delivery = await requireTestDelivery(deliveryId);
  const lastError = (reason?.trim() || "Échec simulé — AetheriaCore injoignable (TEST).").slice(0, 200);

  const { error } = await supabaseAdmin
    .from("deliveries")
    .update({
      status: "FAILED",
      attempts: delivery.attempts + 1,
      last_error: lastError,
      delivered_at: null,
    })
    .eq("id", deliveryId);
  if (error) throw new Error("La simulation d'échec a échoué.");

  await supabaseAdmin
    .from("orders")
    .update({ status: "FAILED" })
    .eq("id", delivery.order_id!)
    .eq("mode", "TEST");

  await logAudit("TEST_DELIVERY_FAILED", actorId, delivery.order_id, {
    delivery_id: deliveryId,
    attempts: delivery.attempts + 1,
    last_error: lastError,
  });
  return { ok: true as const };
}

export async function retryDelivery(actorId: string, deliveryId: string) {
  const delivery = await requireTestDelivery(deliveryId);
  if (delivery.status !== "FAILED") throw new Error("Seule une livraison en échec peut être relancée.");

  const attempts = delivery.attempts + 1;
  const { error } = await supabaseAdmin
    .from("deliveries")
    .update({ status: "PROCESSING", attempts, next_attempt_at: new Date().toISOString() })
    .eq("id", deliveryId);
  if (error) throw new Error("La nouvelle tentative a échoué.");

  await supabaseAdmin
    .from("orders")
    .update({ status: "PROCESSING" })
    .eq("id", delivery.order_id!)
    .eq("mode", "TEST");

  await logAudit("TEST_DELIVERY_RETRY", actorId, delivery.order_id, {
    delivery_id: deliveryId,
    attempts,
  });
  return { ok: true as const };
}
