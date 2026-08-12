import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageShell";
import { VoteSection } from "@/components/sections/VoteSection";

const title = "Vote — Soutiens AetheriaSky";
const description =
  "Vote pour AetheriaSky sur les plateformes partenaires, débloque des paliers de récompenses communautaires et grimpe au classement des Top Voteurs.";

export const Route = createFileRoute("/vote")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: VotePage,
});

function VotePage() {
  return (
    <>
      <PageHeader
        eyebrow="Vote"
        title="Chaque vote fait monter l'île"
        description="Les votes sont gratuits et récompensés. Le système de détection automatique arrive avec la prochaine mise à jour du site."
      />
      <VoteSection />
    </>
  );
}