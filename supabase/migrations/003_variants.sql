-- creative_variants: multiple hook/format variants per concept
create table creative_variants (
  id                  uuid primary key default uuid_generate_v4(),
  concept_id          text not null references concepts(id) on delete cascade,
  hook_type           text,
  hook_line           text,
  hook_text_overlay   text,
  format              text,
  platform            text,
  duration_seconds    int,
  language            text not null default 'en',
  notes               text,
  sort_order          int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index on creative_variants(concept_id);
create trigger t_variants_upd before update on creative_variants for each row execute function set_updated_at();
