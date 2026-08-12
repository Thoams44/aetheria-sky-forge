-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('player', 'staff', 'admin', 'founder');

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- staff-or-above helper
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('staff', 'admin', 'founder')
  );
$$;

-- admin-or-above helper
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'founder')
  );
$$;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- ============ GRADES ============
CREATE TABLE public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric(10,2),
  currency text NOT NULL DEFAULT 'EUR',
  color text,
  icon text,
  advantages jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.grades TO anon;
GRANT SELECT ON public.grades TO authenticated;
GRANT ALL ON public.grades TO service_role;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active grades are public"
  ON public.grades FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins manage grades"
  ON public.grades FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER grades_set_updated_at
  BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.grades (name, slug, description, price, color, icon, advantages, display_order) VALUES
  ('VIP',    'vip',    NULL, NULL, '#C77DFF', 'crown',    '[]'::jsonb, 1),
  ('MVP',    'mvp',    NULL, NULL, '#8A2BE2', 'gem',      '[]'::jsonb, 2),
  ('ELITE',  'elite',  NULL, NULL, '#A855F7', 'sparkles', '[]'::jsonb, 3),
  ('ULTIME', 'ultime', NULL, NULL, '#FACC15', 'star',     '[]'::jsonb, 4);

-- ============ PLAYERS ============
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  minecraft_uuid uuid UNIQUE,
  minecraft_username text,
  verified boolean NOT NULL DEFAULT false,
  grade_id uuid REFERENCES public.grades(id) ON DELETE SET NULL,
  grade_obtained_at timestamptz,
  grade_expires_at timestamptz,
  aether_coins_balance bigint NOT NULL DEFAULT 0 CHECK (aether_coins_balance >= 0),
  shards_balance bigint NOT NULL DEFAULT 0 CHECK (shards_balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz
);

CREATE INDEX players_minecraft_username_idx ON public.players (lower(minecraft_username));

GRANT SELECT, INSERT, UPDATE ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players read own profile"
  ON public.players FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff read all players"
  ON public.players FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins manage players"
  ON public.players FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER players_set_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- helper: current player's id
CREATE OR REPLACE FUNCTION public.current_player_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1;
$$;