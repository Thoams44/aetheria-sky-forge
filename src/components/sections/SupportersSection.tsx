import { Coins, Sparkles } from "lucide-react";
import { Section, SectionHeading } from "@/components/aether/Section";
import { recentSupporters } from "@/data/supporters";

export function SupportersSection() {
  return (
    <Section id="soutiens">
      <SectionHeading
        eyebrow="Derniers soutiens"
        title="Ils soutiennent AetheriaSky"
        description="Merci aux joueurs qui font vivre le serveur. Les derniers achats confirmés apparaîtront ici automatiquement."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentSupporters.map((s) => {
          const isCoins = s.kind === "coins";
          const Icon = isCoins ? Coins : Sparkles;
          return (
            <article
              key={s.id}
              className="aether-surface lift flex items-center gap-4 rounded-2xl p-5"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isCoins ? "bg-premium/12 text-premium" : "bg-secondary/12 text-secondary"
                }`}
              >
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-lg tracking-[0.08em] text-foreground">
                  ✦ {s.username}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  A soutenu le serveur — {s.item}
                </p>
              </div>
              <span className="ml-auto shrink-0 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                {s.date}
              </span>
            </article>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Données de démonstration — aucune information personnelle ni montant n'est affiché.
      </p>
    </Section>
  );
}