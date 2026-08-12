import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageShell";
import { LeaderboardsSection } from "@/components/sections/LeaderboardsSection";

const title = "Classements — Top joueurs et îles | AetheriaSky";
const description =
  "Consulte les classements AetheriaSky : top joueurs, top îles et top voteurs du serveur Minecraft SkyBlock.";

export const Route = createFileRoute("/classements")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ClassementsPage,
});

function ClassementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hall d'honneur"
        title="Classements du royaume"
        description="Mis à jour en direct depuis le serveur dès que la passerelle AetheriaCore sera branchée."
      />
      <LeaderboardsSection />
    </>
  );
}