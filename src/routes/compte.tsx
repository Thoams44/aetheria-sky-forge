import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { AccountCurrencies } from "@/components/account/AccountCurrencies";
import { AccountGradeCard } from "@/components/account/AccountGradeCard";
import { AccountOrders } from "@/components/account/AccountOrders";
import { AccountProfileHeader } from "@/components/account/AccountProfileHeader";
import { AccountRewards } from "@/components/account/AccountRewards";
import { AccountSignIn } from "@/components/account/AccountSignIn";
import { AccountStats } from "@/components/account/AccountStats";
import { AccountVerification } from "@/components/account/AccountVerification";
import { AccountVotes } from "@/components/account/AccountVotes";
import { getMyAccount, linkMinecraftUsername } from "@/lib/backend/account.functions";
import { supabase } from "@/integrations/supabase/client";

const title = "Mon compte — Espace joueur AetheriaSky";
const description =
  "Ton espace joueur AetheriaSky : grade, Aether Coins, Éclats, votes, paliers, commandes et récompenses.";

export const Route = createFileRoute("/compte")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ComptePage,
  errorComponent: () => (
    <Section>
      <p className="text-sm text-muted-foreground">
        Impossible de charger l'espace joueur pour le moment. Réessaie dans un instant.
      </p>
    </Section>
  ),
});

function ComptePage() {
  const [authState, setAuthState] = useState<"loading" | "in" | "out">("loading");
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAuthState(data.session ? "in" : "out");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? "in" : "out");
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const fetchAccount = useServerFn(getMyAccount);
  const linkFn = useServerFn(linkMinecraftUsername);

  const accountQuery = useQuery({
    queryKey: ["my-account"],
    queryFn: () => fetchAccount(),
    enabled: authState === "in",
    retry: false,
  });

  const linkMutation = useMutation({
    mutationFn: (username: string) => linkFn({ data: { username } }),
    onSuccess: (res) => {
      if (res?.ok) queryClient.invalidateQueries({ queryKey: ["my-account"] });
    },
  });

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ["my-account"] });
  }, [queryClient]);

  const header = (
    <PageHeader
      eyebrow="Espace joueur"
      title="Mon compte"
      description="Retrouve ton grade, tes monnaies, tes votes, tes statistiques et tes achats. Les données proviennent de ton profil AetheriaSky."
    />
  );

  if (authState !== "in") {
    return (
      <>
        {header}
        <Section>
          {authState === "loading" ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : (
            <AccountSignIn onSignedIn={() => setAuthState("in")} />
          )}
        </Section>
      </>
    );
  }

  if (accountQuery.isLoading) {
    return (
      <>
        {header}
        <Section>
          <p className="text-sm text-muted-foreground">Chargement de tes données…</p>
        </Section>
      </>
    );
  }

  if (accountQuery.isError || !accountQuery.data) {
    return (
      <>
        {header}
        <Section>
          <p className="text-sm text-muted-foreground">
            Impossible de charger tes données pour le moment. Réessaie dans un instant.
          </p>
        </Section>
      </>
    );
  }

  const account = accountQuery.data;
  const linkResult = linkMutation.data;
  const linkError =
    linkResult && !linkResult.ok
      ? (linkResult.message ?? "Enregistrement impossible.")
      : linkMutation.isError
        ? "Enregistrement impossible."
        : null;

  return (
    <>
      {header}
      <Section>
        {!account.linked && (
          <div className="mb-6 rounded-2xl border border-secondary/30 bg-secondary/5 p-5 text-sm text-muted-foreground">
            Aucun profil joueur n'est encore lié à ce compte. Renseigne ton pseudo Minecraft
            dans la section « Vérification Minecraft » ci-dessous.
          </div>
        )}

        <AccountProfileHeader account={account} />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_2fr]">
          <AccountGradeCard grade={account.grade} />
          <AccountCurrencies
            aetherCoins={account.aetherCoins}
            shards={account.shards}
          />
        </div>

        <div className="mt-6">
          <AccountVotes votes={account.votes} />
        </div>

        <div className="mt-6">
          <AccountStats totalVotes={account.linked ? account.votes.total : null} />
        </div>

        <div className="mt-6">
          <AccountOrders orders={account.orders} />
        </div>

        <div className="mt-6">
          <AccountRewards rewards={account.rewards} />
        </div>

        <div className="mt-6">
          <AccountVerification
            account={account}
            onLink={(username) => linkMutation.mutate(username)}
            onSignOut={signOut}
            linking={linkMutation.isPending}
            linkError={linkError}
          />
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Les statistiques Minecraft et la vérification en jeu seront connectées via
          AetheriaCore lors d'une prochaine étape.
        </p>
      </Section>
    </>
  );
}
