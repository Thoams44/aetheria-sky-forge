import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

const MAX_LEASE_SECONDS = 900;
const MIN_LEASE_SECONDS = 10;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

type ClaimRow = {
  id: string | null;
  player_id: string | null;
  delivery_type: string | null;
  payload: unknown;
  attempts: number | null;
  claimed_by: string | null;
  lease_until: string | null;
  outcome: "CLAIMED" | "ALREADY_CLAIMED" | "NOT_FOUND";
};

/**
 * Réservation atomique d'une livraison par une instance AetheriaCore.
 * Sécurité : Bearer AETHERIACORE_API_KEY, service role côté serveur uniquement.
 * L'atomicité est garantie par la fonction SQL public.claim_delivery.
 */
export const Route = createFileRoute("/api/public/core/deliveries/claim")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["AETHERIACORE_API_KEY"];
        const authHeader = request.headers.get("authorization") ?? "";

        if (!apiKey || !authHeader.startsWith("Bearer ")) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        if (!safeEqual(authHeader.slice(7), apiKey)) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        let body: any;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const deliveryId = String(body?.delivery_id ?? "").trim();
        const claimedBy = String(body?.claimed_by ?? "").trim().slice(0, 128);
        const leaseSeconds = body?.lease_seconds ?? 120;

        if (!UUID_RE.test(deliveryId)) {
          return Response.json({ error: "invalid_delivery_id" }, { status: 400 });
        }
        if (!claimedBy) {
          return Response.json({ error: "invalid_claimed_by" }, { status: 400 });
        }
        if (
          !Number.isInteger(leaseSeconds) ||
          leaseSeconds < MIN_LEASE_SECONDS ||
          leaseSeconds > MAX_LEASE_SECONDS
        ) {
          return Response.json({ error: "invalid_lease_seconds" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data, error } = await (supabaseAdmin as any).rpc("claim_delivery", {
          _delivery_id: deliveryId,
          _claimed_by: claimedBy,
          _lease_seconds: leaseSeconds,
        });

        if (error) {
          console.error("[core/deliveries/claim]", error.message);
          return Response.json({ error: "server_error" }, { status: 500 });
        }

        const row = (Array.isArray(data) ? data[0] : data) as ClaimRow | undefined;

        if (!row || row.outcome === "NOT_FOUND") {
          return Response.json({ error: "DELIVERY_NOT_FOUND" }, { status: 404 });
        }
        if (row.outcome !== "CLAIMED") {
          return Response.json({ error: "DELIVERY_ALREADY_CLAIMED" }, { status: 409 });
        }

        return Response.json(
          {
            success: true,
            delivery: {
              id: row.id,
              player_id: row.player_id,
              delivery_type: row.delivery_type,
              payload: row.payload,
              attempts: row.attempts,
              claimed_by: row.claimed_by,
              lease_until: row.lease_until,
            },
          },
          { headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
