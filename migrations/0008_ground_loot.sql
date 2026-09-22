create table if not exists ground_loot (
  id text primary key,
  location_id text not null,
  x integer not null,
  y integer not null,
  item text,
  qty integer not null default 1,
  gold integer not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists ground_loot_loc_exp on ground_loot (location_id, expires_at);
