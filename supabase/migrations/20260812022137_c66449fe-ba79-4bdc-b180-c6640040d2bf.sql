-- ============ ENUMS ============
CREATE TYPE public.currency_type AS ENUM ('AETHER_COINS', 'SHARDS');
CREATE TYPE public.transaction_type AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE public.vote_status AS ENUM ('PENDING', 'VALIDATED', 'REWARDED', 'REJECTED');

-- ============ CURRENCY TRANSACTIONS ============
CREATE TABLE public.currency_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  currency_type public.currency_type NOT NULL,
  amount bigint NOT NULL,
  type public.transaction_type NOT NULL,
  reason text NOT NULL,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX currency_transactions_player_idx ON public.currency_transactions (player_id, created_at DESC);

GRANT SELECT ON public.currency_transactions TO authenticated;
GRANT ALL ON public.currency_transactions TO service_role;
ALTER TABLE public.currency_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players read own transactions"
  ON public.currency_transactions FOR SELECT TO authenticated
  USING (player_id = public.current_player_id());

CREATE POLICY "Staff read all transactions"
  ON public.currency_transactions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins manage transactions"
  ON public.currency_transactions FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============ VOTE PLATFORMS ============
CREATE TABLE public.vote_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  vote_url text,
  cooldown_seconds integer NOT NULL DEFAULT 86400,
  enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vote_platforms TO anon, authenticated;
GRANT ALL ON public.vote_platforms TO service_role;
ALTER TABLE public.vote_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enabled platforms are public"
  ON public.vote_platforms FOR SELECT TO anon, authenticated
  USING (enabled = true);

CREATE POLICY "Admins manage platforms"
  ON public.vote_platforms FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER vote_platforms_set_updated_at
  BEFORE UPDATE ON public.vote_platforms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.vote_platforms (name, slug, description, icon, vote_url, cooldown_seconds, display_order) VALUES
  ('Plateforme 1', 'plateforme-1', 'Plateforme de vote à définir.', 'compass', NULL, 86400, 1),
  ('Plateforme 2', 'plateforme-2', 'Plateforme de vote à définir.', 'globe',   NULL, 86400, 2),
  ('Plateforme 3', 'plateforme-3', 'Plateforme de vote à définir.', 'star',    NULL, 43200, 3),
  ('Plateforme 4', 'plateforme-4', 'Plateforme de vote à définir.', 'sparkles',NULL, 43200, 4);

-- ============ VOTES ============
CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES public.vote_platforms(id) ON DELETE RESTRICT,
  voted_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  status public.vote_status NOT NULL DEFAULT 'PENDING',
  reward_claimed boolean NOT NULL DEFAULT false,
  external_vote_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- anti double-reward: one row per external vote id per platform
CREATE UNIQUE INDEX votes_platform_external_unique
  ON public.votes (platform_id, external_vote_id)
  WHERE external_vote_id IS NOT NULL;

CREATE INDEX votes_player_idx ON public.votes (player_id, voted_at DESC);

GRANT SELECT ON public.votes TO authenticated;
GRANT ALL ON public.votes TO service_role;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players read own votes"
  ON public.votes FOR SELECT TO authenticated
  USING (player_id = public.current_player_id());

CREATE POLICY "Staff read all votes"
  ON public.votes FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins manage votes"
  ON public.votes FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============ VOTE MILESTONES ============
CREATE TABLE public.vote_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_count_required integer NOT NULL UNIQUE,
  shards_reward bigint,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vote_milestones TO anon, authenticated;
GRANT ALL ON public.vote_milestones TO service_role;
ALTER TABLE public.vote_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active milestones are public"
  ON public.vote_milestones FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins manage milestones"
  ON public.vote_milestones FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER vote_milestones_set_updated_at
  BEFORE UPDATE ON public.vote_milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.vote_milestones (vote_count_required, shards_reward, display_order) VALUES
  (10, NULL, 1), (25, NULL, 2), (50, NULL, 3), (75, NULL, 4), (100, NULL, 5), (150, NULL, 6);

-- ============ MILESTONE CLAIMS ============
CREATE TABLE public.player_milestone_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  milestone_id uuid NOT NULL REFERENCES public.vote_milestones(id) ON DELETE CASCADE,
  shards_granted bigint NOT NULL DEFAULT 0,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_id, milestone_id)
);

GRANT SELECT ON public.player_milestone_claims TO authenticated;
GRANT ALL ON public.player_milestone_claims TO service_role;
ALTER TABLE public.player_milestone_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players read own claims"
  ON public.player_milestone_claims FOR SELECT TO authenticated
  USING (player_id = public.current_player_id());

CREATE POLICY "Staff read all claims"
  ON public.player_milestone_claims FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins manage claims"
  ON public.player_milestone_claims FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));