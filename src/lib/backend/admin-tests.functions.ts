import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  TestDashboardDTO,
  TestPlayerDTO,
  TestProductDTO,
  TestTimelineEntryDTO,
} from "./admin-tests.server";

/**
 * Système de TEST boutique — chaque fonction vérifie le rôle FONDATEUR / ADMIN
 * côté serveur avant toute action. Le navigateur ne transmet jamais de rôle.
 */

export type { TestDashboardDTO, TestPlayerDTO, TestProductDTO, TestTimelineEntryDTO };

export const getTestAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ allowed: boolean; roles: string[] }> => {
    const { assertAdmin } = await import("./admin-tests.server");
    try {
      const roles = await assertAdmin(context.supabase, context.userId);
      return { allowed: true, roles };
    } catch {
      return { allowed: false, roles: [] };
    }
  });

export const getTestDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const mod = await import("./admin-tests.server");
    await mod.assertAdmin(context.supabase, context.userId);
    const [dashboard, products] = await Promise.all([mod.loadDashboard(), mod.listTestProducts()]);
    return { dashboard, products };
  });

export const searchTestPlayers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { query: string }) => ({
    query: String(input?.query ?? "").slice(0, 64),
  }))
  .handler(async ({ data, context }) => {
    const mod = await import("./admin-tests.server");
    await mod.assertAdmin(context.supabase, context.userId);
    return mod.searchPlayers(data.query);
  });

export const createTestOrderFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playerId: string; productId: string; quantity: number }) => ({
    playerId: String(input?.playerId ?? ""),
    productId: String(input?.productId ?? ""),
    quantity: Number(input?.quantity ?? 1),
  }))
  .handler(async ({ data, context }) => {
    const mod = await import("./admin-tests.server");
    await mod.assertAdmin(context.supabase, context.userId);
    return mod.createTestOrder(context.userId, data);
  });

export const simulateTestPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => ({ orderId: String(input?.orderId ?? "") }))
  .handler(async ({ data, context }) => {
    const mod = await import("./admin-tests.server");
    await mod.assertAdmin(context.supabase, context.userId);
    return mod.simulatePayment(context.userId, data.orderId);
  });

export const createTestDeliveryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => ({ orderId: String(input?.orderId ?? "") }))
  .handler(async ({ data, context }) => {
    const mod = await import("./admin-tests.server");
    await mod.assertAdmin(context.supabase, context.userId);
    return mod.createTestDelivery(context.userId, data.orderId);
  });

export const simulateTestDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { deliveryId: string }) => ({ deliveryId: String(input?.deliveryId ?? "") }))
  .handler(async ({ data, context }) => {
    const mod = await import("./admin-tests.server");
    await mod.assertAdmin(context.supabase, context.userId);
    return mod.simulateDelivery(context.userId, data.deliveryId);
  });

export const failTestDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { deliveryId: string; reason?: string }) => ({
    deliveryId: String(input?.deliveryId ?? ""),
    reason: input?.reason ? String(input.reason).slice(0, 200) : undefined,
  }))
  .handler(async ({ data, context }) => {
    const mod = await import("./admin-tests.server");
    await mod.assertAdmin(context.supabase, context.userId);
    return mod.failDelivery(context.userId, data.deliveryId, data.reason);
  });

export const retryTestDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { deliveryId: string }) => ({ deliveryId: String(input?.deliveryId ?? "") }))
  .handler(async ({ data, context }) => {
    const mod = await import("./admin-tests.server");
    await mod.assertAdmin(context.supabase, context.userId);
    return mod.retryDelivery(context.userId, data.deliveryId);
  });

export const getTestTimeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => ({ orderId: String(input?.orderId ?? "") }))
  .handler(async ({ data, context }): Promise<TestTimelineEntryDTO[]> => {
    const mod = await import("./admin-tests.server");
    await mod.assertAdmin(context.supabase, context.userId);
    return mod.loadTimeline(data.orderId);
  });
