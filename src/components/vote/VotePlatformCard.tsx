import { Compass, Flag, Radio, Star, ExternalLink, Lock, Clock } from "lucide-react";
import type { PlatformStateDTO, VotePlatformDTO } from "@/lib/backend/vote.functions";
import { formatCooldown, voteStatusLabel, voteStatusTone } from "@/lib/vote";
import { buttonClasses } from "@/components/aether/AetherButton";
import { formatRemaining, useCountdown } from "@/components/vote/VoteCountdown";

const icons: Record<string, typeof Star> = {
  star: Star,
  compass: Compass,
  flag: Flag,
  signal: Radio,
};

export function VotePlatformCard({
  platform,
  state,
  onVote,
  isVoting = false,
}: {
  platform: VotePlatformDTO;
  state?: PlatformStateDTO | undefined;
  onVote?: (platform: VotePlatformDTO) => void;
  isVoting?: boolean;
}) {
  const Icon = icons[platform.icon ?? "star"] ?? Star;
  const serverStatus = state?.status ?? "available";
  const { remaining, expired } = useCountdown(
    serverStatus === "cooldown" ? state?.nextVoteAt : null,
  );

  // Le cooldown s'écoule côté interface ; la disponibilité réelle reste
  // revérifiée par le serveur au moment du clic.
  const status = serverStatus === "cooldown" && expired ? "available" : serverStatus;
  const configured = Boolean(platform.voteUrl);
  const canVote = configured && status === "available";

  return (
    <article className="aether-surface flex flex-col gap-5 rounded-2xl p-5 transition-colors duration-300 hover:border-secondary/35 sm:flex-row sm:items-center sm:p-6">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-secondary">
        <Icon size={20} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-lg text-foreground">{platform.name}</h3>
          <span
            className={`rounded-full border px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.16em] ${voteStatusTone[status]}`}
          >
            {voteStatusLabel[status]}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {platform.domain ?? "Domaine à venir"} · cooldown propre :{" "}
          {formatCooldown(platform.cooldownSeconds)}
        </p>
        {platform.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {platform.description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-56">
        <p className="flex items-center justify-center gap-1.5 text-sm text-foreground">
          <Clock size={13} className="text-secondary" />
          {status === "cooldown"
            ? formatRemaining(remaining)
            : status === "pending"
              ? "Validation en cours"
              : "Disponible maintenant"}
        </p>

        {canVote ? (
          <button
            type="button"
            disabled={isVoting}
            onClick={() => onVote?.(platform)}
            className={`${buttonClasses("primary", "sm")} w-full`}
          >
            {isVoting ? "Ouverture…" : "Voter"} <ExternalLink size={14} />
          </button>
        ) : (
          <button
            type="button"
            disabled
            className={`${buttonClasses("outline", "sm")} w-full cursor-not-allowed`}
          >
            {status === "cooldown" ? (
              <>
                <Clock size={13} /> Disponible dans {formatRemaining(remaining)}
              </>
            ) : status === "pending" ? (
              <>
                <Clock size={13} /> Vote en attente
              </>
            ) : (
              <>
                <Lock size={13} /> Bientôt disponible
              </>
            )}
          </button>
        )}
        <p className="text-center text-[0.68rem] text-muted-foreground">
          Récompense : +1 Clé de Vote après confirmation
        </p>
      </div>
    </article>
  );
}
