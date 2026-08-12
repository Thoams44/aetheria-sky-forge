import { createFileRoute } from "@tanstack/react-router";
import { createHmac } from "crypto";

export const Route = createFileRoute("/api/public/paytest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const out: Record<string, unknown> = {};
        const { startCheckout, getCheckoutStatus } = await import("@/lib/backend/checkout.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const pid = "3bd06946-7298-4c69-9807-1f101c783861";
        await supabaseAdmin.from("store_products").update({ price: 4.99 }).eq("id", pid);
        try {
          const res = await startCheckout({
            username: "TestPay",
            email: "test@example.com",
            lines: [{ productId: pid, quantity: 2 }],
            returnUrl: "http://localhost:8080/paiement?session_id={CHECKOUT_SESSION_ID}",
            environment: "sandbox",
          });
          out["start"] = "error" in res ? res : { ok: true, orderNumber: res.orderNumber, hasSecret: !!res.clientSecret, sessionId: res.sessionId };
          if (!("error" in res)) {
            // simulate webhook twice (idempotence)
            const body = JSON.stringify({
              type: "checkout.session.completed",
              data: { object: { id: res.sessionId, payment_status: "paid", amount_total: 998, currency: "eur", payment_intent: "pi_test_123", metadata: {} } },
            });
            const secret = process.env["PAYMENTS_SANDBOX_WEBHOOK_SECRET"]!;
            const t = Math.floor(Date.now() / 1000);
            const sig = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
            const url = new URL(request.url);
            const hook = `${url.origin}/api/public/payments/webhook?env=sandbox`;
            for (let i = 0; i < 2; i++) {
              const r = await fetch(hook, { method: "POST", headers: { "stripe-signature": `t=${t},v1=${sig}`, "content-type": "application/json" }, body });
              out[`hook${i}`] = r.status;
            }
            out["status"] = await getCheckoutStatus(res.sessionId);
            const { data: dels } = await supabaseAdmin.from("deliveries").select("delivery_type,status").eq("order_id", (await supabaseAdmin.from("orders").select("id").eq("stripe_session_id", res.sessionId).maybeSingle()).data!.id);
            out["deliveries"] = dels;
            // cleanup
            const oid = (await supabaseAdmin.from("orders").select("id").eq("stripe_session_id", res.sessionId).maybeSingle()).data!.id;
            await supabaseAdmin.from("deliveries").delete().eq("order_id", oid);
            await supabaseAdmin.from("order_items").delete().eq("order_id", oid);
            await supabaseAdmin.from("orders").delete().eq("id", oid);
            await supabaseAdmin.from("audit_logs").delete().eq("target_id", oid);
          }
        } catch (e) {
          out["thrown"] = String(e);
        }
        await supabaseAdmin.from("store_products").update({ price: null }).eq("id", pid);
        return Response.json(out);
      },
    },
  },
});
