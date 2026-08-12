import { Gift, PartyPopper, Sparkles, Vote } from "lucide-react";
import {
  rewardStatusLabel,
  rewardStatusTone,
  type AccountReward,
} from "@/data/account";

const sourceIcons = { vote: Vote, event: PartyPopper, special: Sparkles } as const;

export function AccountRewards({ rewards }: { rewards: AccountReward[] }) {
  return (
    <div className="aether-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Gift size={16} className="text-secondary" />
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Mes récompenses
        </h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rewards.map((reward) => {
          const Icon = sourceIcons[reward.source];
          return (
            <article
              key={reward.id}
              className="flex flex-col rounded-xl border border-border bg-surface/40 p-4 transition-colors duration-300 hover:border-secondary/30"
            >
              <Icon size={15} className="text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">{reward.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{reward.detail}</p>
              <span
                className={`mt-4 inline-flex w-fit rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em] ${rewardStatusTone[reward.status]}`}
              >
                {rewardStatusLabel[reward.status]}
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}