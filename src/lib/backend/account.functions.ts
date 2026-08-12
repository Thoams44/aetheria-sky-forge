import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AccountDTO } from "./account.server";

/** Lectures privées de l'espace joueur (RLS : chaque joueur ne voit que ses données). */

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountDTO> => {
    const { loadAccount } = await import("./account.server");
    return loadAccount(context.supabase, context.userId);
  });

export const linkMinecraftUsername = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { username: string }) => ({
    username: String(input?.username ?? "").trim().slice(0, 16),
  }))
  .handler(async ({ data, context }) => {
    if (!/^[A-Za-z0-9_]{3,16}$/.test(data.username)) {
      return { ok: false as const, message: "Pseudo Minecraft invalide (3 à 16 caractères)." };
    }
    const { linkPlayer } = await import("./account.server");
    return linkPlayer(context.userId, data.username);
  });
