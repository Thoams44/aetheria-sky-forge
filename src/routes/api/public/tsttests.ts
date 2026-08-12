import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/tsttests")({
  server: {
    handlers: {
      GET: async () => {
        const out: unknown[] = [];
        const mod = await import("@/lib/backend/admin-tests.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const url = process.env["SUPABASE_URL"]!;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

        const roles = ["fondateur", "admin", "staff", "player"] as const;
        for (const role of roles) {
          const email = `qa-${role}@aetheriasky.test`;
          const password = "Aetheria!Test2026";
          const { data: created } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          let userId = created?.user?.id;
          if (!userId) {
            const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
            userId = list.users.find((u) => u.email === email)?.id;
          }
          await supabaseAdmin.from("user_roles").insert({ user_id: userId!, role: role as never });
          const anon = createClient(url, key, { auth: { persistSession: false } });
          const { data: session } = await anon.auth.signInWithPassword({ email, password });
          const token = session.session?.access_token ?? "";
          const scoped = createClient(url, key, {
            auth: { persistSession: false },
            global: {
              fetch: (i, init) => {
                const h = new Headers(init?.headers);
                h.set("apikey", key);
                h.set("Authorization", `Bearer ${token}`);
                return fetch(i, { ...init, headers: h });
              },
            },
          });
          let allowed = true;
          let reason: string | null = null;
          try {
            await mod.assertAdmin(scoped as never, userId!);
          } catch (e) {
            allowed = false;
            reason = e instanceof Error ? e.message : "?";
          }
          const probe = await scoped.from("user_roles").select("role").eq("user_id", userId!);
          out.push({ role, allowed, reason, hasToken: Boolean(token), probe: probe.data, probeErr: probe.error?.message });
        }

        const actor = (await supabaseAdmin.auth.admin.listUsers({ perPage: 200 })).data.users.find(
          (u) => u.email === "qa-fondateur@aetheriasky.test",
        )!.id;

        let { data: player } = await supabaseAdmin.from("players").select("id").limit(1).maybeSingle();
        if (!player) {
          const ins = await supabaseAdmin
            .from("players")
            .insert({ minecraft_username: "QA_TestPlayer", verified: true })
            .select("id")
            .single();
          player = ins.data;
        }
        const { data: product } = await supabaseAdmin
          .from("store_products")
          .select("id, type")
          .eq("active", true)
          .eq("type", "AETHER_COINS")
          .limit(1)
          .maybeSingle();
        if (!player || !product) return Response.json({ out, note: "pas de joueur/produit" });

        const order = await mod.createTestOrder(actor, {
          playerId: player.id,
          productId: product.id,
          quantity: 1,
        });
        out.push({ step: "order", ...order });
        out.push({ step: "pay", ...(await mod.simulatePayment(actor, order.orderId)) });
        const delivery = await mod.createTestDelivery(actor, order.orderId);
        out.push({ step: "delivery", ...delivery });
        out.push({ step: "fail", ...(await mod.failDelivery(actor, delivery.deliveryId)) });
        out.push({ step: "retry", ...(await mod.retryDelivery(actor, delivery.deliveryId)) });
        out.push({ step: "deliver", ...(await mod.simulateDelivery(actor, delivery.deliveryId)) });
        out.push({ step: "timeline", entries: await mod.loadTimeline(order.orderId) });
        const dash = await mod.loadDashboard();
        out.push({ step: "dashboard", stats: dash.stats, first: dash.orders[0] });
        return Response.json({ out });
      },
    },
  },
});
