import { Link } from "@tanstack/react-router";
import { Coins, Gem, Sparkles } from "lucide-react";
import { Section, SectionHeading } from "@/components/aether/Section";
import { grades } from "@/data/shop";
import { cn } from "@/lib/utils";

const accentRing: Record<string, string> = {
  info: "text-info",
  secondary: "text-secondary",
  primary: "text-primary",
  premium: "text-premium",
};

export function ShopPreview() {
  return (
    <Section id="boutique" className="border-y border-border bg-surface/30">
      <SectionHeading
        eyebrow="Boutique"
        title="Grades & Aether Coins"
        description="Quatre grades pour marquer ton soutien, et une monnaie premium à dépenser directement en jeu. Ouverture prochaine."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {grades.map((grade) => (
          <article
            key={grade.id}
            className={cn(
              "aether-surface lift relative rounded-2xl p-6",
              grade.highlight && "border-secondary/35",
            )}
          >
            {grade.highlight && (
              <span className="absolute -top-2.5 left-6 rounded-full bg-[image:var(--gradient-aether)] px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-primary-foreground">
                Populaire
              </span>
            )}
            <Sparkles size={16} className={accentRing[grade.accent]} />
            <h3 className="mt-4 font-display text-xl tracking-[0.14em] text-foreground">
              {grade.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{grade.price}</p>
            <ul className="mt-5 space-y-2 border-t border-border pt-5">
              {grade.perks.map((perk) => (
                <li key={perk} className="text-xs leading-relaxed text-muted-foreground">
                  {perk}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="aether-surface mt-6 grid items-center gap-8 overflow-hidden rounded-3xl p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-premium/12 text-premium">
            <Coins size={19} />
          </span>
          <h3 className="mt-5 font-display text-2xl text-foreground">Aether Coins</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            La monnaie premium d'AetheriaSky, achetée sur la boutique du site
            puis dépensée en jeu : clés, cosmétiques, récompenses et contenus de
            la boutique Minecraft.
          </p>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
            À ne pas confondre avec les <span className="text-info">Éclats</span>,
            la monnaie gratuite obtenue grâce aux votes.
          </p>
          <Link
            to="/boutique"
            className="mt-7 inline-flex h-11 items-center rounded-full border border-border px-6 text-xs font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/45"
          >
            Découvrir la boutique
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-premium/25 bg-premium/8 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-premium/15 text-premium">
              <Coins size={16} />
            </span>
            <p className="mt-3 font-display text-base text-foreground">Aether Coins</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Monnaie premium — achetée sur le site, dépensée en jeu.
            </p>
          </div>
          <div className="rounded-2xl border border-info/25 bg-info/8 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/15 text-info">
              <Gem size={16} />
            </span>
            <p className="mt-3 font-display text-base text-foreground">Éclats</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Monnaie gratuite — obtenue via les paliers de vote.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}