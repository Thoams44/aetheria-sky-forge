ALTER TABLE public.vote_milestones
  ADD COLUMN IF NOT EXISTS aether_coins_reward bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_reward text;

ALTER TABLE public.vote_milestones ALTER COLUMN shards_reward SET DEFAULT 0;
UPDATE public.vote_milestones SET shards_reward = 0 WHERE shards_reward IS DISTINCT FROM 0;

UPDATE public.vote_milestones SET aether_coins_reward = 8 WHERE vote_count_required = 10;
UPDATE public.vote_milestones SET aether_coins_reward = 16 WHERE vote_count_required = 25;
UPDATE public.vote_milestones SET aether_coins_reward = 28 WHERE vote_count_required = 50;
UPDATE public.vote_milestones SET aether_coins_reward = 40 WHERE vote_count_required = 75;
UPDATE public.vote_milestones SET aether_coins_reward = 80 WHERE vote_count_required = 100;
UPDATE public.vote_milestones SET aether_coins_reward = 120, bonus_reward = 'Clé spéciale — nom à définir' WHERE vote_count_required = 150;

ALTER TABLE public.player_milestone_claims
  ADD COLUMN IF NOT EXISTS aether_coins_granted bigint NOT NULL DEFAULT 0;