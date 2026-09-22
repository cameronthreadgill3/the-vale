create table if not exists realm_names (
  name_key text primary key,
  name text not null,
  user_id text not null,
  slot integer not null,
  claimed_at timestamptz not null default now()
);

create unique index if not exists realm_names_user_slot on realm_names (user_id, slot);

create table if not exists realm_presence (
  session_id text primary key,
  user_id text not null,
  name text not null,
  class_id text not null,
  level integer not null default 1,
  location_id text not null,
  x real not null,
  y real not null,
  facing real not null default 0,
  hp real not null default 1,
  max_hp real not null default 1,
  seen_at timestamptz not null default now()
);

create index if not exists realm_presence_loc on realm_presence (location_id, seen_at);
create index if not exists realm_presence_user on realm_presence (user_id);

create table if not exists realm_chat (
  id bigserial primary key,
  location_id text not null,
  from_name text not null,
  body text not null,
  at timestamptz not null default now()
);

create index if not exists realm_chat_loc_at on realm_chat (location_id, at desc);
