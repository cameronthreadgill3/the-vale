create table if not exists subscribers (
  user_id    text primary key,
  status     text not null default 'none',
  period_end timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists subscribers_status_idx on subscribers (status);
