import { LogOut, MonitorSmartphone, ShieldCheck, Clock3 } from "lucide-react";
import { AetherButton } from "@/components/aether/AetherButton";
import type { AccountSecurity } from "@/data/account";

export function AccountVerification({ security }: { security: AccountSecurity }) {
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
          Connectez votre compte Minecraft pour accéder à vos données AetheriaSky.
        </p>
        <AetherButton variant="outline" size="sm" className="mt-6" disabled>
          Vérifier mon compte
        </AetherButton>
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
            <span className="text-foreground">
              {security.verified ? "Oui" : "Non vérifié"}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock3 size={14} /> Dernière connexion
            </span>
            <span className="text-foreground">{security.lastLogin ?? "À venir"}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <MonitorSmartphone size={14} /> Sessions actives
            </span>
            <span className="text-foreground">{security.activeSessions ?? "À venir"}</span>
          </li>
        </ul>
        <AetherButton variant="ghost" size="sm" className="mt-6 px-0" disabled>
          <LogOut size={14} /> Déconnexion
        </AetherButton>
      </div>
    </div>
  );
}