-- ============ ENUMS ============
CREATE TYPE public.product_type AS ENUM ('GRADE', 'AETHER_COINS');
CREATE TYPE public.order_status AS ENUM ('PENDING','PAID','PROCESSING','DELIVERED','FAILED','REFUNDED','CANCELLED');
CREATE TYPE public.order_mode AS ENUM ('REAL','TEST');
CREATE TYPE public.delivery_status AS ENUM ('PENDING','PROCESSING','DELIVERED','FAILED');
CREATE TYPE public.delivery_type AS ENUM ('GRADE','AETHER_COINS','SHARDS','VOTE_KEY','CUSTOM');
CREATE TYPE public.leaderboard_category AS ENUM ('PLAYERS','ISLANDS','VOTERS');
CREATE TYPE public.leaderboard_period AS ENUM ('DAY','WEEK','MONTH','ALL_TIME');

-- ============ STORE PRODUCTS ============
CREATE TABLE public.store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  type public.product_type NOT NULL,
  description text,
  price numeric(10,2),
  currency text NOT NULL DEFAULT 'EUR',
  quantity integer,
  grade_id uuid REFERENCES public.grades(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.store_products TO anon, authenticated;
GRANT ALL ON public.store_products TO service_role;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are public"
  ON public.store_products FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins manage products"
  ON public.store_products FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER store_products_set_updated_at
  BEFORE UPDATE ON public.store_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.store_products (name, slug, type, description, price, quantity, grade_id, display_order)
SELECT g.name, 'grade-' || g.slug, 'GRADE', NULL, NULL, NULL, g.id, g.display_order
FROM public.grades g;

INSERT INTO public.store_products (name, slug, type, description, price, quantity, display_order) VALUES
  ('500 Aether Coins',   'coins-500',  'AETHER_COINS', NULL, NULL, 500,  10),
  ('1000 Aether Coins',  'coins-1000', 'AETHER_COINS', NULL, NULL, 1000, 11),
  ('2500 Aether Coins',  'coins-2500', 'AETHER_COINS', NULL, NULL, 2500, 12),
  ('5000 Aether Coins',  'coins-5000', 'AETHER_COINS', NULL, NULL, 5000, 13);

-- ============ ORDERS ============
CREATE SEQUENCE public.order_number_seq START 1000;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('AET-' || nextval('public.order_number_seq')),
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  customer_email text,
  minecraft_username text,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  status public.order_status NOT NULL DEFAULT 'PENDING',
  mode public.order_mode NOT NULL DEFAULT 'REAL',
  payment_provider text,
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players read own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (player_id = public.current_player_id());

CREATE POLICY "Staff read all orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins manage orders"
  ON public.orders FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ORDER ITEMS ============
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.store_products(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric(10,2),
  total_price numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_items_order_idx ON public.order_items (order_id);

GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players read own order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.player_id = public.current_player_id()
  ));

CREATE POLICY "Staff read all order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins manage order items"
  ON public.order_items FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============ DELIVERIES ============
CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  delivery_type public.delivery_type NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.delivery_status NOT NULL DEFAULT 'PENDING',
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX deliveries_retry_idx ON public.deliveries (status, next_attempt_at);

GRANT SELECT ON public.deliveries TO authenticated;
GRANT ALL ON public.deliveries TO service_role;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players read own deliveries"
  ON public.deliveries FOR SELECT TO authenticated
  USING (player_id = public.current_player_id());

CREATE POLICY "Staff read all deliveries"
  ON public.deliveries FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins manage deliveries"
  ON public.deliveries FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER deliveries_set_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ LEADERBOARDS ============
CREATE TABLE public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.leaderboard_category NOT NULL,
  period public.leaderboard_period NOT NULL DEFAULT 'ALL_TIME',
  rank integer NOT NULL,
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  secondary_label text,
  score bigint NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  captured_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category, period, rank)
);

GRANT SELECT ON public.leaderboard_entries TO anon, authenticated;
GRANT ALL ON public.leaderboard_entries TO service_role;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboards are public"
  ON public.leaderboard_entries FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage leaderboards"
  ON public.leaderboard_entries FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============ AUDIT LOGS ============
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_id uuid,
  target_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_created_idx ON public.audit_logs (created_at DESC);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));