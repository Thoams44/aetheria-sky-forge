/**
 * Espace joueur AetheriaSky — libellés et helpers de présentation.
 * Toutes les valeurs affichées proviennent désormais du backend.
 */

export type OrderStatusKey =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "DELIVERED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export const orderStatusLabel: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En traitement",
  DELIVERED: "Livrée",
  FAILED: "Échec",
  REFUNDED: "Remboursée",
  CANCELLED: "Annulée",
};

export const orderStatusTone: Record<string, string> = {
  PENDING: "border-premium/40 bg-premium/10 text-premium",
  PAID: "border-secondary/40 bg-secondary/10 text-secondary",
  PROCESSING: "border-info/40 bg-info/10 text-info",
  DELIVERED: "border-success/40 bg-success/10 text-success",
  FAILED: "border-destructive/40 bg-destructive/10 text-destructive",
  REFUNDED: "border-border bg-accent/50 text-muted-foreground",
  CANCELLED: "border-destructive/40 bg-destructive/10 text-destructive",
};

/** Statuts de livraison (table `deliveries`). */
export const deliveryStatusLabel: Record<string, string> = {
  PENDING: "En attente",
  PROCESSING: "En cours",
  DELIVERED: "Livrée",
  FAILED: "Échec",
};

export const deliveryStatusTone: Record<string, string> = {
  PENDING: "border-secondary/40 bg-secondary/10 text-secondary",
  PROCESSING: "border-info/40 bg-info/10 text-info",
  DELIVERED: "border-success/40 bg-success/10 text-success",
  FAILED: "border-destructive/40 bg-destructive/10 text-destructive",
};

export const SOON = "Disponible prochainement";

export function formatAmount(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatPrice(amount: number | null, currency: string): string {
  if (amount == null) return "Prix à définir";
  return `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency === "EUR" ? "€" : currency}`;
}
