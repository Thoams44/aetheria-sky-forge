import { presentationFor, type ProductType } from "@/data/products";
import type { OrderConfirmationDTO, ShopProductDTO } from "./shop.functions";
import { createPublicServerClient } from "./supabase-public.server";

const MAX_QUANTITY = 20;

function toProductType(type: string): ProductType {
  return type === "GRADE" ? "grade" : "coins";
}

/** Catalogue public : uniquement les produits actifs, enrichis par leur grade. */
export async function loadShopCatalog(): Promise<ShopProductDTO[]> {
  const supabase = createPublicServerClient();

  const [{ data: products, error: productsError }, { data: grades, error: gradesError }] =
    await Promise.all([
      supabase
        .from("store_products")
        .select("id, name, slug, type, description, price, currency, quantity, grade_id, display_order")
        .eq("active", true)
        .order("display_order"),
      supabase
        .from("grades")
        .select("id, description, price, currency, advantages")
        .eq("active", true),
    ]);

  if (productsError) throw new Error(productsError.message);
  if (gradesError) throw new Error(gradesError.message);

  const gradeById = new Map((grades ?? []).map((g) => [g.id, g]));

  return (products ?? []).map((p) => {
    const type = toProductType(p.type);
    const grade = p.grade_id ? gradeById.get(p.grade_id) : undefined;
    const presentation = presentationFor(p.slug, type);
    const advantages = Array.isArray(grade?.advantages)
      ? (grade?.advantages as unknown[]).filter((a): a is string => typeof a === "string")
      : [];
    const price = p.price ?? grade?.price ?? null;

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      type,
      description: p.description ?? grade?.description ?? presentation.description,
      price: price === null ? null : Number(price),
      currency: p.currency ?? grade?.currency ?? "EUR",
      icon: presentation.icon,
      color: presentation.color,
      advantages: advantages.length ? advantages : type === "grade" ? ["Avantage à définir"] : [],
      active: true,
      displayOrder: p.display_order,
      ...(presentation.badge ? { badge: presentation.badge } : {}),
      ...(p.quantity ? { amount: p.quantity } : {}),
    } satisfies ShopProductDTO;
  });
}

/**
 * Création d'une commande PENDING. Aucun paiement, aucune livraison :
 * les prix et totaux sont recalculés à partir de la base de données.
 */
export async function placeOrder(input: {
  username: string;
  email: string;
  mode?: "TEST";
  lines: { productId: string; quantity: number }[];
}): Promise<OrderConfirmationDTO> {
  const username = input.username?.trim() ?? "";
  const email = input.email?.trim() ?? "";

  if (username.length < 3) throw new Error("Pseudo Minecraft invalide.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Adresse e-mail invalide.");
  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    throw new Error("Ton panier est vide.");
  }

  const catalog = await loadShopCatalog();
  const byId = new Map(catalog.map((p) => [p.id, p]));

  const items = input.lines.map((line) => {
    const product = byId.get(line.productId);
    if (!product) throw new Error("Un produit du panier est introuvable ou désactivé.");
    const requested = Number(line.quantity);
    if (!Number.isInteger(requested) || requested < 1 || requested > MAX_QUANTITY) {
      throw new Error(`Quantité invalide pour ${product.name}.`);
    }
    const quantity = product.type === "grade" ? 1 : requested;
    const unitPrice = product.price;
    return {
      product,
      quantity,
      unitPrice,
      totalPrice: unitPrice === null ? null : unitPrice * quantity,
    };
  });

  const currency = items[0]?.product.currency ?? "EUR";
  const pricesKnown = items.every((i) => i.unitPrice !== null);
  const total = pricesKnown ? items.reduce((sum, i) => sum + (i.totalPrice ?? 0), 0) : null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      minecraft_username: username,
      customer_email: email,
      total_amount: total ?? 0,
      currency,
      status: "PENDING",
      mode: input.mode === "TEST" ? "TEST" : "TEST", // seul le mode TEST est autorisé pour l'instant
    })
    .select("id, order_number, status, mode, currency, total_amount")
    .single();

  if (orderError || !order) {
    throw new Error("La commande n'a pas pu être créée. Réessaie dans un instant.");
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
    throw new Error("Les articles de la commande n'ont pas pu être enregistrés.");
  }

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    mode: order.mode as "TEST" | "REAL",
    currency: order.currency,
    total,
    items: items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
    })),
  };
}
