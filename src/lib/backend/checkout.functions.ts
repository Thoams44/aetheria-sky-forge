import { createServerFn } from "@tanstack/react-start";
import type { StripeEnv } from "@/lib/stripe.server";
import type { CheckoutStartResult, CheckoutStatusDTO } from "./checkout.server";

export type { CheckoutStartResult, CheckoutStatusDTO };

/** Démarre un paiement réel : la commande et le montant sont créés côté serveur. */
export const startStripeCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      username: string;
      email: string;
      returnUrl: string;
      environment: StripeEnv;
      lines: { productId: string; quantity: number }[];
    }) => input,
  )
  .handler(async ({ data }): Promise<CheckoutStartResult> => {
    const { startCheckout } = await import("./checkout.server");
    return startCheckout(data);
  });

/** Statut officiel de la commande, lu dans notre base de données. */
export const getStripeCheckoutStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { sessionId: string }) => input)
  .handler(async ({ data }): Promise<CheckoutStatusDTO | null> => {
    const { getCheckoutStatus } = await import("./checkout.server");
    return getCheckoutStatus(data.sessionId);
  });
