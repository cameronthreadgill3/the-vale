-- One innkeeper per house. Slot 1 is the only legal row.
create table if not exists kettle_keepers (
  slot       integer primary key default 1 check (slot = 1),
  user_id    text not null,
  claimed_at timestamptz not null default now()
);

create table if not exists kettle_keys (
  code         text primary key,
  months       integer not null default 1,
  created_by   text not null,
  created_at   timestamptz not null default now(),
  redeemed_by  text,
  redeemed_at  timestamptz
);
create index if not exists kettle_keys_created_by_idx on kettle_keys (created_by);
