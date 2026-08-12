/**
 * Catalogue AetheriaSky (données mockées).
 * Structure alignée sur la future table `products` : un simple fetch remplacera
 * `getProducts()` sans toucher aux composants.
 */
export type ProductType = "grade" | "coins";

export type Product = {
  id: string;
  name: string;
  type: ProductType;
  description: string;
  /** null tant que les prix ne sont pas définis. */
  price: number | null;
  currency: "EUR";
  /** Nom d'icône lucide utilisé par l'UI (aucune image générée). */
  icon: string;
  /** Couleur sémantique du produit. */
  color: "info" | "secondary" | "primary" | "premium";
  /** Liste longue d'avantages — sera complétée plus tard. */
  advantages: string[];
  active: boolean;
  displayOrder: number;
  /** Mise en avant type "populaire" / "prestige". */
  badge?: string;
  /** Quantité d'Aether Coins pour les packs. */
  amount?: number;
};

export const products: Product[] = [
  {
    id: "vip",
    name: "VIP",
    type: "grade",
    description: "La première marche du soutien : un peu plus de confort au quotidien sur ton île.",
    price: null,
    currency: "EUR",
    icon: "Sparkles",
    color: "info",
    advantages: ["Avantage à définir", "Avantage à définir", "Avantage à définir"],
    active: true,
    displayOrder: 1,
  },
  {
    id: "mvp",
    name: "MVP",
    type: "grade",
    description: "Un cran au-dessus, pour les joueurs qui s'installent durablement dans l'Aether.",
    price: null,
    currency: "EUR",
    icon: "Gem",
    color: "secondary",
    advantages: ["Avantage à définir", "Avantage à définir", "Avantage à définir"],
    active: true,
    displayOrder: 2,
  },
  {
    id: "elite",
    name: "ELITE",
    type: "grade",
    description: "Le grade des bâtisseurs confirmés, pensé pour les îles ambitieuses.",
    price: null,
    currency: "EUR",
    icon: "Crown",
    color: "primary",
    advantages: ["Avantage à définir", "Avantage à définir", "Avantage à définir"],
    active: true,
    displayOrder: 3,
    badge: "Populaire",
  },
  {
    id: "ultime",
    name: "ULTIME",
    type: "grade",
    description: "Le grade le plus prestigieux d'AetheriaSky. Le sommet du soutien au serveur.",
    price: null,
    currency: "EUR",
    icon: "Crown",
    color: "premium",
    advantages: ["Avantage à définir", "Avantage à définir", "Avantage à définir"],
    active: true,
    displayOrder: 4,
    badge: "Prestige",
  },
  {
    id: "coins-500",
    name: "500 Aether Coins",
    type: "coins",
    amount: 500,
    description: "Pack de démarrage, crédité sur ton compte Minecraft.",
    price: null,
    currency: "EUR",
    icon: "Coins",
    color: "premium",
    advantages: [],
    active: true,
    displayOrder: 10,
  },
  {
    id: "coins-1000",
    name: "1 000 Aether Coins",
    type: "coins",
    amount: 1000,
    description: "Le pack le plus courant pour équiper son île.",
    price: null,
    currency: "EUR",
    icon: "Coins",
    color: "premium",
    advantages: [],
    active: true,
    displayOrder: 11,
  },
  {
    id: "coins-2500",
    name: "2 500 Aether Coins",
    type: "coins",
    amount: 2500,
    description: "Pour les joueurs réguliers qui visent le haut du classement.",
    price: null,
    currency: "EUR",
    icon: "Coins",
    color: "premium",
    advantages: [],
    active: true,
    displayOrder: 12,
    badge: "Populaire",
  },
  {
    id: "coins-5000",
    name: "5 000 Aether Coins",
    type: "coins",
    amount: 5000,
    description: "Le plus grand pack disponible sur la boutique AetheriaSky.",
    price: null,
    currency: "EUR",
    icon: "Coins",
    color: "premium",
    advantages: [],
    active: true,
    displayOrder: 13,
  },
];

export function getProducts(type?: ProductType) {
  return products
    .filter((p) => p.active && (!type || p.type === type))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id && p.active);
}

/** Aucun prix n'est défini : libellé unique et centralisé. */
export function formatPrice(product: Pick<Product, "price" | "currency">) {
  if (product.price === null) return "Prix à définir";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: product.currency,
  }).format(product.price);
}
