import { createFileRoute } from "@tanstack/react-router";
import { Coins, Gem, Gift, History, ShieldCheck, Sparkles, Trophy, Vote } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { demoPlayer } from "@/data/player";

const title = "Mon compte — Espace joueur AetheriaSky";
const description =
  "Ton espace joueur AetheriaSky : grade, Aether Coins, votes, progression des paliers, statistiques et historique.";

export const Route = createFileRoute("/compte")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ComptePage,
});

const cards = [
  { icon: Sparkles, label: "Grade", value: demoPlayer.grade },
  { icon: Coins, label: "Aether Coins", value: demoPlayer.coins },
  { icon: Gem, label: "Éclats", value: demoPlayer.shards },
  { icon: Vote, label: "Votes du mois", value: demoPlayer.monthlyVotes },
  { icon: Vote, label: "Votes au total", value: demoPlayer.votes },
  { icon: Trophy, label: "Niveau d'île", value: demoPlayer.islandLevel },
];

function ComptePage() {
  return (
    <>
      <PageHeader
        eyebrow="Espace joueur"
        title="Mon compte"
        description="Aperçu de l'espace joueur. La liaison sécurisée avec ton compte Minecraft sera mise en place lors de la prochaine étape."
      />
      <Section>
        <div className="aether-surface flex flex-col gap-6 rounded-3xl p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-aether)] font-display text-xl text-primary-foreground">
              {demoPlayer.username.slice(0, 1)}
            </span>
            <div>
              <p className="font-display text-xl text-foreground">{demoPlayer.username}</p>
              <p className="font-mono text-xs text-muted-foreground">{demoPlayer.uuid}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-xs text-muted-foreground">
            <ShieldCheck size={14} className="text-info" /> Vérification Minecraft à venir
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="aether-surface lift rounded-2xl p-5">
              <Icon size={17} className="text-secondary" />
              <p className="mt-4 text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-1.5 font-display text-lg text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="aether-surface rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Progression des paliers</h2>
            <div className="mt-5 space-y-4">
              {demoPlayer.tiers.map((tier) => (
                <div key={tier.label}>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{tier.label}</span>
                    <span>{tier.percent}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-accent/60">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-aether)]"
                      style={{ width: `${tier.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="aether-surface rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <History size={16} className="text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Historique</h2>
            </div>
            <ul className="mt-5 divide-y divide-border">
              {demoPlayer.history.map((item) => (
                <li key={item.label} className="flex justify-between py-3 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground">{item.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="aether-surface mt-6 rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <Gift size={16} className="text-secondary" />
            <h2 className="text-lg font-semibold text-foreground">Récompenses</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {demoPlayer.rewards.map((reward) => (
              <div key={reward.label} className="rounded-xl border border-border p-4">
                <p className="text-sm text-foreground">{reward.label}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {reward.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Données de démonstration. Aucune authentification réelle n'est active.
        </p>
      </Section>
    </>
  );
}