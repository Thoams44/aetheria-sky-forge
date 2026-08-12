import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { AccountCurrencies } from "@/components/account/AccountCurrencies";
import { AccountGradeCard } from "@/components/account/AccountGradeCard";
import { AccountOrders } from "@/components/account/AccountOrders";
import { AccountProfileHeader } from "@/components/account/AccountProfileHeader";
import { AccountRewards } from "@/components/account/AccountRewards";
import { AccountStats } from "@/components/account/AccountStats";
import { AccountVerification } from "@/components/account/AccountVerification";
import { AccountVotes } from "@/components/account/AccountVotes";
import { demoAccount } from "@/data/account";

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

function ComptePage() {
  const account = demoAccount;

  return (
    <>
      <PageHeader
        eyebrow="Espace joueur"
        title="Mon compte"
        description="Retrouve ton grade, tes monnaies, tes votes, tes statistiques et tes achats. Les données affichées sont fictives : la liaison sécurisée avec ton compte Minecraft arrivera plus tard."
      />
      <Section>
        <AccountProfileHeader account={account} />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_2fr]">
          <AccountGradeCard grade={account.grade} />
          <AccountCurrencies
            aetherCoins={account.aetherCoins}
            shards={account.shards}
          />
        </div>

        <div className="mt-6">
          <AccountVotes
            monthlyVotes={account.monthlyVotes}
            totalVotes={account.totalVotes}
            shards={account.shards}
          />
        </div>

        <div className="mt-6">
          <AccountStats stats={account.stats} />
        </div>

        <div className="mt-6">
          <AccountOrders />
        </div>

        <div className="mt-6">
          <AccountRewards rewards={account.rewards} />
        </div>

        <div className="mt-6">
          <AccountVerification security={account.security} />
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Données de démonstration. Aucune authentification réelle n'est active.
        </p>
      </Section>
    </>
  );
}
