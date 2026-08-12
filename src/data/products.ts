/**
 * Modèle produit de la boutique AetheriaSky.
 * Les données (nom, prix, devise, avantages, quantité, statut) proviennent du
 * backend (`store_products` / `grades`). Ce fichier ne contient plus que le
 * type partagé et l'habillage visuel (icône, couleur, texte d'ambiance),
 * afin de conserver exactement le design validé.
 */
export type ProductType = "grade" | "coins";

export type ProductColor = "info" | "secondary" | "primary" | "premium";

export type Product = {
  /** Identifiant backend (store_products.id). */
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  description: string;
  /** null tant que le prix n'est pas défini côté backend. */
  price: number | null;
  currency: string;
  icon: string;
  color: ProductColor;
  advantages: string[];
  active: boolean;
  displayOrder: number;
  badge?: string;
  /** Quantité d'Aether Coins pour les packs. */
  amount?: number;
  /** Quantité de base (hors bonus). */
  baseAmount?: number;
  /** Bonus offert en Aether Coins. */
  bonusAmount?: number;
};

type Presentation = {
  description: string;
  icon: string;
  color: ProductColor;
  badge?: string;
};

/** Habillage éditorial par slug de produit (aucune donnée commerciale ici). */
export const productPresentation: Record<string, Presentation> = {
  "grade-vip": {
    description:
      "La première marche du soutien : un peu plus de confort au quotidien sur ton île.",
    icon: "Sparkles",
    color: "info",
  },
  "grade-mvp": {
    description:
      "Un cran au-dessus, pour les joueurs qui s'installent durablement dans l'Aether.",
    icon: "Gem",
    color: "secondary",
  },
  "grade-elite": {
    description: "Le grade des bâtisseurs confirmés, pensé pour les îles ambitieuses.",
    icon: "Crown",
    color: "primary",
    badge: "Populaire",
  },
  "grade-ultime": {
    description:
      "Le grade le plus prestigieux d'AetheriaSky. Le sommet du soutien au serveur.",
    icon: "Crown",
    color: "premium",
    badge: "Prestige",
  },
  "coins-500": {
    description: "Pack de démarrage, crédité sur ton compte Minecraft.",
    icon: "Coins",
    color: "premium",
  },
  "coins-1000": {
    description: "Le pack le plus courant pour équiper son île.",
    icon: "Coins",
    color: "premium",
  },
  "coins-2500": {
    description: "Pour les joueurs réguliers qui visent le haut du classement.",
    icon: "Coins",
    color: "premium",
    badge: "Populaire",
  },
  "coins-5000": {
    description: "Le plus grand pack disponible sur la boutique AetheriaSky.",
    icon: "Coins",
    color: "premium",
  },
  "coins-12000": {
    description: "Un très gros pack pour les îles les plus ambitieuses.",
    icon: "Coins",
    color: "premium",
  },
  "coins-20000": {
    description: "Le pack ultime d'AetheriaSky, avec le plus gros bonus offert.",
    icon: "Coins",
    color: "premium",
    badge: "Prestige",
  },
};

export function presentationFor(slug: string, type: ProductType): Presentation {
  return (
    productPresentation[slug] ?? {
      description:
        type === "grade"
          ? "Description à définir."
          : "Pack d'Aether Coins crédité sur ton compte Minecraft.",
      icon: type === "grade" ? "Crown" : "Coins",
      color: type === "grade" ? "secondary" : "premium",
    }
  );
}

/** Libellé de prix : "Prix à définir" tant qu'aucun tarif n'est renseigné. */
export function formatPrice(product: Pick<Product, "price" | "currency">) {
  if (product.price === null || product.price === undefined) return "Prix à définir";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: product.currency || "EUR",
  }).format(product.price);
}

export function formatAmount(value: number | null | undefined, currency = "EUR") {
  if (value === null || value === undefined) return "Prix à définir";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);
}
