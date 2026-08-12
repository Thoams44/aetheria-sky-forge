import { Check, Clock, History, X } from "lucide-react";
import type { VoteHistoryEntry } from "@/data/vote";

const statusMeta = {
  confirmed: { label: "Validé", icon: Check, tone: "text-success" },
  pending: { label: "En attente", icon: Clock, tone: "text-premium" },
  expired: { label: "Expiré", icon: X, tone: "text-muted-foreground" },
} as const;

export function VoteHistory({ entries }: { entries: VoteHistoryEntry[] }) {
  return (
    <div className="aether-surface rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <History size={17} className="text-secondary" />
        <h3 className="font-display text-lg text-foreground">Historique des votes</h3>
      </div>

      {entries.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Entrez votre pseudo Minecraft pour afficher votre historique de votes.
        </p>
      ) : (
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="pb-3 font-medium">Plateforme</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Statut</th>
              <th className="pb-3 font-medium">Récompense</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => {
              const meta = statusMeta[entry.status];
              const Icon = meta.icon;
              return (
                <tr key={entry.id}>
                  <td className="py-3 text-foreground">{entry.platformName}</td>
                  <td className="py-3 text-muted-foreground">{entry.date}</td>
                  <td className={`py-3 ${meta.tone}`}>
                    <span className="flex items-center gap-1.5">
                      <Icon size={13} /> {meta.label}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{entry.reward}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
      <p className="mt-5 text-xs text-muted-foreground">
        Données fictives. L'historique sera alimenté par les votes réels validés.
      </p>
    </div>
  );
}
