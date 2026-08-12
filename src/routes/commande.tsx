import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Info, Lock, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { AetherButton } from "@/components/aether/AetherButton";
import { ProductIcon } from "@/components/shop/ProductIcon";
import { AetherPaymentForm } from "@/components/shop/AetherPaymentForm";
import { PaymentTestModeBanner } from "@/components/shop/PaymentTestModeBanner";
import { formatAmount, formatPrice } from "@/data/products";
import { startStripeCheckout } from "@/lib/backend/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { useCart } from "@/lib/cart";

const title = "Paiement sécurisé — AetheriaSky";
const description =
  "Récapitulatif de commande et paiement sécurisé, directement sur AetheriaSky : grades et Aether Coins crédités sur ton compte Minecraft.";

export const Route = createFileRoute("/commande")({
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
  component: CommandePage,
});

function CommandePage() {
  const { detailed, count, lines, total, currency } = useCart();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const startCheckout = useServerFn(startStripeCheckout);

  const checkout = useMutation({
    mutationFn: async () => {
      const result = await startCheckout({
        data: {
          username: username.trim(),
          email: email.trim(),
          returnUrl: `${window.location.origin}/paiement?session_id={CHECKOUT_SESSION_ID}`,
          environment: getStripeEnvironment(),
          lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        },
      });
      if ("error" in result) throw new Error(result.error);
      return result;
    },
  });

  const session = checkout.data;
  const errorMessage =
    checkout.error instanceof Error
      ? checkout.error.message
      : checkout.isError
        ? "Le paiement n'a pas pu être initialisé."
        : null;

  return (
    <>
      <PageHeader
        eyebrow="Commande"
        title={session ? "Paiement sécurisé" : "Finaliser ma commande"}
        description={
          session
            ? "Renseigne ton moyen de paiement ci-dessous. Tu restes sur AetheriaSky pendant toute l'opération."
            : "Renseigne ton pseudo Minecraft et ton e-mail, puis règle ta commande sans quitter le site."
        }
      />
      <Section>
        <div className="mb-6">
          <PaymentTestModeBanner />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {session ? (
            <div className="aether-surface rounded-3xl p-7 sm:p-9">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl text-foreground">Paiement sécurisé</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <Lock size={12} className="text-secondary" />
                  Commande {session.orderNumber}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Les informations de carte sont saisies directement dans les
                composants de paiement sécurisés : AetheriaSky ne les reçoit ni
                ne les conserve jamais.
              </p>
              <div className="mt-7">
                <AetherPaymentForm clientSecret={session.clientSecret} />
              </div>
              <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-info" />
                Ta commande ne sera marquée comme payée qu'après confirmation
                officielle du paiement. La livraison en jeu reste une étape
                distincte.
              </p>
            </div>
          ) : (
            <form
              className="aether-surface rounded-3xl p-7 sm:p-9"
              onSubmit={(e) => {
                e.preventDefault();
                if (count === 0 || checkout.isPending) return;
                checkout.mutate();
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
                Le pseudo saisi ici permet de rattacher la commande à ton compte
                Minecraft lors de la livraison.
              </p>

              <AetherButton
                type="submit"
                className="mt-8 w-full"
                disabled={count === 0 || checkout.isPending}
              >
                {checkout.isPending
                  ? "Préparation du paiement…"
                  : total === null
                    ? "Passer au paiement"
                    : `Payer ${formatAmount(total, currency)}`}
              </AetherButton>

              {count === 0 && (
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
            </form>
          )}

          <aside className="aether-surface h-fit rounded-3xl p-7 lg:sticky lg:top-24">
            <h2 className="font-display text-xl text-foreground">Récapitulatif de la commande</h2>
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
                        ×{line.quantity} — {formatPrice(product)} l'unité
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-foreground">
                      {product.price === null
                        ? "—"
                        : formatAmount(product.price * line.quantity, product.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex justify-between border-t border-border pt-5 text-sm text-muted-foreground">
              <span>Sous-total</span>
              <span>{total === null ? "Prix à définir" : formatAmount(total, currency)}</span>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="font-semibold text-foreground">Total ({currency})</span>
              <span className="font-display text-lg text-foreground">
                {total === null ? "Prix à définir" : formatAmount(total, currency)}
              </span>
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-info" />
              Les prix et le total sont toujours recalculés côté serveur à partir
              de la boutique officielle.
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
