import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";

const title = "Règlement — AetheriaSky";
const description =
  "Le règlement officiel du serveur Minecraft AetheriaSky : respect, jeu équitable, îles et sanctions.";

const rules = [
  {
    title: "Respect avant tout",
    body: "Insultes, harcèlement, propos discriminatoires ou provocation gratuite entraînent une sanction immédiate, en jeu comme sur Discord.",
  },
  {
    title: "Jeu équitable",
    body: "Tout client modifié apportant un avantage (x-ray, autoclick sur événements, macros de combat) est interdit. Les mods visuels et de performance restent autorisés.",
  },
  {
    title: "Îles et coopération",
    body: "Le vol au sein d'une île se règle entre membres : choisis tes coéquipiers avec soin. Le staff n'intervient pas dans les litiges internes.",
  },
  {
    title: "Économie",
    body: "L'exploitation d'un bug économique doit être signalée. Profiter d'une faille entraîne la remise à zéro des gains concernés.",
  },
  {
    title: "Publicité",
    body: "La promotion d'autres serveurs, en jeu ou en messages privés, est interdite.",
  },
  {
    title: "Sanctions",
    body: "Avertissement, mute, kick, ban temporaire puis définitif. Toute sanction peut être contestée sur le Discord officiel.",
  },
];

export const Route = createFileRoute("/reglement")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ReglementPage,
});

function ReglementPage() {
  return (
    <>
      <PageHeader
        eyebrow="Règlement"
        title="Les règles d'Aetheria"
        description="Un cadre simple, appliqué avec constance, pour que le serveur reste agréable pour tout le monde."
      />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((rule, i) => (
            <article key={rule.title} className="aether-surface lift rounded-2xl p-6">
              <p className="font-display text-sm text-secondary">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">{rule.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {rule.body}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          Mentions légales, CGV, politique de confidentialité et page contact
          seront publiées ici prochainement.
        </p>
      </Section>
    </>
  );
}