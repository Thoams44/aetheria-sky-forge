import { AlertTriangle, CheckCircle2, Clock, Package } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { demoOrders, type OrderStatus } from "@/data/orders";

const statusMeta: Record<
  OrderStatus,
  { label: string; tone: string; Icon: typeof CheckCircle2 }
> = {
  delivered: {
    label: "Livré",
    tone: "border-success/40 bg-success/10 text-success",
    Icon: CheckCircle2,
  },
  pending: {
    label: "En attente",
    tone: "border-premium/40 bg-premium/10 text-premium",
    Icon: Clock,
  },
  cancelled: {
    label: "Problème",
    tone: "border-destructive/40 bg-destructive/10 text-destructive",
    Icon: AlertTriangle,
  },
};

export function AccountOrders() {
  return (
    <div className="aether-surface rounded-2xl p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Package size={16} className="text-secondary" />
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Historique des achats
        </h2>
        <Link
          to="/boutique"
          className="ml-auto text-xs font-semibold text-muted-foreground transition-colors hover:text-secondary"
        >
          Aller à la boutique
        </Link>
      </div>

      <ul className="mt-5 divide-y divide-border">
        {demoOrders.map((order) => {
          const { label, tone, Icon } = statusMeta[order.status];
          return (
            <li
              key={order.id}
              className="flex flex-wrap items-center gap-3 py-4 sm:gap-5"
            >
              <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {order.items.join(", ")}
              </span>
              <span className="text-xs text-muted-foreground">{order.date}</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em] ${tone}`}
              >
                <Icon size={11} /> {label}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        Commandes de démonstration — elles proviendront plus tard du système de boutique.
      </p>
    </div>
  );
}