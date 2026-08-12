import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageShell";
import { Section, SectionHeading } from "@/components/aether/Section";
import { VotePlatformCard } from "@/components/vote/VotePlatformCard";
import { VoteTierList } from "@/components/vote/VoteTierList";
import { TopVoters } from "@/components/vote/TopVoters";
import { VoteHistory } from "@/components/vote/VoteHistory";
import { VoteIdentityForm, VoteProfileCard } from "@/components/vote/VoteIdentity";
import { demoVoteProfile, votePlatforms } from "@/data/vote";

const title = "Vote pour AetheriaSky — Gagne des Éclats";
const description =
  "Vote pour AetheriaSky sur les plateformes partenaires, gagne des Éclats, débloque les paliers de récompenses et grimpe au classement des meilleurs voteurs.";

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
  const [username, setUsername] = useState<string | null>(null);
  const profile = demoVoteProfile;
  const platforms = [...votePlatforms].sort((a, b) => a.order - b.order);
  const votes = username ? profile.monthlyVotes : 0;

  return (
    <>
      <PageHeader
        eyebrow="Vote"
        title="Vote pour AetheriaSky"
        description="Soutiens le serveur, gagne des Éclats et participe au classement des meilleurs voteurs."
      />

      <Section className="border-b border-border">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {username ? (
            <VoteProfileCard
              username={username}
              shards={profile.shards}
              monthlyVotes={profile.monthlyVotes}
              monthlyGoal={profile.monthlyGoal}
              totalVotes={profile.totalVotes}
              onChange={() => setUsername(null)}
            />
          ) : (
            <VoteIdentityForm onSubmit={setUsername} />
          )}
          <TopVoters />
        </div>
      </Section>

      <Section id="plateformes" className="border-b border-border bg-surface/30">
        <SectionHeading
          eyebrow="Plateformes"
          title="Où voter"
          description="Quatre emplacements sont réservés. Les plateformes réelles et leur validation automatique seront branchées prochainement : un vote ne peut donner sa récompense qu'une seule fois."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {platforms.map((platform) => (
            <VotePlatformCard
              key={platform.id}
              platform={platform}
              state={
                username
                  ? profile.platformStates.find((s) => s.platformId === platform.id)
                  : undefined
              }
            />
          ))}
        </div>
      </Section>

      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="Paliers"
          title="Récompenses de vote"
          description="Les paliers sont cumulatifs : atteindre 150 votes signifie avoir débloqué les 6 paliers. Les récompenses sont versées en Éclats."
        />
        <div className="mt-10">
          <VoteTierList votes={votes} />
        </div>
        {!username && (
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
          description="Chaque vote passe par les états Disponible, Vote en attente, Vote confirmé puis Cooldown. Aucune récompense ne peut être créditée deux fois pour un même vote."
        />
        <div className="mt-10">
          <VoteHistory entries={username ? profile.history : []} />
        </div>
      </Section>
    </>
  );
}
