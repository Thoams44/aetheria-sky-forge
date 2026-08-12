import { createFileRoute } from "@tanstack/react-router";
import { Coins } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { coinPacks, grades } from "@/data/shop";
import { cn } from "@/lib/utils";

const title = "Boutique — Grades & Aether Coins | AetheriaSky";
const description =
  "Découvre les grades VIP, MVP, ELITE et ULTIME d'AetheriaSky ainsi que les Aether Coins, la monnaie premium du serveur SkyBlock.";

export const Route = createFileRoute("/boutique")({
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
  return (
    <>
      <PageHeader
        eyebrow="Boutique"
        title="Soutiens le serveur, garde l'avantage juste"
        description="Les grades apportent du confort et des cosmétiques, jamais un déséquilibre. La boutique ouvrira très prochainement."
      />
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {grades.map((grade) => (
            <article
              key={grade.id}
              className={cn(
                "aether-surface lift rounded-2xl p-6",
                grade.highlight && "border-secondary/35",
              )}
            >
              <h2 className="font-display text-xl tracking-[0.14em] text-foreground">
                {grade.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{grade.price}</p>
              <ul className="mt-5 space-y-2 border-t border-border pt-5">
                {grade.perks.map((perk) => (
                  <li key={perk} className="text-xs leading-relaxed text-muted-foreground">
                    {perk}
                  </li>
                ))}
              </ul>
              <span className="mt-6 flex h-10 items-center justify-center rounded-full border border-border text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Bientôt disponible
              </span>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <div className="flex items-center gap-3">
            <Coins size={18} className="text-premium" />
            <h2 className="font-display text-2xl text-foreground">Aether Coins</h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Une monnaie premium créditée sur ton compte, dépensable en jeu quand
            tu le souhaites.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {coinPacks.map((pack) => (
              <article key={pack.id} className="aether-surface lift rounded-2xl p-6">
                <p className="font-display text-lg text-foreground">{pack.amount}</p>
                <p className="mt-1 text-sm text-muted-foreground">{pack.price}</p>
                {pack.bonus && (
                  <p className="mt-3 inline-block rounded-full bg-premium/12 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-premium">
                    {pack.bonus}
                  </p>
                )}
              </article>
            ))}
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Aucun paiement n'est actif pour le moment : cette page est une
            présentation de la future boutique.
          </p>
        </div>
      </Section>
    </>
  );
}