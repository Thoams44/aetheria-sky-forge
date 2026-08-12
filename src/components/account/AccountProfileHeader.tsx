<<<<<<<
import { Crown, ShieldCheck, ShieldQuestion } from "lucide-react";
import type { Account } from "@/data/account";

export function AccountProfileHeader({ account }: { account: Account }) {
  return (
    <div className="aether-surface flex flex-col gap-6 rounded-3xl p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
      <div className="flex items-center gap-5">
        {/* Avatar Minecraft — remplacé plus tard par le rendu de skin réel. */}
        <span
          aria-hidden
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--gradient-aether)] font-display text-2xl text-primary-foreground"
        >
          {account.username.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <p className="font-display text-2xl text-foreground">{account.username}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Crown size={14} className="text-premium" />
            Grade : <span className="font-semibold text-premium">{account.grade.id}</span>
          </p>
          <p className="mt-1 font-mono text-[0.7rem] text-muted-foreground">
            UUID : {account.uuid}
          </p>
        </div>
      </div>

      <span className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-xs text-muted-foreground">
        {account.security.verified ? (
          <>
            <ShieldCheck size={14} className="text-success" /> Compte vérifié
          </>
        ) : (
          <>
            <ShieldQuestion size={14} className="text-info" /> Compte non vérifié
          </>
        )}
      </span>
    </div>
  );
}
>>>>>>>