import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, FlaskConical, Info, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { AetherButton } from "@/components/aether/AetherButton";
import { ProductIcon } from "@/components/shop/ProductIcon";
import { formatAmount, formatPrice } from "@/data/products";
import { createShopOrder } from "@/lib/backend/shop.functions";
import { useCart } from "@/lib/cart";

const title = "Finaliser ma commande — AetheriaSky";
const description =
  "Dernière étape avant validation : renseigne ton pseudo Minecraft et ton e-mail pour recevoir ta commande AetheriaSky.";

export const Route = createFileRoute("/commande")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommandePage,
});

function CommandePage() {
  const { detailed, count, lines, total, currency, clear } = useCart();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const submitOrder = useServerFn(createShopOrder);

  const order = useMutation({
    mutationFn: () =>
      submitOrder({
        data: {
          username: username.trim(),
          email: email.trim(),
          mode: "TEST" as const,
          lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        },
      }),
    onSuccess: () => clear(),
  });

  const confirmation = order.data;
  const errorMessage =
    order.error instanceof Error
      ? order.error.message
      : order.isError
        ? "La commande n'a pas pu être créée."
        : null;

  return (
    <>
      <PageHeader
        eyebrow="Commande"
        title="Finaliser ma commande"
        description="Interface de démonstration : aucune donnée n'est enregistrée et aucun paiement n'est demandé."
      />
      <Section>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <form
            className="aether-surface rounded-3xl p-7 sm:p-9"
            onSubmit={(e) => {
              e.preventDefault();
              if (count === 0 || order.isPending) return;
              order.mutate();
            }}
          >
            <h2 className="font-display text-xl text-foreground">Informations de livraison</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ta commande sera créditée directement sur ton compte Minecraft.
            </p>

            <div className="mt-7 grid gap-5">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Pseudo Minecraft
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nyxeril"
                  autoComplete="off"
                  className="h-12 rounded-xl border border-border bg-background/60 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-secondary/50"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  E-mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="toi@exemple.fr"
                  autoComplete="email"
                  className="h-12 rounded-xl border border-border bg-background/60 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-secondary/50"
                />
              </label>
            </div>

            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info size={14} className="mt-0.5 shrink-0 text-info" />
              Le pseudo saisi ici ne vaut pas authentification. La vérification
              du compte Minecraft sera ajoutée avant l'ouverture des paiements.
            </p>

            <p className="mt-6 flex items-start gap-2 rounded-xl border border-premium/30 bg-premium/8 p-4 text-xs leading-relaxed text-muted-foreground">
              <FlaskConical size={14} className="mt-0.5 shrink-0 text-premium" />
              Mode TEST : la commande est enregistrée en attente, sans aucun
              paiement, sans banque et sans livraison en jeu.
            </p>

            <AetherButton
              type="submit"
              className="mt-8 w-full"
              disabled={count === 0 || order.isPending}
            >
              {order.isPending ? "Création de la commande…" : "Valider ma commande (TEST)"}
            </AetherButton>

            {count === 0 && !confirmation && (
              <p className="mt-4 text-xs text-muted-foreground">
                Ton panier est vide :{" "}
                <Link to="/boutique" className="text-secondary hover:underline">
                  ajoute un produit
                </Link>{" "}
                avant de finaliser.
              </p>
            )}

            {errorMessage && (
              <p className="rise-in mt-5 flex items-start gap-2 rounded-xl border border-destructive/35 bg-destructive/8 p-4 text-sm text-foreground">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
                {errorMessage}
              </p>
            )}

            {confirmation && (
              <div className="rise-in mt-5 rounded-xl border border-secondary/30 bg-secondary/8 p-4 text-sm text-foreground">
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-secondary" />
                  Commande {confirmation.orderNumber} créée — statut{" "}
                  {confirmation.status} ({confirmation.mode}).
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Aucun paiement n'a été effectué et aucune livraison n'est
                  déclenchée. Total calculé côté serveur :{" "}
                  {confirmation.total === null
                    ? "Prix à définir"
                    : formatAmount(confirmation.total, confirmation.currency)}
                  .
                </p>
              </div>
            )}
          </form>

          <aside className="aether-surface h-fit rounded-3xl p-7 lg:sticky lg:top-24">
            <h2 className="font-display text-xl text-foreground">Ma sélection</h2>
            {detailed.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Aucun article.{" "}
                <Link to="/boutique" className="text-secondary hover:underline">
                  Retour à la boutique
                </Link>
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-border">
                {detailed.map(({ line, product }) => (
                  <li key={product.id} className="flex items-center gap-3 py-3">
                    <ProductIcon product={product} className="h-9 w-9" size={15} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ×{line.quantity} — {formatPrice(product)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex justify-between border-t border-border pt-5 text-sm">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-display text-lg text-foreground">
                {total === null ? "Prix à définir" : formatAmount(total, currency)}
              </span>
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-info" />
              Paiement sécurisé à venir. Cette page prépare simplement le futur
              tunnel de commande.
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
