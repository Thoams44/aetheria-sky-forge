import { Coins, Lock } from "lucide-react";
import { Section, SectionHeading } from "@/components/aether/Section";
import { votePlatforms, voteProgress, voteTiers } from "@/data/vote";

export function VoteSection() {
  const percent = Math.round((voteProgress.current / voteProgress.goal) * 100);

  return (
    <Section id="vote" className="border-y border-border bg-surface/30">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Vote"
            title="Soutiens AetheriaSky"
            description="Voter prend dix secondes et fait remonter le serveur dans les classements. Chaque vote rapporte une Clé de Vote en jeu, et les paliers atteints versent des Aether Coins."
          />
          <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {votePlatforms.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Toutes les {p.cooldownHours}h
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-accent/50 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Lock size={11} /> Bientôt
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="aether-surface aether-glow rounded-3xl p-7 sm:p-9">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Cagnotte communautaire</p>
              <p className="mt-2 font-display text-4xl text-foreground">
                {voteProgress.current}
                <span className="text-muted-foreground"> / {voteProgress.goal}</span>
              </p>
              <p className="text-xs text-muted-foreground">votes ce mois-ci</p>
            </div>
            <span className="rounded-full border border-premium/40 bg-premium/10 px-3 py-1 text-xs font-semibold text-premium">
              {percent}%
            </span>
          </div>

          <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-accent/60">
            <div
              className="h-full rounded-full bg-[image:var(--gradient-aether)] transition-[width] duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-background/50 px-4 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-premium/12 text-premium">
              <Coins size={18} />
            </span>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                Prochaine récompense — Aether Coins
              </p>
              <p className="font-display text-lg text-foreground">
                {voteProgress.nextReward}
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-2">
            {voteTiers.map((tier) => {
              const reached = voteProgress.current >= tier.votes;
              return (
                <li
                  key={tier.votes}
                  className="flex items-center justify-between text-sm"
                >
                  <span
                    className={`flex items-center gap-2 ${reached ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    <Coins size={13} className="text-premium" />
                    {tier.votes} votes — {tier.reward}
                  </span>
                  <span
                    className={`text-xs font-semibold ${reached ? "text-success" : "text-muted-foreground"}`}
                  >
                    {reached ? "Débloqué" : "À venir"}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            Chaque vote validé donne 1 Clé de Vote en jeu. Les paliers, eux,
            sont récompensés en Aether Coins (AC). Plateformes de vote à venir.
          </p>
        </div>
      </div>
    </Section>
  );
}