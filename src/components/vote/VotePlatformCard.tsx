import { Compass, Flag, Radio, Star, ExternalLink, Lock } from "lucide-react";
import type { PlatformVoteState, VoteIconKey, VotePlatform } from "@/data/vote";
import { nextVoteLabel, voteStatusLabel, voteStatusTone } from "@/lib/vote";
import { buttonClasses } from "@/components/aether/AetherButton";

const icons: Record<VoteIconKey, typeof Star> = {
  star: Star,
  compass: Compass,
  flag: Flag,
  signal: Radio,
};

export function VotePlatformCard({
  platform,
  state,
}: {
  platform: VotePlatform;
  state?: PlatformVoteState | undefined;
}) {
  const Icon = icons[platform.icon];
  const status = state?.status ?? "available";
  const canVote = platform.enabled && Boolean(platform.voteUrl) && status === "available";

  return (
    <article className="aether-surface flex flex-col rounded-2xl p-6 transition-colors duration-300 hover:border-secondary/35">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-secondary">
          <Icon size={19} />
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] ${voteStatusTone[status]}`}
        >
          {voteStatusLabel[status]}
        </span>
      </div>

      <h3 className="mt-5 font-display text-lg text-foreground">{platform.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {platform.description}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 text-xs">
        <div>
          <dt className="text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
            Prochain vote
          </dt>
          <dd className="mt-1 text-foreground">
            {nextVoteLabel(status, platform.cooldownHours)}
          </dd>
        </div>
        <div>
          <dt className="text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
            Récompense
          </dt>
          <dd className="mt-1 text-foreground">{platform.reward}</dd>
        </div>
      </dl>

      <div className="mt-5">
        {canVote ? (
          <a
            href={platform.voteUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className={`${buttonClasses("primary", "sm")} w-full`}
          >
            Voter <ExternalLink size={14} />
          </a>
        ) : (
          <button
            type="button"
            disabled
            className={`${buttonClasses("outline", "sm")} w-full cursor-not-allowed`}
          >
            <Lock size={13} /> Voter — bientôt disponible
          </button>
        )}
      </div>
      <p className="mt-3 text-[0.68rem] text-muted-foreground">
        Cooldown : toutes les {platform.cooldownHours}h · une seule récompense par vote.
      </p>
    </article>
  );
}
