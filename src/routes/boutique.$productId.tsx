import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductIcon } from "@/components/shop/ProductIcon";
import { formatPrice, getProduct } from "@/data/products";

export const Route = createFileRoute("/boutique/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Produit indisponible — AetheriaSky" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = `${loaderData.product.name} — Boutique AetheriaSky`;
    const d = loaderData.product.description;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();

  return (
    <>
      <PageHeader
        eyebrow={product.type === "grade" ? "Grade" : "Aether Coins"}
        title={product.name}
        description={product.description}
      />
      <Section>
        <Link
          to="/boutique"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} /> Retour à la boutique
        </Link>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="aether-surface rounded-3xl p-7 sm:p-9">
            <div className="flex items-center gap-4">
              <ProductIcon product={product} className="h-14 w-14" size={24} />
              <div>
                <h2 className="font-display text-2xl tracking-[0.12em] text-foreground">
                  {product.name}
                </h2>
                {product.badge && (
                  <span className="mt-1 inline-block rounded-full border border-border px-3 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            <h3 className="mt-9 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
              Avantages
            </h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {(product.advantages.length ? product.advantages : ["Contenu à définir"]).map(
                (a, i) => (
                  <li
                    key={`${product.id}-detail-${i}`}
                    className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm text-muted-foreground"
                  >
                    <Check size={15} className="mt-0.5 shrink-0 text-secondary" />
                    {a}
                  </li>
                ),
              )}
            </ul>
            <p className="mt-6 text-xs text-muted-foreground">
              La liste complète des avantages sera publiée ici dès qu'elle sera
              définie.
            </p>
          </div>

          <aside className="aether-surface h-fit rounded-3xl p-7 lg:sticky lg:top-24">
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
              Tarif
            </p>
            <p className="mt-2 font-display text-2xl text-foreground">
              {formatPrice(product)}
            </p>
            <AddToCartButton product={product} className="mt-6 w-full" />
            <Link
              to="/panier"
              className="mt-3 flex h-11 items-center justify-center rounded-full border border-border text-xs font-semibold text-foreground transition-colors hover:border-secondary/45"
            >
              Voir mon panier
            </Link>
            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-info" />
              Livraison en jeu automatique une fois le serveur relié à la
              boutique. Aucun paiement n'est actif pour le moment.
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
