import { Crown, ShieldCheck, ShieldQuestion } from "lucide-react";
import type { AccountDTO } from "@/lib/backend/account.server";
import { formatDate } from "@/data/account";

export function AccountProfileHeader({ account }: { account: AccountDTO }) {
  const username = account.player?.username ?? "Joueur";
  const verified = account.player?.verified ?? false;

  return (
    <div className="aether-surface flex flex-col gap-6 rounded-3xl p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
      <div className="flex items-center gap-5">
        {/* Avatar Minecraft — remplacé plus tard par le rendu de skin réel. */}
        <span
          aria-hidden
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--gradient-aether)] font-display text-2xl text-primary-foreground"
        >
          {username.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <p className="font-display text-2xl text-foreground">{username}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Crown size={14} className="text-premium" />
            Grade :{" "}
            <span className="font-semibold text-premium">
              {account.grade?.name ?? "Joueur"}
            </span>
          </p>
          {account.player?.uuid && (
            <p className="mt-1 font-mono text-[0.7rem] text-muted-foreground">
              UUID : {account.player.uuid}
            </p>
          )}
          <p className="mt-1 text-[0.7rem] text-muted-foreground">
            Membre depuis {formatDate(account.player?.createdAt)}
            {account.player?.lastSeenAt
              ? ` · Dernière activité ${formatDate(account.player.lastSeenAt)}`
              : ""}
          </p>
        </div>
      </div>

      <span className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-xs text-muted-foreground">
        {verified ? (
          <>
            <ShieldCheck size={14} className="text-success" /> Compte Minecraft vérifié
          </>
        ) : (
          <>
            <ShieldQuestion size={14} className="text-info" /> Compte Minecraft non vérifié
          </>
        )}
      </span>
    </div>
  );
}
