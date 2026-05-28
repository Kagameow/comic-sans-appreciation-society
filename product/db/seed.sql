-- Seeds the code catalog only. Players are populated naturally as real
-- Visma Connect users sign in for the first time — no demo/decoy players.
-- Run after schema.sql.

insert into public.codes (code, type, value, is_super_code, single_use) values
  ('V3-READY',     'point',     50,  false, false),
  ('COMPOSITION',  'quiz',     100,  false, false),
  ('TELEPORT',     'point',     25,  false, false),
  ('PINIA',        'point',    100,  false, false),
  ('QUIZ',         'quiz',     100,  false, false),
  ('SETUP',        'crossword', 75,  false, false),
  ('CHALLENGE',    'challenge',150,  false, false),
  ('WHACK-BUGS',   'arcade',   500,  false, false),
  ('SNAKE-RUN',    'arcade',   500,  false, false),
  ('CATCH-PROPS',  'arcade',   500,  false, false),
  ('DART-WIN',     'victory',  150,  false, true),
  ('FOOSBALL-WIN', 'victory',  150,  false, true),
  ('POOL-WIN',     'victory',  150,  false, true),
  ('RPS-WIN',      'victory',  150,  false, true),
  ('TYPING-WIN',   'victory',  150,  false, true),
  ('MASTER-BRANCH','super',   1000,  true,  true)
on conflict (code) do nothing;

update public.game_config set super_code = 'MASTER-BRANCH' where id = 1 and super_code is null;
