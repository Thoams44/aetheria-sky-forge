import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Crown, Gem, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { GradeCard } from "@/components/shop/GradeCard";
import { CoinPackCard } from "@/components/shop/CoinPackCard";
import { getProducts } from "@/data/products";

const title = "Boutique — Grades & Aether Coins | AetheriaSky";
const description =
  "La boutique AetheriaSky : grades VIP, MVP, ELITE et ULTIME, et packs d'Aether Coins, la monnaie premium du serveur SkyBlock français.";

export const Route = createFileRoute("/boutique/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: BoutiquePage,
});

function BoutiquePage() {
  const grades = getProducts("grade");
  const packs = getProducts("coins");

  return (
    <>
      <PageHeader
        eyebrow="Boutique"
        title="Soutiens le serveur, garde l'avantage juste"
        description="Les grades apportent du confort et des cosmétiques, jamais un déséquilibre. Les Aether Coins se dépensent en jeu."
      />

      <Section className="py-14 sm:py-16">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#grades"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface/60 px-5 text-xs font-semibold text-foreground transition-colors hover:border-secondary/45"
          >
            <Crown size={14} className="text-secondary" /> Grades
          </a>
          <a
            href="#aether-coins"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface/60 px-5 text-xs font-semibold text-foreground transition-colors hover:border-premium/45"
          >
            <Coins size={14} className="text-premium" /> Aether Coins
          </a>
          <Link
            to="/panier"
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-xs font-semibold text-foreground transition-colors hover:border-secondary/45"
          >
            <ShoppingCart size={14} /> Mon panier
          </Link>
        </div>
      </Section>

      <Section id="grades" className="pt-0">
        <div className="flex items-center gap-3">
          <Crown size={18} className="text-secondary" />
          <h2 className="font-display text-2xl text-foreground">Grades</h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Quatre paliers de soutien, du VIP au grade le plus prestigieux du
          serveur. Les avantages détaillés de chaque grade seront publiés
          prochainement.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {grades.map((product) => (
            <GradeCard key={product.id} product={product} />
          ))}
        </div>
      </Section>

      <Section id="aether-coins" className="border-t border-border bg-surface/30">
        <div className="flex items-center gap-3">
          <Coins size={18} className="text-premium" />
          <h2 className="font-display text-2xl text-foreground">Aether Coins</h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          La monnaie premium d'AetheriaSky : achetée ici, créditée sur ton compte
          Minecraft, puis dépensée directement en jeu.
        </p>
        <p className="mt-3 flex max-w-2xl items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Gem size={14} className="mt-0.5 shrink-0 text-info" />
          À ne pas confondre avec les Éclats, la monnaie gratuite obtenue grâce
          aux paliers de vote.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {packs.map((product) => (
            <CoinPackCard key={product.id} product={product} />
          ))}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          Aucun paiement n'est actif : les tarifs et les avantages seront
          renseignés avant l'ouverture de la boutique.
        </p>
      </Section>
    </>
  );
}
