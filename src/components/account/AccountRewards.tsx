import { Gift, KeyRound, Coins, Crown, Sparkles, Gem } from "lucide-react";
import { deliveryStatusLabel, deliveryStatusTone, formatDate } from "@/data/account";
import type { AccountRewardDTO } from "@/lib/backend/account.server";

const typeIcons: Record<string, typeof Gift> = {
  VOTE_KEY: KeyRound,
  AETHER_COINS: Coins,
  SHARDS: Gem,
  GRADE: Crown,
  CUSTOM: Sparkles,
};

export function AccountRewards({ rewards }: { rewards: AccountRewardDTO[] }) {
  const list = Array.isArray(rewards) ? rewards : [];

  return (
    <div className="aether-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Gift size={16} className="text-secondary" />
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Mes récompenses
        </h2>
      </div>

      {list.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Aucune récompense enregistrée pour le moment.
        </p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((reward) => {
            const Icon = typeIcons[reward.type] ?? Gift;
            const tone =
              deliveryStatusTone[reward.status] ??
              "border-border bg-accent/50 text-muted-foreground";
            return (
              <article
                key={reward.id}
                className="flex flex-col rounded-xl border border-border bg-surface/40 p-4 transition-colors duration-300 hover:border-secondary/30"
              >
                <Icon size={15} className="text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">{reward.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{reward.detail}</p>
                <p className="mt-1 text-[0.65rem] text-muted-foreground">
                  {reward.status === "DELIVERED" && reward.deliveredAt
                    ? `Livrée le ${formatDate(reward.deliveredAt)}`
                    : formatDate(reward.createdAt)}
                </p>
                <span
                  className={`mt-4 inline-flex w-fit rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em] ${tone}`}
                >
                  {deliveryStatusLabel[reward.status] ?? reward.status}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
