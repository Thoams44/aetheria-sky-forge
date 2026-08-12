import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/__acct")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { loadAccount } = await import("@/lib/backend/account.server");
        const data = await loadAccount(
          supabaseAdmin,
          "00e00705-35cc-4567-980b-c4ad7b950d08",
        );
        return new Response(JSON.stringify(data, null, 2), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
