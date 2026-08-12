import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { ProductIcon } from "@/components/shop/ProductIcon";
import { formatPrice } from "@/data/products";
import { useCart } from "@/lib/cart";

const title = "Mon panier — Boutique AetheriaSky";
const description =
  "Retrouve les grades et packs d'Aether Coins ajoutés à ton panier avant de finaliser ta commande sur AetheriaSky.";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanierPage,
});

function PanierPage() {
  const { detailed, count, remove, setQuantity, clear } = useCart();
  const hasPrices = detailed.some((d) => d.product.price !== null);

  return (
    <>
      <PageHeader
        eyebrow="Panier"
        title="Mon panier"
        description="Vérifie ta sélection avant de passer à l'étape suivante. Aucun paiement n'est encore actif."
      />
      <Section>
        {detailed.length === 0 ? (
          <div className="aether-surface flex flex-col items-center rounded-3xl px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/50 text-muted-foreground">
              <ShoppingCart size={22} />
            </span>
            <p className="mt-5 font-display text-xl text-foreground">
              Ton panier est vide
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Ajoute un grade ou un pack d'Aether Coins depuis la boutique pour
              le retrouver ici.
            </p>
            <Link
              to="/boutique"
              className="mt-7 inline-flex h-11 items-center rounded-full bg-[image:var(--gradient-aether)] px-7 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5"
            >
              Aller à la boutique
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="aether-surface rounded-3xl p-6 sm:p-7">
              <ul className="divide-y divide-border">
                {detailed.map(({ line, product }) => (
                  <li key={product.id} className="flex flex-wrap items-center gap-4 py-5">
                    <ProductIcon product={product} className="h-11 w-11" size={18} />
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/boutique/$productId"
                        params={{ productId: product.id }}
                        className="font-display text-lg text-foreground transition-colors hover:text-secondary"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {product.type === "grade" ? "Grade" : "Aether Coins"} —{" "}
                        {formatPrice(product)}
                      </p>
                    </div>

                    {product.type === "coins" ? (
                      <div className="flex items-center gap-1 rounded-full border border-border p-1">
                        <button
                          type="button"
                          aria-label={`Réduire la quantité de ${product.name}`}
                          onClick={() => setQuantity(product.id, line.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-7 text-center text-sm text-foreground">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Augmenter la quantité de ${product.name}`}
                          onClick={() => setQuantity(product.id, line.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    ) : (
                      <span className="rounded-full border border-border px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                        Unique
                      </span>
                    )}

                    <button
                      type="button"
                      aria-label={`Retirer ${product.name} du panier`}
                      onClick={() => remove(product.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
                <Link
                  to="/boutique"
                  className="inline-flex h-10 items-center rounded-full border border-border px-5 text-xs font-semibold text-foreground transition-colors hover:border-secondary/45"
                >
                  Continuer mes achats
                </Link>
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
                >
                  Vider le panier
                </button>
              </div>
            </div>

            <aside className="aether-surface h-fit rounded-3xl p-7 lg:sticky lg:top-24">
              <h2 className="font-display text-xl text-foreground">Récapitulatif</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Articles</dt>
                  <dd className="text-foreground">{count}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Sous-total</dt>
                  <dd className="text-foreground">
                    {hasPrices ? "—" : "Prix à définir"}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-muted-foreground">
                  <dt className="font-semibold text-foreground">Total</dt>
                  <dd className="font-display text-lg text-foreground">
                    Prix à définir
                  </dd>
                </div>
              </dl>
              <Link
                to="/commande"
                className="mt-7 flex h-12 items-center justify-center rounded-full bg-[image:var(--gradient-aether)] text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5"
              >
                Finaliser ma commande
              </Link>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Les tarifs seront affichés dès qu'ils seront définis. Aucun
                paiement n'est traité à cette étape.
              </p>
            </aside>
          </div>
        )}
      </Section>
    </>
  );
}
