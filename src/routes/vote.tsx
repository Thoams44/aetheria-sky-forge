import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/layout/PageShell";
import { Section, SectionHeading } from "@/components/aether/Section";
import { VotePlatformCard } from "@/components/vote/VotePlatformCard";
import { VoteTierList } from "@/components/vote/VoteTierList";
import { TopVoters } from "@/components/vote/TopVoters";
import { VoteHistory } from "@/components/vote/VoteHistory";
import { VoteIdentityForm } from "@/components/vote/VoteIdentity";
import { VotePlayerCard } from "@/components/vote/VotePlayerCard";
import {
  claimVoteMilestone,
  getMyVoteProfile,
  getVotePageData,
  getVoteProfile,
  startVote,
  type VoteProfileDTO,
  type VotePlatformDTO,
  type VoteTierDTO,
} from "@/lib/backend/vote.functions";
import { supabase } from "@/integrations/supabase/client";

const title = "Vote pour AetheriaSky — Gagne des Aether Coins";
const description =
  "Vote pour AetheriaSky sur les plateformes partenaires : 1 Clé de Vote par vote confirmé, des Aether Coins à chaque palier réclamé et une place au classement des meilleurs voteurs.";

export const Route = createFileRoute("/vote")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => getVotePageData(),
  errorComponent: ({ error }) => (
    <p role="alert" className="px-6 py-20 text-center text-sm text-muted-foreground">
      Impossible de charger les données de vote : {error.message}
    </p>
  ),
  notFoundComponent: () => (
    <p className="px-6 py-20 text-center text-sm text-muted-foreground">
      Page introuvable.
    </p>
  ),
  component: VotePage,
});

function VotePage() {
  const loaderData = Route.useLoaderData();
  const platforms = loaderData?.platforms ?? [];
  const publicTiers = loaderData?.tiers ?? [];
  const topVoters = loaderData?.topVoters ?? [];

  const fetchProfile = useServerFn(getVoteProfile);
  const fetchMyProfile = useServerFn(getMyVoteProfile);
  const openVote = useServerFn(startVote);
  const claim = useServerFn(claimVoteMilestone);

  const [profile, setProfile] = useState<VoteProfileDTO | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Profil du joueur connecté (réclamation des paliers autorisée).
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active || !data.session) return;
      fetchMyProfile()
        .then((result) => {
          if (active && result?.found) setProfile(result);
        })
        .catch(() => undefined);
    });
    return () => {
      active = false;
    };
  }, [fetchMyProfile]);

  const lookup = useMutation({
    mutationFn: (username: string) => fetchProfile({ data: { username } }),
    onSuccess: (data) => setProfile(data),
  });

  const refresh = async () => {
    if (!profile?.found) return;
    const next = profile.owned
      ? await fetchMyProfile()
      : await fetchProfile({ data: { username: profile.username } });
    setProfile(next);
  };

  const voteMutation = useMutation({
    mutationFn: (platform: VotePlatformDTO) =>
      openVote({
        data: { username: profile?.username ?? "", platformId: platform.id },
      }),
    onSuccess: (result) => {
      if (result.ok && result.voteUrl) {
        setNotice(
          "Page de vote ouverte. La récompense sera créditée dès que la plateforme aura confirmé votre vote.",
        );
        window.open(result.voteUrl, "_blank", "noopener,noreferrer");
      } else {
        setNotice(result.message || "Vote indisponible pour le moment.");
      }
    },
    onError: () => setNotice("Impossible d'ouvrir le vote pour le moment."),
  });

  const claimMutation = useMutation({
    mutationFn: (tier: VoteTierDTO) => claim({ data: { milestoneId: tier.id } }),
    onSuccess: async (result) => {
      setNotice(result.message);
      setClaimingId(null);
      await refresh();
    },
    onError: () => {
      setClaimingId(null);
      setNotice("Réclamation impossible : connectez-vous à votre compte AetheriaSky.");
    },
  });

  const votes = profile?.found ? profile.totalVotes : 0;
  const tiers = profile?.found && profile.tiers.length > 0 ? profile.tiers : publicTiers;
  const nextTier = tiers.find((t: VoteTierDTO) => votes < t.votes) ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Vote"
        title="Vote pour AetheriaSky"
        description="Chaque vote confirmé donne 1 Clé de Vote en jeu. Les Aether Coins arrivent uniquement via les paliers, réclamables une seule fois."
      />

      <Section className="border-b border-border">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          {profile?.found ? (
            <VotePlayerCard
              username={profile.username}
              totalVotes={profile.totalVotes}
              monthlyVotes={profile.monthlyVotes}
              rank={profile.rank}
              pendingVoteKeys={profile.pendingVoteKeys}
              coinsFromTiers={profile.coinsFromTiers}
              onChange={profile.owned ? undefined : () => setProfile(null)}
            />
          ) : (
            <div className="space-y-4">
              <VoteIdentityForm onSubmit={(name) => lookup.mutate(name)} />
              {lookup.isPending && (
                <p className="text-xs text-muted-foreground">Recherche en cours…</p>
              )}
              {profile && !profile.found && (
                <p className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                  Aucun joueur « {profile.username} » n'est enregistré pour le
                  moment. Connectez-vous à votre compte AetheriaSky et liez votre
                  pseudo Minecraft pour suivre votre progression.
                </p>
              )}
              {lookup.isError && (
                <p className="text-sm text-muted-foreground">
                  Impossible de récupérer la progression pour le moment.
                </p>
              )}
            </div>
          )}
          <TopVoters voters={topVoters} />
        </div>
        {notice && (
          <p className="mt-6 rounded-xl border border-secondary/30 bg-secondary/8 px-4 py-3 text-sm text-foreground">
            {notice}
          </p>
        )}
      </Section>

      <Section id="plateformes" className="border-b border-border bg-surface/30">
        <SectionHeading
          eyebrow="Plateformes"
          title="Où voter"
          description="Chaque plateforme possède son propre délai de vote : les compteurs sont indépendants et se mettent à jour en direct. La disponibilité réelle est revérifiée par le serveur au moment du clic."
        />
        {platforms.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Les plateformes de vote seront bientôt disponibles.
          </p>
        ) : (
          <div className="mt-10 grid gap-4">
            {platforms.map((platform: VotePlatformDTO) => (
              <VotePlatformCard
                key={platform.id}
                platform={platform}
                state={profile?.platformStates.find((s) => s.platformId === platform.id)}
                onVote={(p) => voteMutation.mutate(p)}
                isVoting={voteMutation.isPending && voteMutation.variables?.id === platform.id}
              />
            ))}
          </div>
        )}
      </Section>

      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="Paliers"
          title="Progression des récompenses"
          description="Le compteur de votes est cumulatif et ne revient jamais à zéro. Chaque palier atteint est réclamable une seule fois et crédite des Aether Coins."
        />

        {profile?.found && (
          <div className="mt-8 aether-surface rounded-2xl p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="font-display text-2xl text-foreground">
                {votes}
                <span className="text-muted-foreground">
                  {" "}
                  / {nextTier?.votes ?? votes} votes
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {nextTier
                  ? `Encore ${nextTier.votes - votes} votes avant : ${nextTier.coins} AC${nextTier.bonus ? " + clé spéciale" : ""}`
                  : "Tous les paliers sont atteints."}
              </p>
            </div>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-accent/60">
              <div
                className="h-full rounded-full bg-[image:var(--gradient-aether)] transition-[width] duration-700"
                style={{
                  width: `${nextTier ? Math.min(100, Math.round((votes / nextTier.votes) * 100)) : 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-8">
          <VoteTierList
            votes={votes}
            tiers={tiers}
            canClaim={Boolean(profile?.owned)}
            claimingId={claimingId}
            onClaim={(tier) => {
              setClaimingId(tier.id);
              claimMutation.mutate(tier);
            }}
          />
        </div>
        {!profile?.owned && (
          <p className="mt-6 text-xs text-muted-foreground">
            Connectez-vous à votre compte AetheriaSky pour réclamer les paliers
            atteints : les montants sont recalculés et crédités côté serveur.
          </p>
        )}
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Historique"
          title="Vos derniers votes"
          description="Un vote n'apparaît comme validé qu'après confirmation par la plateforme. Aucune récompense ne peut être créditée deux fois pour un même vote."
        />
        <div className="mt-10">
          <VoteHistory
            entries={profile?.history ?? []}
            emptyLabel={
              profile?.found
                ? "Aucun vote enregistré pour le moment."
                : "Entrez votre pseudo Minecraft pour afficher votre historique de votes."
            }
          />
        </div>
      </Section>
    </>
  );
}
