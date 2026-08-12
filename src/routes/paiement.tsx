import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Clock, PackageSearch, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { AetherButton } from "@/components/aether/AetherButton";
import { formatAmount } from "@/data/products";
import { getStripeCheckoutStatus } from "@/lib/backend/checkout.functions";
import { useCart } from "@/lib/cart";

const title = "Confirmation de commande — AetheriaSky";
const description =
  "Suivi de ta commande AetheriaSky : statut du paiement, contenu acheté et livraison de tes grades ou Aether Coins.";

const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "En attente de confirmation", tone: "text-premium" },
  PAID: { label: "Paiement confirmé", tone: "text-info" },
  PROCESSING: { label: "En cours de traitement", tone: "text-info" },
  DELIVERED: { label: "Livrée", tone: "text-info" },
  FAILED: { label: "Paiement échoué", tone: "text-destructive" },
  REFUNDED: { label: "Remboursée", tone: "text-muted-foreground" },
  CANCELLED: { label: "Annulée", tone: "text-muted-foreground" },
};

const DELIVERY_STATUS: Record<string, string> = {
  PENDING: "En attente",
  PROCESSING: "En cours",
  DELIVERED: "Livrée",
  FAILED: "Échec",
};

const DELIVERY_TYPE: Record<string, string> = {
  GRADE: "Grade",
  AETHER_COINS: "Aether Coins",
  SHARDS: "Éclats",
  VOTE_KEY: "Clé de vote",
  CUSTOM: "Récompense",
};

export const Route = createFileRoute("/paiement")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaiementPage,
});

function PaiementPage() {
  const { session_id: sessionId } = Route.useSearch();
  const { clear } = useCart();
  const fetchStatus = useServerFn(getStripeCheckoutStatus);

  const statusQuery = useQuery({
    queryKey: ["checkout-status", sessionId],
    enabled: Boolean(sessionId),
    queryFn: () => fetchStatus({ data: { sessionId: sessionId! } }),
    // Le webhook peut arriver une seconde après le retour du joueur.
    refetchInterval: (query) =>
      query.state.data && query.state.data.status !== "PENDING" ? false : 2500,
  });

  const order = statusQuery.data;
  const paid = order ? order.status !== "PENDING" && order.status !== "FAILED" && order.status !== "CANCELLED" : false;

  useEffect(() => {
    if (paid) clear();
  }, [paid, clear]);

  return (
    <>
      <PageHeader
        eyebrow="Commande"
        title={paid ? "Merci pour ton soutien" : "Suivi de ta commande"}
        description={
          paid
            ? "Ton paiement est confirmé. Tes récompenses sont préparées pour ton compte Minecraft."
            : "Nous confirmons ton paiement auprès de notre système de facturation."
        }
      />
      <Section>
        <div className="mx-auto max-w-2xl">
          {!sessionId ? (
            <EmptyState
              icon={<PackageSearch size={20} className="text-muted-foreground" />}
              title="Aucune commande à afficher"
              text="Le lien de confirmation semble incomplet."
            />
          ) : statusQuery.isLoading ? (
            <EmptyState
              icon={<Clock size={20} className="text-premium" />}
              title="Vérification en cours…"
              text="Nous récupérons le statut officiel de ta commande."
            />
          ) : !order ? (
            <EmptyState
              icon={<PackageSearch size={20} className="text-muted-foreground" />}
              title="Commande introuvable"
              text="Cette commande n'existe pas ou n'est plus disponible."
            />
          ) : (
            <div className="aether-surface rise-in rounded-3xl p-7 sm:p-9">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-background/60">
                  {order.status === "FAILED" || order.status === "CANCELLED" ? (
                    <XCircle size={20} className="text-destructive" />
                  ) : paid ? (
                    <CheckCircle2 size={20} className="text-info" />
                  ) : (
                    <Clock size={20} className="text-premium" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-xl text-foreground">
                    Commande {order.orderNumber}
                  </p>
                  <p className={`mt-1 text-sm ${ORDER_STATUS[order.status]?.tone ?? "text-muted-foreground"}`}>
                    {ORDER_STATUS[order.status]?.label ?? order.status}
                  </p>
                </div>
              </div>

              <ul className="mt-7 divide-y divide-border border-y border-border">
                {order.items.map((item, index) => (
                  <li key={index} className="flex items-center justify-between gap-4 py-3">
                    <span className="min-w-0 truncate text-sm text-foreground">
                      {item.name}
                      <span className="text-muted-foreground"> ×{item.quantity}</span>
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {formatAmount(item.totalPrice, order.currency)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total réglé</span>
                <span className="font-display text-lg text-foreground">
                  {formatAmount(order.total, order.currency)}
                </span>
              </div>

              <div className="mt-7 rounded-2xl border border-border bg-background/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Livraison en jeu
                </p>
                {order.deliveries.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    La livraison sera préparée dès la confirmation du paiement.
                  </p>
                ) : (
                  <ul className="mt-3 grid gap-2">
                    {order.deliveries.map((delivery, index) => (
                      <li key={index} className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-foreground">
                          {DELIVERY_TYPE[delivery.type] ?? delivery.type}
                        </span>
                        <span className="text-muted-foreground">
                          {DELIVERY_STATUS[delivery.status] ?? delivery.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <AetherButton asChild>
                  <Link to="/compte">Voir mon compte</Link>
                </AetherButton>
                <AetherButton asChild variant="ghost">
                  <Link to="/boutique">Retour à la boutique</Link>
                </AetherButton>
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="aether-surface rounded-3xl p-9 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-border bg-background/60">
        {icon}
      </span>
      <p className="mt-4 font-display text-lg text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      <div className="mt-7">
        <AetherButton asChild variant="ghost">
          <Link to="/boutique">Retour à la boutique</Link>
        </AetherButton>
      </div>
    </div>
  );
}
