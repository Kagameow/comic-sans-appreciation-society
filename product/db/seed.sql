-- Seed data mirroring prototype/src/lib/mockData.ts + CodeCheck.tsx
-- Run after schema.sql.

insert into public.players (name, avatar, points, victories, gems, latest) values
  ('Daan Nagtegaal',     '🦊', 2840, 3, 3, 'Solved Crossword'),
  ('Marieke de Vries',   '🐼', 2710, 2, 2, 'Quiz +100'),
  ('Joris van Dijk',     '🦉', 2455, 4, 1, 'Won Darts Challenge'),
  ('Sanne Bakker',       '🦄', 2210, 1, 0, 'Code V3-READY'),
  ('Bram Janssen',       '🐺', 2050, 0, 0, 'Solved Quiz'),
  ('Eva Mulder',         '🦋', 1890, 1, 0, 'Code COMPOSITION'),
  ('Tim Visser',         '🐙', 1720, 0, 0, 'Crossword +75'),
  ('Lotte Smit',         '🦜', 1640, 2, 0, 'Migrated 12 files'),
  ('Ruben Peters',       '🐸', 1510, 0, 0, 'Code TELEPORT'),
  ('Fleur Hendriks',     '🦔', 1420, 1, 0, 'Quiz +50'),
  ('Niels van der Berg', '🐢', 1280, 0, 0, 'Solved Crossword'),
  ('Iris Brouwer',       '🦩', 1150, 0, 0, 'Code PINIA'),
  ('Thijs Maas',         '🐳', 1040, 0, 0, 'Quiz +100'),
  ('Anouk Vermeer',      '🦊',  920, 0, 0, 'Manual +10'),
  ('Sven Bos',           '🐯',  810, 0, 0, 'Code SETUP'),
on conflict do nothing;

insert into public.codes (code, type, value, is_super_code, single_use) values
  ('V3-READY',     'point',     50,  false, false),
  ('COMPOSITION',  'point',     75,  false, false),
  ('TELEPORT',     'point',     25,  false, false),
  ('PINIA',        'point',    100,  false, false),
  ('QUIZ',         'quiz',   100,  false, false),
  ('SETUP',        'crossword', 75,  false, false),
  ('CHALLENGE',    'challenge', 150, false, false),
  ('DART-WIN',     'victory',  150, false, true),
  ('FOOSBALL-WIN', 'victory',  150, false, true),
  ('POOL-WIN',     'victory',  150, false, true),
  ('RPS-WIN',      'victory',  150, false, true),
  ('TYPING-WIN',   'victory',  150, false, true),
  ('MASTER-BRANCH','super',   1000, true,  true)
on conflict (code) do nothing;

update public.game_config set super_code = 'MASTER-BRANCH' where id = 1;
