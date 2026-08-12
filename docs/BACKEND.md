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
| `vote_milestones` | 6 paliers cumulatifs : 10, 25, 50, 75, 100, 150 (Éclats à définir) |
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
- Les paliers donnent des **Éclats** (monnaie de vote), jamais des Aether Coins.
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
