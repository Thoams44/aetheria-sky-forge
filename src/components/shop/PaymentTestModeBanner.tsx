import { FlaskConical, ShieldAlert } from "lucide-react";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

/** Bandeau discret : indique l'environnement de paiement, dans l'habillage AetheriaSky. */
export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-destructive/35 bg-destructive/8 px-4 py-3 text-xs text-foreground">
        <ShieldAlert size={14} className="shrink-0 text-destructive" />
        Le paiement n'est pas encore configuré pour cette version du site.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-premium/30 bg-premium/8 px-4 py-3 text-xs text-muted-foreground">
        <FlaskConical size={14} className="shrink-0 text-premium" />
        Environnement de test : utilise une carte de test, aucun argent réel n'est débité.
      </div>
    );
  }
  return null;
}
