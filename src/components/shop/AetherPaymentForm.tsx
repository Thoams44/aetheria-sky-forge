import { useCallback, useMemo } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";

/**
 * Formulaire de paiement Stripe intégré directement dans la page AetheriaSky.
 * Aucune redirection vers une page de paiement externe : le joueur reste sur le site.
 * Les données de carte sont saisies dans les composants Stripe et ne transitent
 * jamais par nos serveurs.
 */
export function AetherPaymentForm({ clientSecret }: { clientSecret: string }) {
  const fetchClientSecret = useCallback(async () => clientSecret, [clientSecret]);
  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background/40 p-1">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
