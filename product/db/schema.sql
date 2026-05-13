-- The Great Migration · Vue 3 Upgrade Day
-- Run this in the Supabase SQL Editor (or `supabase db reset`) to bootstrap.

-- ─── players ────────────────────────────────────────────────────────────────
create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  email       text unique,
  name        text not null,
  avatar      text not null default '🦊',
  points      integer not null default 0,
  victories   integer not null default 0,
  gems        integer not null default 0,
  latest      text,
  inserted_at timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── codes (registry) ───────────────────────────────────────────────────────
-- type: 'point' | 'trivia' | 'crossword' | 'challenge' | 'victory' | 'super'
create table if not exists public.codes (
  code            text primary key,
  type            text not null,
  value           integer not null default 0,
  is_super_code   boolean not null default false,
  single_use      boolean not null default false,
  is_used         boolean not null default false,
  used_by         uuid references public.players(id),
  used_at         timestamptz,
  active_after    timestamptz,
  inserted_at     timestamptz not null default now()
);

-- ─── redemptions (audit log) ────────────────────────────────────────────────
create table if not exists public.code_redemptions (
  id         uuid primary key default gen_random_uuid(),
  player_id  uuid not null references public.players(id) on delete cascade,
  code       text not null references public.codes(code),
  awarded    integer not null,
  multiplier numeric(4,2) not null default 1,
  is_super   boolean not null default false,
  redeemed_at timestamptz not null default now()
);

-- ─── game config (singleton row id=1) ───────────────────────────────────────
create table if not exists public.game_config (
  id                 integer primary key default 1,
  multiplier         numeric(4,2) not null default 1,
  multiplier_ends_at timestamptz,
  super_code         text references public.codes(code),
  super_winner       uuid references public.players(id),
  super_won_at       timestamptz,
  updated_at         timestamptz not null default now(),
  check (id = 1)
);

insert into public.game_config (id, multiplier) values (1, 1)
  on conflict (id) do nothing;

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.players          enable row level security;
alter table public.codes            enable row level security;
alter table public.code_redemptions enable row level security;
alter table public.game_config      enable row level security;

-- Anyone authenticated (or anon, for the POC) can read leaderboard + config.
drop policy if exists "read players"     on public.players;
drop policy if exists "read codes"       on public.codes;
drop policy if exists "read redemptions" on public.code_redemptions;
drop policy if exists "read config"      on public.game_config;

create policy "read players"     on public.players          for select using (true);
create policy "read codes"       on public.codes            for select using (true);
create policy "read redemptions" on public.code_redemptions for select using (true);
create policy "read config"      on public.game_config      for select using (true);

-- Writes go through server routes using the service-role key, so no INSERT/UPDATE
-- policies are exposed to anon/authenticated clients. Add them later if you wire
-- direct client writes.

-- ─── realtime ───────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.game_config;
alter publication supabase_realtime add table public.code_redemptions;
