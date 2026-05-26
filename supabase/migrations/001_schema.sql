create extension if not exists "uuid-ossp";

-- personas
create table personas (
  id                text primary key,
  name              text not null,
  who_they_are      text,
  where_they_are    text,
  core_frustration  text,
  core_desire       text,
  core_fear         text,
  objection         text,
  trigger           text,
  cpa_benchmark     text,
  campaign_fit      text[],
  language          text[],
  notes             text,
  created_at        timestamptz not null default now()
);

-- concepts
create type concept_status as enum (
  'idea', 'briefed', 'in_production', 'live', 'paused', 'retired'
);

create table concepts (
  id           text primary key,
  title        text not null,
  persona_id   text references personas(id),
  campaign     text,
  platforms    text[],
  hook_type    text,
  angle_type   text,
  test_axis    text,
  status       concept_status not null default 'idea',
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ideas (creative ladder state — one per concept, persisted across sessions)
create table ideas (
  id                uuid primary key default uuid_generate_v4(),
  concept_id        text not null references concepts(id) on delete cascade unique,
  selected_insight  text,
  selected_angle    text,
  selected_hook     text,
  insight_options   jsonb,
  angle_options     jsonb,
  hook_options      jsonb,
  current_step      int not null default 1,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- briefs
create type brief_status as enum ('draft', 'awaiting_approval', 'approved', 'rejected');

create table briefs (
  id                uuid primary key default uuid_generate_v4(),
  concept_id        text not null references concepts(id) on delete cascade unique,
  persona_id        text references personas(id),
  insight           text,
  angle             text,
  hook              text,
  hook_type         text,
  angle_type        text,
  key_message       text,
  call_to_action    text,
  visual_direction  text,
  copy_notes        text,
  format            text,
  duration_seconds  int,
  platform          text,
  shot_list         jsonb,
  audio_strategy    text,
  talent_notes      text,
  language_variants jsonb,
  why_it_works      text,
  production_notes  text,
  status            brief_status not null default 'draft',
  client_comment    text,
  approved_by       text,
  approved_at       timestamptz,
  ad_id             text,
  live_date         date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- meta_performance (cached — TTL 1 hour)
create table meta_performance (
  id           uuid primary key default uuid_generate_v4(),
  ad_id        text not null unique,
  ad_name      text not null,
  ad_status    text,
  concept_id   text references concepts(id),
  ctr          numeric(6,4),
  frequency    numeric(6,4),
  spend        numeric(12,2),
  cpa          numeric(12,2),
  impressions  bigint,
  clicks       bigint,
  last_synced  timestamptz not null default now()
);

-- indexes
create index on concepts(status);
create index on concepts(persona_id);
create index on meta_performance(frequency);
create index on meta_performance(ctr desc);
create index on meta_performance(last_synced);

-- updated_at triggers
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger t_concepts_upd before update on concepts for each row execute function set_updated_at();
create trigger t_ideas_upd    before update on ideas    for each row execute function set_updated_at();
create trigger t_briefs_upd   before update on briefs   for each row execute function set_updated_at();
