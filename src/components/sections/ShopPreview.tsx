import { Link } from "@tanstack/react-router";
import { Coins, Sparkles } from "lucide-react";
import islandImage from "@/assets/island-crystal.jpg";
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
            La monnaie premium d'AetheriaSky. Elle se dépense en jeu, à ton
            rythme : cosmétiques, clés, extensions d'île et récompenses
            saisonnières.
          </p>
          <Link
            to="/boutique"
            className="mt-7 inline-flex h-11 items-center rounded-full border border-border px-6 text-xs font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/45"
          >
            Découvrir la boutique
          </Link>
        </div>
        <img
          src={islandImage}
          alt="Île flottante avec cristal d'Aether"
          loading="lazy"
          width={1024}
          height={768}
          className="float-slow mx-auto w-full max-w-sm rounded-2xl"
        />
      </div>
    </Section>
  );
}