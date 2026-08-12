import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/layout/PageShell";
import { Section } from "@/components/aether/Section";
import { AccountSignIn } from "@/components/account/AccountSignIn";
import { TestsForbidden, TestsPanel } from "@/components/admin/TestsPanel";
import { getTestAccess } from "@/lib/backend/admin-tests.functions";
import { supabase } from "@/integrations/supabase/client";

const title = "Tests boutique — Administration AetheriaSky";
const description =
  "Espace privé FONDATEUR / ADMIN pour tester la chaîne boutique AetheriaSky en mode TEST, sans paiement réel ni récompense Minecraft.";

export const Route = createFileRoute("/admin/tests")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminTestsPage,
  errorComponent: () => (
    <Section>
      <p className="text-sm text-muted-foreground">
        Impossible de charger l'espace de tests pour le moment.
      </p>
    </Section>
  ),
});

function AdminTestsPage() {
  const [authState, setAuthState] = useState<"loading" | "in" | "out">("loading");

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

  const accessFn = useServerFn(getTestAccess);
  const accessQuery = useQuery({
    queryKey: ["admin-tests-access"],
    queryFn: () => accessFn(),
    enabled: authState === "in",
    retry: false,
  });

  const header = (
    <PageHeader
      eyebrow="Administration"
      title="🧪 Tests boutique AetheriaSky"
      description="Parcours complet en mode TEST : commande, paiement simulé, livraison, échec, nouvelle tentative, historique et audit. Réservé aux rôles FONDATEUR et ADMIN."
    />
  );

  let body: React.ReactNode;
  if (authState === "loading") {
    body = <p className="text-sm text-muted-foreground">Chargement…</p>;
  } else if (authState === "out") {
    body = <AccountSignIn onSignedIn={() => setAuthState("in")} />;
  } else if (accessQuery.isLoading) {
    body = <p className="text-sm text-muted-foreground">Vérification des permissions…</p>;
  } else if (accessQuery.isError || !accessQuery.data?.allowed) {
    body = <TestsForbidden />;
  } else {
    body = <TestsPanel />;
  }

  return (
    <>
      {header}
      <Section>{body}</Section>
    </>
  );
}
