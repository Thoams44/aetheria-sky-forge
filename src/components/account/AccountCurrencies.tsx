import { Coins, Gem } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { buttonClasses } from "@/components/aether/AetherButton";
import { formatAmount } from "@/data/account";

export function AccountCurrencies({
  aetherCoins,
  shards,
}: {
  aetherCoins: number;
  shards: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Monnaie premium — boutique */}
      <div className="aether-surface flex h-full flex-col rounded-2xl border-premium/25 p-6">
        <div className="flex items-center gap-2">
          <Coins size={16} className="text-premium" />
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Aether Coins
          </h3>
        </div>
        <p className="mt-4 font-display text-3xl text-foreground">
          {formatAmount(aetherCoins)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Monnaie premium de la boutique AetheriaSky.
        </p>
        <Link to="/boutique" className={`${buttonClasses("outline", "sm")} mt-6 w-fit`}>
          Voir la boutique
        </Link>
      </div>

      {/* Monnaie gratuite — votes */}
      <div className="aether-surface flex h-full flex-col rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <Gem size={16} className="text-info" />
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Éclats
          </h3>
        </div>
        <p className="mt-4 font-display text-3xl text-foreground">{formatAmount(shards)}</p>
        <p className="mt-2 text-xs text-muted-foreground">Obtenus grâce aux votes.</p>
        <Link to="/vote" className={`${buttonClasses("outline", "sm")} mt-6 w-fit`}>
          Aller voter
        </Link>
      </div>
    </div>
  );
}