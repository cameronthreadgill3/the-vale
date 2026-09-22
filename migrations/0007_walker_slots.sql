-- Per-account Vale walkers (four slots).
create table if not exists walker_slots (
  user_id    text not null,
  slot       integer not null,
  payload    jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, slot)
);
create index if not exists walker_slots_user_id_idx on walker_slots (user_id);
