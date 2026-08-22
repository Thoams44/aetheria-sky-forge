import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Lecture des livraisons en attente pour le plugin AetheriaCore.
 * Sécurité : Bearer AETHERIACORE_API_KEY (serveur uniquement), lecture seule.
 */
export const Route = createFileRoute("/api/public/core/deliveries")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = process.env["AETHERIACORE_API_KEY"];
        const authHeader = request.headers.get("authorization") ?? "";

        if (!apiKey || !authHeader.startsWith("Bearer ")) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        if (!safeEqual(authHeader.slice(7), apiKey)) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const status = url.searchParams.get("status");
        if (status !== null && status !== "PENDING") {
          return Response.json({ error: "invalid_status" }, { status: 400 });
        }

        const rawLimit = url.searchParams.get("limit");
        let limit = DEFAULT_LIMIT;
        if (rawLimit !== null) {
          const parsed = Number(rawLimit);
          if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_LIMIT) {
            return Response.json({ error: "invalid_limit" }, { status: 400 });
          }
          limit = parsed;
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data, error } = await supabaseAdmin
          .from("deliveries")
          .select("id, player_id, delivery_type, payload, attempts, created_at, next_attempt_at")
          .eq("status", "PENDING")
          .or(`next_attempt_at.is.null,next_attempt_at.lte.${new Date().toISOString()}`)
          .order("created_at", { ascending: true })
          .limit(limit);

        if (error) {
          console.error("[core/deliveries]", error.message);
          return Response.json({ error: "server_error" }, { status: 500 });
        }

        return Response.json(
          {
            deliveries: (data ?? []).map((d) => ({
              id: d.id,
              player_id: d.player_id,
              delivery_type: d.delivery_type,
              payload: d.payload,
              attempts: d.attempts,
              created_at: d.created_at,
            })),
          },
          { headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
