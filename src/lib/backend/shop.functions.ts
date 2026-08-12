import { createServerFn } from "@tanstack/react-start";

/**
 * Boutique AetheriaSky — lectures publiques du catalogue et création de
 * commandes. Les prix sont TOUJOURS relus côté serveur : le navigateur
 * n'envoie que des identifiants de produits et des quantités.
 */

export type ShopProductDTO = {
  id: string;
  slug: string;
  name: string;
  type: "grade" | "coins";
  description: string;
  price: number | null;
  currency: string;
  icon: string;
  color: "info" | "secondary" | "primary" | "premium";
  advantages: string[];
  active: boolean;
  displayOrder: number;
  badge?: string;
  amount?: number;
  baseAmount?: number;
  bonusAmount?: number;
};

export type OrderConfirmationDTO = {
  id: string;
  orderNumber: string;
  status: string;
  mode: "TEST" | "REAL";
  currency: string;
  total: number | null;
  items: { name: string; quantity: number; unitPrice: number | null; totalPrice: number | null }[];
};

export const getShopCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { loadShopCatalog } = await import("./shop.server");
  return loadShopCatalog();
});

export const createShopOrder = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      username: string;
      email: string;
      mode?: "TEST";
      lines: { productId: string; quantity: number }[];
    }) => input,
  )
  .handler(async ({ data }) => {
    const { placeOrder } = await import("./shop.server");
    return placeOrder(data);
  });
