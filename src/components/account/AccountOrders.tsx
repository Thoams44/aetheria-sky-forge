import { Package } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatDate, formatPrice, orderStatusLabel, orderStatusTone } from "@/data/account";
import type { AccountOrderDTO } from "@/lib/backend/account.server";

export function AccountOrders({ orders }: { orders: AccountOrderDTO[] }) {
  const list = Array.isArray(orders) ? orders : [];

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

      {list.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">Aucune commande enregistrée.</p>
      ) : (
        <ul className="mt-5 divide-y divide-border">
          {list.map((order) => {
            const tone =
              orderStatusTone[order.status] ?? "border-border bg-accent/50 text-muted-foreground";
            const label = orderStatusLabel[order.status] ?? order.status;
            return (
              <li key={order.id} className="flex flex-wrap items-center gap-3 py-4 sm:gap-5">
                <span className="font-mono text-xs text-muted-foreground">
                  {order.orderNumber}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {order.items.length > 0
                    ? order.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")
                    : "Contenu à définir"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(order.createdAt)}
                </span>
                <span className="text-xs text-foreground">
                  {formatPrice(order.total, order.currency)}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em] ${tone}`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
