import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/Hero";
import { Adventure } from "@/components/sections/Adventure";
import { VoteSection } from "@/components/sections/VoteSection";
import { LeaderboardsSection } from "@/components/sections/LeaderboardsSection";
import { ShopPreview } from "@/components/sections/ShopPreview";
import { SupportersSection } from "@/components/sections/SupportersSection";

const title = "AetheriaSky — Serveur Minecraft SkyBlock premium";
const description =
  "Rejoins AetheriaSky, un SkyBlock français premium : îles évolutives, économie équilibrée, quêtes, événements et classements. IP : play.aetheriasky.fr";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Adventure />
      <VoteSection />
      <LeaderboardsSection />
      <ShopPreview />
      <SupportersSection />
    </>
  );
}
