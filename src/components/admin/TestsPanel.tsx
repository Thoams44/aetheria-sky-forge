import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  Crown,
  FlaskConical,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { AetherButton } from "@/components/aether/AetherButton";
import {
  createTestDeliveryFn,
  createTestOrderFn,
  failTestDelivery,
  getTestDashboard,
  getTestTimeline,
  retryTestDelivery,
  searchTestPlayers,
  simulateTestDelivery,
  simulateTestPayment,
  type TestPlayerDTO,
} from "@/lib/backend/admin-tests.functions";
import {
  deliveryStatusLabel,
  deliveryStatusTone,
  formatDate,
  orderStatusLabel,
  orderStatusTone,
} from "@/data/account";
import { cn } from "@/lib/utils";

const auditLabels: Record<string, string> = {
  TEST_ORDER_CREATED: "Commande TEST créée",
  TEST_PAYMENT_SIMULATED: "Paiement simulé",
  TEST_DELIVERY_CREATED: "Livraison créée",
  TEST_DELIVERY_FAILED: "Livraison en échec",
  TEST_DELIVERY_RETRY: "Nouvelle tentative",
  TEST_DELIVERY_COMPLETED: "Livraison terminée",
};

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface/50 p-5", className)}>{children}</div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card className="text-center">
      <p className={cn("text-2xl font-semibold", tone)}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </Card>
  );
}

export function TestsPanel() {
  const queryClient = useQueryClient();
  const fetchDashboard = useServerFn(getTestDashboard);
  const searchFn = useServerFn(searchTestPlayers);
  const createOrder = useServerFn(createTestOrderFn);
  const payFn = useServerFn(simulateTestPayment);
  const createDelivery = useServerFn(createTestDeliveryFn);
  const deliverFn = useServerFn(simulateTestDelivery);
  const failFn = useServerFn(failTestDelivery);
  const retryFn = useServerFn(retryTestDelivery);
  const timelineFn = useServerFn(getTestTimeline);

  const [query, setQuery] = useState("");
  const [player, setPlayer] = useState<TestPlayerDTO | null>(null);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dashboardQuery = useQuery({
    queryKey: ["admin-tests"],
    queryFn: () => fetchDashboard(),
    retry: false,
  });

  const products = dashboardQuery.data?.products ?? [];
  const dashboard = dashboardQuery.data?.dashboard;
  const orders = dashboard?.orders ?? [];
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId],
  );

  const searchMutation = useMutation({
    mutationFn: (q: string) => searchFn({ data: { query: q } }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-tests"] });

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(ok);
      await refresh();
      await queryClient.invalidateQueries({ queryKey: ["admin-tests-timeline"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action impossible.");
    }
  };

  const timelineQuery = useQuery({
    queryKey: ["admin-tests-timeline", openOrder],
    queryFn: () => timelineFn({ data: { orderId: openOrder as string } }),
    enabled: Boolean(openOrder),
    retry: false,
  });

  const preview = selectedProduct
    ? selectedProduct.type === "GRADE"
      ? `[TEST] AetheriaSky\nLe joueur recevrait le grade ${selectedProduct.name.replace(/^Grade\s+/i, "").toUpperCase()}.`
      : `[TEST] AetheriaSky\nLe joueur recevrait ${((selectedProduct.quantity ?? 0) * quantity).toLocaleString("fr-FR")} Aether Coins.`
    : null;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-premium/40 bg-premium/10 p-5">
        <div className="flex items-center gap-2 text-premium">
          <FlaskConical size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">Mode test</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Les actions effectuées ici n'utilisent aucun paiement réel et n'envoient aucune récompense
          réelle dans Minecraft.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Tests" value={dashboard?.stats.total ?? 0} tone="text-foreground" />
        <StatCard label="Réussis" value={dashboard?.stats.delivered ?? 0} tone="text-success" />
        <StatCard label="Échoués" value={dashboard?.stats.failed ?? 0} tone="text-destructive" />
        <StatCard
          label="Livraisons en attente"
          value={dashboard?.stats.pending ?? 0}
          tone="text-secondary"
        />
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">Nouveau test</h2>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Joueur cible</p>
            <div className="mt-3 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pseudo Minecraft ou UUID"
                className="h-11 flex-1 rounded-full border border-border bg-background/60 px-4 text-sm text-foreground outline-none focus:border-secondary/50"
              />
              <AetherButton
                type="button"
                variant="outline"
                onClick={() => searchMutation.mutate(query)}
                disabled={searchMutation.isPending}
              >
                <Search size={15} /> Rechercher
              </AetherButton>
            </div>

            <div className="mt-3 space-y-2">
              {(searchMutation.data ?? []).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlayer(p)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left text-sm transition-colors",
                    player?.id === p.id
                      ? "border-secondary/50 bg-secondary/10"
                      : "border-border bg-background/40 hover:border-secondary/40",
                  )}
                >
                  <span className="font-semibold text-foreground">{p.username ?? "Sans pseudo"}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{p.uuid ?? "UUID non lié"}</span>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Grade : {p.gradeName ?? "Joueur"} • {p.verified ? "Compte vérifié" : "Non vérifié"}
                  </div>
                </button>
              ))}
              {searchMutation.isSuccess && (searchMutation.data ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">Aucun joueur trouvé.</p>
              )}
            </div>
          </div>

          <div>
            <p className="eyebrow">Produit</p>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="mt-3 h-11 w-full rounded-full border border-border bg-background/60 px-4 text-sm text-foreground outline-none focus:border-secondary/50"
            >
              <option value="">Choisir un produit…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.type === "GRADE" ? "Grade" : "Aether Coins"} — {p.name}
                </option>
              ))}
            </select>

            {selectedProduct && selectedProduct.type !== "GRADE" && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs text-muted-foreground">Quantité</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                  className="h-10 w-24 rounded-full border border-border bg-background/60 px-4 text-sm text-foreground outline-none focus:border-secondary/50"
                />
              </div>
            )}

            {preview && (
              <div className="mt-4 rounded-xl border border-border bg-background/50 p-4">
                <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                  Aperçu du message Minecraft (prévisualisation uniquement)
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-foreground">{preview}</pre>
              </div>
            )}

            <AetherButton
              type="button"
              className="mt-5"
              disabled={!player || !productId}
              onClick={() =>
                run(
                  () =>
                    createOrder({
                      data: { playerId: player?.id ?? "", productId, quantity },
                    }),
                  "Commande TEST créée (statut En attente).",
                )
              }
            >
              Créer la commande TEST
            </AetherButton>
          </div>
        </div>
      </Card>

      {message && (
        <p className="rounded-xl border border-success/40 bg-success/10 p-3 text-sm text-success">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Historique des tests</h2>
          <AetherButton type="button" variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw size={14} /> Actualiser
          </AetherButton>
        </div>

        {dashboardQuery.isLoading && <p className="mt-4 text-sm text-muted-foreground">Chargement…</p>}
        {!dashboardQuery.isLoading && orders.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">Aucun test enregistré pour le moment.</p>
        )}

        <div className="mt-4 space-y-4">
          {orders.map((order) => {
            const delivery = order.delivery;
            const isOpen = openOrder === order.id;
            return (
              <Card key={order.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-foreground">{order.orderNumber}</span>
                      <span className="rounded-full border border-premium/40 bg-premium/10 px-2 py-0.5 text-[0.65rem] font-semibold text-premium">
                        TEST
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold",
                          orderStatusTone[order.status] ?? "border-border text-muted-foreground",
                        )}
                      >
                        {orderStatusLabel[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.player.username ?? "Joueur inconnu"} •{" "}
                      {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")} •{" "}
                      {order.total === null ? "Prix à définir" : `${order.total} ${order.currency}`} •{" "}
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Lancé par : {order.actorEmail ?? "—"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === "PENDING" && (
                      <AetherButton
                        size="sm"
                        onClick={() =>
                          run(
                            () => payFn({ data: { orderId: order.id } }),
                            "Paiement simulé — aucun paiement réel.",
                          )
                        }
                      >
                        Simuler le paiement
                      </AetherButton>
                    )}
                    {order.status === "PAID" && !delivery && (
                      <AetherButton
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          run(
                            () => createDelivery({ data: { orderId: order.id } }),
                            "Livraison TEST créée.",
                          )
                        }
                      >
                        Créer la livraison TEST
                      </AetherButton>
                    )}
                    {delivery && delivery.status !== "DELIVERED" && delivery.status !== "FAILED" && (
                      <>
                        <AetherButton
                          size="sm"
                          onClick={() =>
                            run(
                              () => deliverFn({ data: { deliveryId: delivery.id } }),
                              "Livraison simulée — aucune récompense réelle n'a été envoyée dans Minecraft.",
                            )
                          }
                        >
                          <CheckCircle2 size={14} /> Simuler la livraison
                        </AetherButton>
                        <AetherButton
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            run(
                              () => failFn({ data: { deliveryId: delivery.id } }),
                              "Échec simulé enregistré.",
                            )
                          }
                        >
                          <XCircle size={14} /> Simuler un échec
                        </AetherButton>
                      </>
                    )}
                    {delivery?.status === "FAILED" && (
                      <AetherButton
                        size="sm"
                        variant="premium"
                        onClick={() =>
                          run(
                            () => retryFn({ data: { deliveryId: delivery.id } }),
                            "Nouvelle tentative lancée.",
                          )
                        }
                      >
                        <RefreshCw size={14} /> Réessayer la livraison
                      </AetherButton>
                    )}
                    <AetherButton
                      size="sm"
                      variant="ghost"
                      onClick={() => setOpenOrder(isOpen ? null : order.id)}
                    >
                      {isOpen ? "Masquer" : "Détail"}
                    </AetherButton>
                  </div>
                </div>

                {delivery && (
                  <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {delivery.type === "GRADE" ? <Crown size={14} /> : <Coins size={14} />}
                      <span className="text-foreground">Livraison {delivery.type}</span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 font-semibold",
                          deliveryStatusTone[delivery.status] ?? "border-border text-muted-foreground",
                        )}
                      >
                        {deliveryStatusLabel[delivery.status] ?? delivery.status}
                      </span>
                      <span className="text-muted-foreground">Tentatives : {delivery.attempts}</span>
                      {delivery.deliveredAt && (
                        <span className="text-muted-foreground">
                          Livrée le {formatDate(delivery.deliveredAt)}
                        </span>
                      )}
                    </div>
                    {delivery.preview && (
                      <pre className="mt-3 whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                        {delivery.preview}
                      </pre>
                    )}
                    {delivery.lastError && (
                      <p className="mt-2 flex items-center gap-2 text-xs text-destructive">
                        <AlertTriangle size={13} /> {delivery.lastError}
                      </p>
                    )}
                  </div>
                )}

                {isOpen && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="eyebrow">Timeline</p>
                    {timelineQuery.isLoading && (
                      <p className="mt-2 text-xs text-muted-foreground">Chargement…</p>
                    )}
                    <ol className="mt-3 space-y-3">
                      {(timelineQuery.data ?? []).map((entry, index) => (
                        <li key={`${entry.action}-${index}`} className="flex gap-3 text-sm">
                          <Clock size={14} className="mt-1 shrink-0 text-secondary" />
                          <div>
                            <p className="text-foreground">{auditLabels[entry.action] ?? entry.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleString("fr-FR")} • {entry.actorEmail ?? "—"}
                            </p>
                          </div>
                        </li>
                      ))}
                      {timelineQuery.isSuccess && (timelineQuery.data ?? []).length === 0 && (
                        <p className="text-xs text-muted-foreground">Aucun événement enregistré.</p>
                      )}
                    </ol>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TestsForbidden() {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <div className="flex items-center gap-2 text-destructive">
        <ShieldAlert size={18} />
        <span className="text-sm font-semibold">Accès refusé</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Cet espace est réservé aux rôles FONDATEUR et ADMIN. Les rôles STAFF et PLAYER n'y ont pas accès.
      </p>
    </Card>
  );
}
