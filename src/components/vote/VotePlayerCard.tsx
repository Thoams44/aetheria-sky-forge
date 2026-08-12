import { Coins, KeyRound, Trophy, UserRound } from "lucide-react";
import { formatVotes } from "@/lib/vote";

/** Carte joueur : avatar Minecraft, pseudo, votes validés et position au classement. */
export function VotePlayerCard({
  username,
  totalVotes,
  monthlyVotes,
  rank,
  pendingVoteKeys,
  coinsFromTiers,
  onChange,
}: {
  username: string;
  totalVotes: number;
  monthlyVotes: number;
  rank: number | null;
  pendingVoteKeys: number;
  coinsFromTiers: number;
  onChange?: () => void;
}) {
  return (
    <div className="aether-surface aether-glow rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-5">
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-primary/12 text-secondary">
          {username ? (
            <img
              src={`https://mc-heads.net/avatar/${encodeURIComponent(username)}/96`}
              alt={`Avatar Minecraft de ${username}`}
              width={64}
              height={64}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={22} />
          )}
        </span>

        <div className="min-w-0">
          <p className="eyebrow">Mon profil de vote</p>
          <p className="font-display text-2xl text-foreground">{username || "Joueur"}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="text-foreground">{formatVotes(totalVotes)} votes</span>
            <span className="flex items-center gap-1.5 text-secondary">
              <Trophy size={13} />
              {rank ? `#${rank}` : "Non classé"}
            </span>
          </p>
        </div>

        {onChange && (
          <button
            type="button"
            onClick={onChange}
            className="ml-auto text-xs font-semibold text-muted-foreground transition-colors hover:text-secondary"
          >
            Changer de pseudo
          </button>
        )}
      </div>

      <dl className="mt-7 grid gap-3 sm:grid-cols-3">
        <Stat label="Votes ce mois-ci" value={formatVotes(monthlyVotes)} />
        <Stat
          label="Clés de Vote en attente"
          value={formatVotes(pendingVoteKeys)}
          icon={<KeyRound size={13} className="text-secondary" />}
        />
        <Stat
          label="AC gagnés via les paliers"
          value={formatVotes(coinsFromTiers)}
          icon={<Coins size={13} className="text-premium" />}
        />
      </dl>

      <p className="mt-4 text-xs text-muted-foreground">
        Chaque vote confirmé par la plateforme donne exactement 1 Clé de Vote en
        jeu. Les Aether Coins proviennent uniquement des paliers réclamés.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/50 px-4 py-3">
      <dt className="flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg text-foreground">{value}</dd>
    </div>
  );
}
