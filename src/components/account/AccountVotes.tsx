import { Check, Coins, Lock, Vote } from "lucide-react";
import { formatAmount } from "@/data/account";
import { cn } from "@/lib/utils";
import type { AccountDTO } from "@/lib/backend/account.server";

export function AccountVotes({ votes }: { votes: AccountDTO["votes"] }) {
  const tiers = votes.tiers ?? [];
  const monthlyVotes = votes.monthly ?? 0;
  const next = tiers.find((t) => monthlyVotes < t.votes) ?? null;
  const goal = next?.votes ?? tiers[tiers.length - 1]?.votes ?? 0;
  const percent = goal > 0 ? Math.min(100, Math.round((monthlyVotes / goal) * 100)) : 0;

  return (
    <div className="aether-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Vote size={16} className="text-secondary" />
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Mes votes
        </h2>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <p className="font-display text-3xl text-foreground">
          {monthlyVotes}{" "}
          <span className="text-muted-foreground">
            {goal > 0 ? `/ ${goal} votes` : "votes ce mois-ci"}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {votes.total} votes au total ·{" "}
          <span className="inline-flex items-center gap-1 text-foreground">
            <Coins size={12} className="text-premium" />
            {formatAmount(votes.coinsFromTiers)} AC gagnés via les paliers
          </span>
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-accent/60">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-aether)] transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      {next ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Prochain palier : <span className="text-secondary">{next.votes} votes</span> —{" "}
          <span className="text-premium">
            {next.coins} AC{next.bonus ? ` + ${next.bonus}` : ""}
          </span>
          . Plus que {next.votes - monthlyVotes} votes.
        </p>
      ) : tiers.length > 0 ? (
        <p className="mt-3 text-xs text-success">Tous les paliers sont atteints.</p>
      ) : null}

      {tiers.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Aucun palier disponible.</p>
      ) : (
        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => {
            const unlocked = monthlyVotes >= tier.votes;
            const isNext = next?.id === tier.id;
            return (
              <li
                key={tier.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-xs",
                  unlocked
                    ? "border-success/35 bg-success/8"
                    : isNext
                      ? "border-secondary/40 bg-secondary/8"
                      : "border-border bg-surface/40",
                )}
              >
                <span className="text-foreground">
                  {tier.votes} votes · <span className="text-premium">{tier.coins} AC</span>
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  {tier.claimed ? (
                    <>
                      <Check size={12} className="text-success" /> Récupéré
                    </>
                  ) : unlocked ? (
                    <>
                      <Check size={12} className="text-success" /> Débloqué
                    </>
                  ) : isNext ? (
                    <span className="text-secondary">Prochain palier</span>
                  ) : (
                    <>
                      <Lock size={11} /> Verrouillé
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
