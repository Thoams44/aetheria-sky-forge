# Backend AetheriaSky — structure de la base

Base PostgreSQL standard (portable : les migrations SQL vivent dans `supabase/migrations/`
et peuvent être rejouées sur n'importe quel Postgres, OVH inclus).

## Tables

| Table | Rôle |
| --- | --- |
| `user_roles` | rôle d'un compte : `player`, `staff`, `admin`, `founder` |
| `players` | identité Minecraft (`minecraft_uuid` = identifiant principal), pseudo, `verified`, grade, soldes |
| `grades` | VIP / MVP / ELITE / ULTIME — prix et `advantages` à définir |
| `currency_transactions` | historique `AETHER_COINS` / `SHARDS` (CREDIT / DEBIT + `reason`) |
| `vote_platforms` | 4 plateformes fictives, cooldown, URL à définir |
| `votes` | statuts `PENDING` / `VALIDATED` / `REWARDED` / `REJECTED`, index unique `(platform_id, external_vote_id)` anti double-récompense |
| `vote_milestones` | 6 paliers cumulatifs : 10→8 AC, 25→16 AC, 50→28 AC, 75→40 AC, 100→80 AC, 150→120 AC + clé spéciale (`bonus_reward`) |
| `player_milestone_claims` | palier réclamé une seule fois par joueur (contrainte unique) |
| `store_products` | types `GRADE` et `AETHER_COINS` (packs 500/1000/2500/5000) |
| `orders` | `order_number` auto, statuts complets, `mode` = `REAL` ou `TEST` |
| `order_items` | lignes de commande |
| `deliveries` | livraison en jeu (`GRADE`, `AETHER_COINS`, `SHARDS`, `VOTE_KEY`, `CUSTOM`), `attempts`, `next_attempt_at`, `last_error` -> reprise automatique |
| `leaderboard_entries` | classements (`PLAYERS` / `ISLANDS` / `VOTERS`) par période |
| `audit_logs` | journal des actions sensibles |

## Règles importantes

- Une commande payée n'est **jamais** considérée livrée : la livraison passe par `deliveries`.
- Chaque vote validé donnera **1 Clé de Vote** via une ligne `deliveries` de type `VOTE_KEY`.
- Les paliers donnent des **Aether Coins** (`aether_coins_reward`). Les Éclats (`SHARDS`) restent dans l'architecture pour un usage futur.
- Les commandes `mode = TEST` ne déclenchent jamais de paiement réel (réservé admin/fondateur).

## Sécurité (RLS)

- **PUBLIC** : grades actifs, produits actifs, plateformes activées, paliers actifs, classements.
- **PLAYER** : uniquement ses propres données.
- **STAFF** : lecture de toutes les données joueurs.
- **ADMIN / FOUNDER** : écriture (grades, prix, produits, soldes, récompenses, remboursements, commandes de test) + journal d'audit.

Fonctions de contrôle : `public.has_role`, `public.is_staff`, `public.is_admin`, `public.current_player_id`.

## Couche applicative

- `src/lib/backend/catalog.functions.ts` : lectures publiques.
- `src/lib/backend/account.functions.ts` : lectures privées de l'espace joueur (authentifiées).

L'interface actuelle utilise encore les données fictives de `src/data/*` : le branchement se fera à l'étape suivante.

## Système de TEST boutique (FONDATEUR / ADMIN)

Page privée `/admin/tests` — parcours simulé de bout en bout, sans paiement réel
ni contact avec Minecraft / AetheriaCore.

- Rôles autorisés : `fondateur` (nouveau) et `admin`. `staff` et `player` sont refusés.
- Le rôle est vérifié **côté serveur** dans chaque server function
  (`src/lib/backend/admin-tests.functions.ts` → `assertAdmin`), jamais côté navigateur.
- Logique métier : `src/lib/backend/admin-tests.server.ts` (prix et totaux relus en base,
  commandes strictement `mode = TEST`, jamais convertibles en `REAL`).
- Actions journalisées dans `audit_logs` : `TEST_ORDER_CREATED`, `TEST_PAYMENT_SIMULATED`,
  `TEST_DELIVERY_CREATED`, `TEST_DELIVERY_FAILED`, `TEST_DELIVERY_RETRY`,
  `TEST_DELIVERY_COMPLETED`.
- Aucune monnaie réelle créditée, aucun grade réel modifié : la livraison TEST stocke
  seulement un aperçu du futur message Minecraft dans `deliveries.payload`.
