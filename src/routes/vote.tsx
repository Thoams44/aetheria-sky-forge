import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/layout/PageShell";
import { Section, SectionHeading } from "@/components/aether/Section";
import { VotePlatformCard } from "@/components/vote/VotePlatformCard";
import { VoteTierList } from "@/components/vote/VoteTierList";
import { TopVoters } from "@/components/vote/TopVoters";
import { VoteHistory } from "@/components/vote/VoteHistory";
import { VoteIdentityForm, VoteProfileCard } from "@/components/vote/VoteIdentity";
import {
  getVotePageData,
  getVoteProfile,
  type VoteProfileDTO,
} from "@/lib/backend/vote.functions";
import { getNextTier } from "@/lib/vote";

const title = "Vote pour AetheriaSky — Gagne des Aether Coins";
const description =
  "Vote pour AetheriaSky sur les plateformes partenaires : 1 Clé de Vote par vote, des Aether Coins à chaque palier atteint et une place au classement des meilleurs voteurs.";

export const Route = createFileRoute("/vote")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
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
  const { platforms, tiers, topVoters } = Route.useLoaderData();
  const fetchProfile = useServerFn(getVoteProfile);
  const [profile, setProfile] = useState<VoteProfileDTO | null>(null);

  const lookup = useMutation({
    mutationFn: (username: string) => fetchProfile({ data: { username } }),
    onSuccess: (data) => setProfile(data),
  });

  const votes = profile?.found ? profile.totalVotes : 0;
  const nextTier = getNextTier(votes, tiers);
  const goal = nextTier?.votes ?? (tiers[tiers.length - 1]?.votes ?? votes);
  const nextTierReward = nextTier
    ? `${nextTier.votes} votes → +${nextTier.coins} AC${nextTier.bonus ? ` + ${nextTier.bonus}` : ""}`
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Vote"
        title="Vote pour AetheriaSky"
        description="Soutiens le serveur : chaque vote donne 1 Clé de Vote en jeu, et chaque palier atteint rapporte des Aether Coins."
      />

      <Section className="border-b border-border">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {profile?.found ? (
            <VoteProfileCard
              username={profile.username}
              monthlyVotes={profile.monthlyVotes}
              goal={goal}
              totalVotes={profile.totalVotes}
              coinsFromTiers={profile.coinsFromTiers}
              nextTierReward={nextTierReward}
              pendingVoteKeys={profile.pendingVoteKeys}
              onChange={() => setProfile(null)}
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
                  moment. La vérification du compte Minecraft permettra bientôt de
                  relier votre pseudo à votre progression.
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
      </Section>

      <Section id="plateformes" className="border-b border-border bg-surface/30">
        <SectionHeading
          eyebrow="Plateformes"
          title="Où voter"
          description="Les plateformes proviennent du backend AetheriaSky. Leur validation automatique sera branchée prochainement : un vote ne peut donner sa récompense qu'une seule fois."
        />
        {platforms.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Les plateformes de vote seront bientôt disponibles.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {platforms.map((platform) => (
              <VotePlatformCard
                key={platform.id}
                platform={platform}
                state={profile?.platformStates.find((s) => s.platformId === platform.id)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="Paliers"
          title="Récompenses de vote"
          description="Les paliers sont cumulatifs : atteindre 150 votes signifie avoir débloqué les 6 paliers. Les récompenses sont versées en Aether Coins (AC), le palier final ajoutant une clé spéciale."
        />
        <div className="mt-10">
          <VoteTierList votes={votes} tiers={tiers} />
        </div>
        {!profile?.found && (
          <p className="mt-6 text-xs text-muted-foreground">
            Entrez votre pseudo plus haut pour voir votre progression réelle sur
            les paliers.
          </p>
        )}
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Historique"
          title="Vos derniers votes"
          description="Chaque vote passe par les états En attente, Validé puis Récompensé. Aucune récompense ne peut être créditée deux fois pour un même vote."
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
