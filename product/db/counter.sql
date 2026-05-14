-- Visit counter table + atomic increment function
create table if not exists visit_counter (
  id int primary key default 1 check (id = 1),
  count bigint not null default 0
);

insert into visit_counter (id, count) values (1, 0) on conflict do nothing;

create or replace function increment_visit_counter()
returns bigint
language sql
as $$
  update visit_counter set count = count + 1 where id = 1 returning count;
$$;
