import type Stripe from "stripe";
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "@/lib/stripe.server";
import { loadShopCatalog } from "./shop.server";

/**
 * Paiement réel (Stripe Sandbox pendant cette phase).
 *
 * Règles non négociables :
 * - le total est TOUJOURS recalculé à partir de `store_products` ;
 * - aucune donnée bancaire ne transite par notre serveur (formulaire Stripe) ;
 * - une commande ne passe à PAID que via le webhook signé par Stripe ;
 * - les livraisons ne sont créées qu'une seule fois (idempotence).
 */

export type CheckoutLine = { productId: string; quantity: number };

export type CheckoutStartResult =
  | { clientSecret: string; sessionId: string; orderNumber: string }
  | { error: string };

export type CheckoutStatusItem = {
  name: string;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
};

export type CheckoutStatusDeliveryDTO = {
  type: string;
  status: string;
};

export type CheckoutStatusDTO = {
  orderNumber: string;
  status: string;
  mode: string;
  currency: string;
  total: number;
  paidAt: string | null;
  items: CheckoutStatusItem[];
  deliveries: CheckoutStatusDeliveryDTO[];
};

const MAX_QUANTITY = 20;
const ZERO_DECIMAL = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);

function toMinorUnit(amount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? Math.round(amount) : Math.round(amount * 100);
}

function fromMinorUnit(amount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? amount : amount / 100;
}

async function audit(action: string, metadata: Record<string, unknown>, targetId?: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("audit_logs").insert({
    action,
    target_id: targetId ?? null,
    metadata: metadata as never,
  });
}

/** Résout le joueur à partir du pseudo Minecraft (jamais fourni comme identifiant de confiance). */
async function findPlayerId(username: string): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("players")
    .select("id")
    .ilike("minecraft_username", username)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Crée la commande REAL (PENDING) puis la session de paiement intégrée au site.
 * Le navigateur n'envoie que des identifiants de produits et des quantités.
 */
export async function startCheckout(input: {
  username: string;
  email: string;
  lines: CheckoutLine[];
  returnUrl: string;
  environment: StripeEnv;
  userId?: string | undefined;
}): Promise<CheckoutStartResult> {
  const username = input.username?.trim() ?? "";
  const email = input.email?.trim() ?? "";

  if (username.length < 3) return { error: "Pseudo Minecraft invalide." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Adresse e-mail invalide." };
  if (!Array.isArray(input.lines) || input.lines.length === 0) return { error: "Ton panier est vide." };

  // Prix et produits relus en base : le prix envoyé par le navigateur est ignoré.
  const catalog = await loadShopCatalog();
  const byId = new Map(catalog.map((p) => [p.id, p]));

  const items: {
    product: (typeof catalog)[number];
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[] = [];

  for (const line of input.lines) {
    const product = byId.get(line.productId);
    if (!product) return { error: "Un produit du panier est introuvable ou désactivé." };
    const requested = Number(line.quantity);
    if (!Number.isInteger(requested) || requested < 1 || requested > MAX_QUANTITY) {
      return { error: `Quantité invalide pour ${product.name}.` };
    }
    if (product.price === null) {
      return {
        error: `Le prix de « ${product.name} » n'est pas encore défini : ce produit ne peut pas être payé pour le moment.`,
      };
    }
    const quantity = product.type === "grade" ? 1 : requested;
    items.push({
      product,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
    });
  }

  const currency = items[0]?.product.currency ?? "EUR";
  if (items.some((i) => i.product.currency !== currency)) {
    return { error: "Les produits du panier utilisent des devises différentes." };
  }
  const total = items.reduce((sum, i) => sum + i.totalPrice, 0);
  if (total <= 0) return { error: "Le montant de la commande est invalide." };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const playerId = await findPlayerId(username);

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      player_id: playerId,
      minecraft_username: username,
      customer_email: email,
      total_amount: total,
      currency,
      status: "PENDING",
      mode: "REAL",
      payment_provider: "stripe",
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { error: "La commande n'a pas pu être créée. Réessaie dans un instant." };
  }

  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      total_price: i.totalPrice,
    })),
  );

  if (itemsError) {
    await supabaseAdmin.from("orders").update({ status: "CANCELLED" }).eq("id", order.id);
    return { error: "Les articles de la commande n'ont pas pu être enregistrés." };
  }

  try {
    const stripe = createStripeClient(input.environment);

    const baseParams = {
      mode: "payment" as const,
      ui_mode: "embedded_page" as const,
      return_url: input.returnUrl,
      customer_email: email,
      line_items: items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: toMinorUnit(i.unitPrice, currency),
          // Biens numériques (grades, monnaie virtuelle) : code de taxe adapté.
          product_data: { name: i.product.name, tax_code: "txcd_10000000" },
        },
      })),
      payment_intent_data: {
        description: `AetheriaSky ${order.order_number}`,
        // Aucune donnée bancaire ici : uniquement des identifiants internes.
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
          ...(playerId ? { player_id: playerId } : {}),
        },
      },
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        ...(playerId ? { player_id: playerId } : {}),
        ...(input.userId ? { userId: input.userId } : {}),
      },
    };

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        ...baseParams,
        managed_payments: { enabled: true },
      } as Stripe.Checkout.SessionCreateParams);
    } catch {
      try {
        // Repli : calcul et collecte de la TVA uniquement.
        session = await stripe.checkout.sessions.create({
          ...baseParams,
          automatic_tax: { enabled: true },
        } as Stripe.Checkout.SessionCreateParams);
      } catch {
        // Dernier repli : paiement simple, TVA gérée manuellement.
        session = await stripe.checkout.sessions.create(
          baseParams as Stripe.Checkout.SessionCreateParams,
        );
      }
    }

    await supabaseAdmin
      .from("orders")
      .update({
        stripe_session_id: session.id,
        payment_reference: session.id,
        ...(typeof session.payment_intent === "string"
          ? { stripe_payment_intent_id: session.payment_intent }
          : {}),
      })
      .eq("id", order.id);

    await audit(
      "STRIPE_PAYMENT_INTENT_CREATED",
      {
        order_number: order.order_number,
        session_id: session.id,
        amount: total,
        currency,
        environment: input.environment,
      },
      order.id,
    );

    return {
      clientSecret: session.client_secret ?? "",
      sessionId: session.id,
      orderNumber: order.order_number,
    };
  } catch (error) {
    await supabaseAdmin.from("orders").update({ status: "FAILED" }).eq("id", order.id);
    return { error: getStripeErrorMessage(error) };
  }
}

/** Statut officiel de la commande, lu dans NOTRE base (jamais depuis le navigateur). */
export async function getCheckoutStatus(sessionId: string): Promise<CheckoutStatusDTO | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, status, mode, currency, total_amount, paid_at")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (!order) return null;

  const [{ data: items }, { data: deliveries }] = await Promise.all([
    supabaseAdmin
      .from("order_items")
      .select("quantity, unit_price, total_price, store_products(name)")
      .eq("order_id", order.id),
    supabaseAdmin.from("deliveries").select("delivery_type, status").eq("order_id", order.id),
  ]);

  return {
    orderNumber: order.order_number,
    status: order.status,
    mode: order.mode,
    currency: order.currency,
    total: Number(order.total_amount ?? 0),
    paidAt: order.paid_at,
    items: (items ?? []).map((i) => ({
      name: (i.store_products as { name?: string } | null)?.name ?? "Produit",
      quantity: i.quantity,
      unitPrice: i.unit_price === null ? null : Number(i.unit_price),
      totalPrice: i.total_price === null ? null : Number(i.total_price),
    })),
    deliveries: (deliveries ?? []).map((d) => ({ type: d.delivery_type, status: d.status })),
  };
}

/** Crée les livraisons (une seule fois) — aucune récompense n'est envoyée à Minecraft. */
async function createDeliveries(orderId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("quantity, store_products(name, type, quantity, grade_id)")
    .eq("order_id", orderId);

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("player_id, minecraft_username")
    .eq("id", orderId)
    .maybeSingle();

  let grade: { name: string; gradeId: string | null } | null = null;
  let coins = 0;

  for (const item of items ?? []) {
    const product = item.store_products as
      | { name: string; type: string; quantity: number | null; grade_id: string | null }
      | null;
    if (!product) continue;
    if (product.type === "GRADE") {
      grade = { name: product.name, gradeId: product.grade_id };
    } else {
      coins += (product.quantity ?? 0) * item.quantity;
    }
  }

  const rows: {
    order_id: string;
    player_id: string | null;
    delivery_type: "GRADE" | "AETHER_COINS";
    payload: Record<string, unknown>;
  }[] = [];

  if (grade) {
    rows.push({
      order_id: orderId,
      player_id: order?.player_id ?? null,
      delivery_type: "GRADE",
      payload: {
        grade_name: grade.name,
        grade_id: grade.gradeId,
        minecraft_username: order?.minecraft_username ?? null,
      },
    });
  }
  if (coins > 0) {
    rows.push({
      order_id: orderId,
      player_id: order?.player_id ?? null,
      delivery_type: "AETHER_COINS",
      payload: {
        amount: coins,
        minecraft_username: order?.minecraft_username ?? null,
      },
    });
  }

  for (const row of rows) {
    // L'index unique (order_id, delivery_type) empêche tout doublon.
    const { error } = await supabaseAdmin.from("deliveries").insert({ ...row, payload: row.payload as never });
    if (!error) {
      await audit("DELIVERY_CREATED", { delivery_type: row.delivery_type }, orderId);
    }
  }
}

/** Passage PENDING -> PAID, strictement idempotent. Appelé uniquement par le webhook vérifié. */
export async function markOrderPaid(params: {
  orderId?: string | null;
  sessionId?: string | null;
  paymentIntentId?: string | null;
  amountMinor?: number | null;
  currency?: string | null;
  environment: StripeEnv;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const query = supabaseAdmin
    .from("orders")
    .select("id, order_number, status, mode, currency, total_amount, stripe_payment_intent_id");

  const { data: order } = params.orderId
    ? await query.eq("id", params.orderId).maybeSingle()
    : await query.eq("stripe_session_id", params.sessionId ?? "").maybeSingle();

  if (!order) {
    console.error("[payments] Commande introuvable pour ce paiement.");
    return;
  }
  if (order.mode !== "REAL") {
    console.error("[payments] Commande TEST ignorée par le webhook Stripe.");
    return;
  }

  // Contrôles montant / devise avant toute écriture.
  if (params.amountMinor != null && params.currency) {
    const expected = Number(order.total_amount ?? 0);
    const received = fromMinorUnit(params.amountMinor, params.currency);
    if (Math.abs(expected - received) > 0.009 || order.currency.toLowerCase() !== params.currency.toLowerCase()) {
      await audit(
        "STRIPE_PAYMENT_FAILED",
        { reason: "amount_mismatch", expected, received, currency: params.currency },
        order.id,
      );
      return;
    }
  }

  if (order.status !== "PENDING") {
    // Déjà traité : on s'assure seulement que les livraisons existent.
    if (order.status === "PAID" || order.status === "PROCESSING" || order.status === "DELIVERED") {
      await createDeliveries(order.id);
    }
    return;
  }

  const { data: updated } = await supabaseAdmin
    .from("orders")
    .update({
      status: "PAID",
      paid_at: new Date().toISOString(),
      ...(params.paymentIntentId ? { stripe_payment_intent_id: params.paymentIntentId } : {}),
    })
    .eq("id", order.id)
    .eq("status", "PENDING")
    .select("id")
    .maybeSingle();

  // Une seule exécution gagne la transition : les autres livraisons ne sont pas recréées.
  if (!updated) return;

  await audit(
    "STRIPE_PAYMENT_CONFIRMED",
    {
      order_number: order.order_number,
      payment_intent_id: params.paymentIntentId ?? null,
      environment: params.environment,
    },
    order.id,
  );
  await audit("ORDER_PAID", { order_number: order.order_number }, order.id);

  await createDeliveries(order.id);
}

/** Paiement refusé / échoué : la commande ne devient jamais PAID et aucune livraison n'est créée. */
export async function markOrderFailed(params: {
  orderId?: string | null;
  sessionId?: string | null;
  reason?: string | null;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const query = supabaseAdmin.from("orders").select("id, order_number, status, mode");
  const { data: order } = params.orderId
    ? await query.eq("id", params.orderId).maybeSingle()
    : await query.eq("stripe_session_id", params.sessionId ?? "").maybeSingle();

  if (!order || order.mode !== "REAL" || order.status !== "PENDING") return;

  await supabaseAdmin.from("orders").update({ status: "FAILED" }).eq("id", order.id).eq("status", "PENDING");
  await audit("STRIPE_PAYMENT_FAILED", { order_number: order.order_number, reason: params.reason ?? null }, order.id);
}
