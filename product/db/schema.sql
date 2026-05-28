-- The Great Migration · Vue 3 Upgrade Day
-- Run this in the Supabase SQL Editor (or `supabase db reset`) to bootstrap.
-- Re-runnable: every CREATE / ALTER is guarded.

-- ─── players ────────────────────────────────────────────────────────────────
create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references auth.users(id) on delete cascade,
  email       text unique,
  name        text not null,
  avatar      text not null default '🦊',
  avatar_url  text,
  points      integer not null default 0,
  victories   integer not null default 0,
  gems        integer not null default 0,
  latest      text not null default 'Joined the migration',
  inserted_at timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.players add column if not exists user_id    uuid unique references auth.users(id) on delete cascade;
alter table public.players add column if not exists avatar_url text;
alter table public.codes add column if not exists per_player_limit boolean not null default false;

-- ─── codes (registry) ───────────────────────────────────────────────────────
-- type: 'point' | 'quiz' | 'crossword' | 'challenge' | 'arcade' | 'victory' | 'super'
create table if not exists public.codes (
  code            text primary key,
  type            text not null,
  value           integer not null default 0,
  is_super_code   boolean not null default false,
  single_use      boolean not null default false,
  per_player_limit boolean not null default false,
  is_used         boolean not null default false,
  used_by         uuid references public.players(id) on delete set null,
  used_at         timestamptz,
  active_after    timestamptz,
  inserted_at     timestamptz not null default now()
);

-- ─── redemptions (audit log) ────────────────────────────────────────────────
create table if not exists public.code_redemptions (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references public.players(id) on delete cascade,
  code        text not null references public.codes(code),
  awarded     integer not null,
  multiplier  numeric(4,2) not null default 1,
  is_super    boolean not null default false,
  redeemed_at timestamptz not null default now()
);

create index if not exists code_redemptions_player_code_idx on public.code_redemptions (player_id, code);

-- ─── game config (singleton row id=1) ───────────────────────────────────────
create table if not exists public.game_config (
  id                 integer primary key default 1,
  multiplier         numeric(4,2) not null default 1,
  multiplier_ends_at timestamptz,
  super_code         text references public.codes(code) on delete set null,
  super_winner       uuid references public.players(id) on delete set null,
  super_won_at       timestamptz,
  updated_at         timestamptz not null default now(),
  check (id = 1)
);

insert into public.game_config (id, multiplier) values (1, 1)
  on conflict (id) do nothing;

-- ─── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists players_touch on public.players;
create trigger players_touch before update on public.players
  for each row execute function public.touch_updated_at();

drop trigger if exists game_config_touch on public.game_config;
create trigger game_config_touch before update on public.game_config
  for each row execute function public.touch_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.players          enable row level security;
alter table public.codes            enable row level security;
alter table public.code_redemptions enable row level security;
alter table public.game_config      enable row level security;

drop policy if exists "read players"     on public.players;
drop policy if exists "read codes"       on public.codes;
drop policy if exists "read redemptions" on public.code_redemptions;
drop policy if exists "read config"      on public.game_config;

-- Anyone (anon or authenticated) can read leaderboard + config. The TV view
-- is public; writes go through server routes using the secret key.
create policy "read players"     on public.players          for select using (true);
create policy "read codes"       on public.codes            for select using (true);
create policy "read redemptions" on public.code_redemptions for select using (true);
create policy "read config"      on public.game_config      for select using (true);

-- ─── realtime ───────────────────────────────────────────────────────────────
-- Idempotent add to the supabase_realtime publication.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'players'
  ) then
    alter publication supabase_realtime add table public.players;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'game_config'
  ) then
    alter publication supabase_realtime add table public.game_config;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'code_redemptions'
  ) then
    alter publication supabase_realtime add table public.code_redemptions;
  end if;
end $$;
