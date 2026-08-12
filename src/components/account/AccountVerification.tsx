import { useState } from "react";
import { LogOut, MonitorSmartphone, ShieldCheck, Clock3 } from "lucide-react";
import { AetherButton } from "@/components/aether/AetherButton";
import { formatDate, SOON } from "@/data/account";
import type { AccountDTO } from "@/lib/backend/account.server";

export function AccountVerification({
  account,
  onLink,
  onSignOut,
  linking,
  linkError,
}: {
  account: AccountDTO;
  onLink: (username: string) => void;
  onSignOut: () => void;
  linking?: boolean;
  linkError?: string | null;
}) {
  const [username, setUsername] = useState(account.player?.username ?? "");
  const verified = account.player?.verified ?? false;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="aether-surface rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-info" />
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Vérification Minecraft
          </h2>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {verified
            ? "Compte Minecraft vérifié."
            : "Compte Minecraft non vérifié. Renseigne ton pseudo pour préparer la vérification."}
        </p>

        <form
          className="mt-5 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onLink(username.trim());
          }}
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Pseudo Minecraft"
            className="min-w-0 flex-1 rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-secondary/50"
          />
          <AetherButton type="submit" variant="outline" size="sm" disabled={linking}>
            {linking ? "Enregistrement…" : account.linked ? "Mettre à jour" : "Lier mon pseudo"}
          </AetherButton>
        </form>
        {linkError && <p className="mt-2 text-xs text-destructive">{linkError}</p>}

        <p className="mt-3 text-xs text-muted-foreground">
          La méthode de vérification sécurisée sera définie lors d'une prochaine étape.
        </p>
      </div>

      <div className="aether-surface rounded-2xl p-6">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Sécurité
        </h2>
        <ul className="mt-5 space-y-3 text-sm">
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck size={14} /> Compte vérifié
            </span>
            <span className="text-foreground">{verified ? "Oui" : "Non vérifié"}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock3 size={14} /> Dernière activité
            </span>
            <span className="text-foreground">
              {account.player?.lastSeenAt ? formatDate(account.player.lastSeenAt) : SOON}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <MonitorSmartphone size={14} /> Sessions actives
            </span>
            <span className="text-foreground">{SOON}</span>
          </li>
        </ul>
        <AetherButton variant="ghost" size="sm" className="mt-6 px-0" onClick={onSignOut}>
          <LogOut size={14} /> Déconnexion
        </AetherButton>
      </div>
    </div>
  );
}
