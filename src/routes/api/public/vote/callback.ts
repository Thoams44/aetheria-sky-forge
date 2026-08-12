import { createFileRoute } from "@tanstack/react-router";

/**
 * Callback de confirmation de vote appelé par une plateforme partenaire.
 * Sécurité : secret partagé obligatoire, aucune donnée sensible retournée.
 * Idempotence : (platform_id, external_vote_id) est unique en base.
 */
export const Route = createFileRoute("/api/public/vote/callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["VOTE_CALLBACK_SECRET"];
        const provided =
          request.headers.get("x-vote-secret") ??
          new URL(request.url).searchParams.get("secret");

        if (!secret || provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: any;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const username = String(body?.username ?? "").trim().slice(0, 16);
        const platformSlug = String(body?.platform ?? "").trim().slice(0, 64);
        const externalVoteId = String(body?.vote_id ?? "").trim().slice(0, 128);

        if (!username || !platformSlug || !externalVoteId) {
          return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { confirmVote } = await import("@/lib/backend/vote.server");

        const { data: platform } = await supabaseAdmin
          .from("vote_platforms")
          .select("id, enabled")
          .eq("slug", platformSlug)
          .maybeSingle();

        if (!platform || !platform.enabled) {
          return Response.json({ ok: false, error: "unknown_platform" }, { status: 404 });
        }

        const { data: player } = await supabaseAdmin
          .from("players")
          .select("id")
          .ilike("minecraft_username", username)
          .maybeSingle();

        if (!player) {
          return Response.json({ ok: false, error: "unknown_player" }, { status: 404 });
        }

        const result = await confirmVote(supabaseAdmin, {
          playerId: player.id,
          platformId: platform.id,
          externalVoteId,
        });

        if (!result.ok) {
          return Response.json({ ok: false, error: "vote_failed" }, { status: 500 });
        }
        return Response.json({ ok: true, duplicated: result.duplicated });
      },
    },
  },
});
