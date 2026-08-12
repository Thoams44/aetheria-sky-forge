import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

/**
 * Webhook Stripe — seule source de vérité du paiement.
 * Aucune donnée bancaire n'est lue ni enregistrée : uniquement des identifiants.
 */
async function handleWebhook(request: Request, env: StripeEnv) {
  const event = await verifyWebhook(request, env);
  const { markOrderPaid, markOrderFailed } = await import("@/lib/backend/checkout.server");
  const object = event.data.object as Record<string, any>;

  switch (event.type) {
    case "checkout.session.completed": {
      if (object["payment_status"] === "unpaid") break; // règlement différé : on attend la confirmation
      await markOrderPaid({
        orderId: object["metadata"]?.order_id ?? null,
        sessionId: object["id"] ?? null,
        paymentIntentId: typeof object["payment_intent"] === "string" ? object["payment_intent"] : null,
        amountMinor: object["amount_total"] ?? null,
        currency: object["currency"] ?? null,
        environment: env,
      });
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      await markOrderPaid({
        orderId: object["metadata"]?.order_id ?? null,
        sessionId: object["id"] ?? null,
        paymentIntentId: typeof object["payment_intent"] === "string" ? object["payment_intent"] : null,
        amountMinor: object["amount_total"] ?? null,
        currency: object["currency"] ?? null,
        environment: env,
      });
      break;
    }
    case "payment_intent.succeeded": {
      await markOrderPaid({
        orderId: object["metadata"]?.order_id ?? null,
        paymentIntentId: object["id"] ?? null,
        amountMinor: object["amount_received"] ?? object["amount"] ?? null,
        currency: object["currency"] ?? null,
        environment: env,
      });
      break;
    }
    case "checkout.session.async_payment_failed": {
      await markOrderFailed({
        orderId: object["metadata"]?.order_id ?? null,
        sessionId: object["id"] ?? null,
        reason: "async_payment_failed",
      });
      break;
    }
    case "payment_intent.payment_failed": {
      await markOrderFailed({
        orderId: object["metadata"]?.order_id ?? null,
        reason: object["last_payment_error"]?.code ?? "payment_failed",
      });
      break;
    }
    default:
      // payment_intent.requires_action & co. : la commande reste PENDING.
      console.log("[payments] Événement non traité:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("[payments] Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
