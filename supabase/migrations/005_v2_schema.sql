-- ============================================================
-- Migration 005: V2 schema — Plan / Hooks / Briefs rebuild
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Replace personas with 6 ICPs
-- (cascade will clear any FK references in concepts)
DELETE FROM concepts;
DELETE FROM personas;

INSERT INTO personas (id, name, who_they_are, core_frustration, core_desire, core_fear, objection, campaign_fit, language) VALUES
('tourist_family',       'Tourist Family',                   'Parents travelling with children aged 6–14. In Lisbon for 3–7 days. Culturally curious but managing children''s energy.', 'Most attractions are either too adult or too childish.', 'One experience the whole family talks about afterwards.', 'Wasting money on something the kids complain about.', '€26 per adult is expensive when paying for a whole family.', ARRAY['tourist_in','tourist_out'], ARRAY['en','fr','es','de']),
('tourist_older_couple', 'Tourist Older Couple (no kids)',   'Couple aged 50+, travelling without children. Interested in history and authentic experiences.', 'Standard tourist attractions feel shallow — queues, crowds, no depth.', 'To genuinely understand the city they''re visiting. A story they can tell at home.', 'Spending limited time on something that doesn''t live up to the promise.', 'We''ve been to a lot of museums. Is this actually different?', ARRAY['tourist_in','tourist_out'], ARRAY['en','fr','de']),
('tourist_young_couple', 'Tourist Young Couple',             'Couple aged 25–40, in Lisbon for a city break. Looking for something more interesting than dinner and monuments.', 'City breaks blur into the same restaurants and viewpoints.', 'A shared experience that actually connects them. A story to tell, not just photos.', 'Looking stupid for suggesting something that turns out to be boring.', 'Is it just a museum? We''ve seen enough museums.', ARRAY['tourist_in','tourist_out'], ARRAY['en','fr','es']),
('local_family',         'Local Family',                     'Lisbon residents with children. Sceptical about tourist-priced attractions in their own city.', 'Most "must-see" Lisbon attractions are designed for tourists, not locals.', 'Something that makes them proud of their city and teaches their kids their own history.', 'Paying tourist prices for something their kids won''t care about.', 'We already know Lisbon. Why pay €26 for a museum about something we grew up hearing about?', ARRAY['local_pt'], ARRAY['pt','en']),
('local_older_couple',   'Local Older Couple (no kids)',     'Lisbon residents aged 50+. Have cultural blindness to their own city''s landmarks.', 'They think they already know everything worth knowing about Lisbon.', 'To be genuinely surprised by their own city. To see something familiar through new eyes.', 'Being made to feel like a tourist in their own city.', 'I lived through the 1969 earthquake. I don''t need a museum about earthquakes.', ARRAY['local_pt'], ARRAY['pt','en']),
('local_young_couple',   'Local Young Couple',               'Lisbon residents aged 25–40. Looking for something different to do on a date or weekend.', 'Date night in Lisbon defaults to dinner. Nothing in the middle ground.', 'A date they''ll still be talking about next week. Something that feels discovered.', 'Suggesting something their partner finds boring or uncool.', 'Sounds like something for tourists. Is this actually for us?', ARRAY['local_pt'], ARRAY['pt','en']);


-- 2. Update concepts table — add V2 fields
ALTER TABLE concepts
  ADD COLUMN IF NOT EXISTS icp_id text REFERENCES personas(id),
  ADD COLUMN IF NOT EXISTS entry_point text,
  ADD COLUMN IF NOT EXISTS insight text,
  ADD COLUMN IF NOT EXISTS angle_pain text,
  ADD COLUMN IF NOT EXISTS angle_desire text,
  ADD COLUMN IF NOT EXISTS core_message text,
  ADD COLUMN IF NOT EXISTS plan_stage int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS idea_seed text;

-- Extend status enum to include V2 statuses
ALTER TYPE concept_status ADD VALUE IF NOT EXISTS 'concept_confirmed';
ALTER TYPE concept_status ADD VALUE IF NOT EXISTS 'hooks_confirmed';
ALTER TYPE concept_status ADD VALUE IF NOT EXISTS 'complete';


-- 3. Create messages table (Stage 1 chat history)
CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id  text NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('user', 'assistant')),
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_concept_id_idx ON messages(concept_id);


-- 4. Create hooks table (Stage 2)
CREATE TABLE IF NOT EXISTS hooks (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id   text NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  hook_type    text,
  written_hook text,
  visual_hook  text,
  audio_hook   text,
  confirmed    boolean NOT NULL DEFAULT false,
  sort_order   int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hooks_concept_id_idx ON hooks(concept_id);


-- 5. Update briefs table — remove unique constraint, add V2 fields
ALTER TABLE briefs DROP CONSTRAINT IF EXISTS briefs_concept_id_key;

ALTER TABLE briefs
  ADD COLUMN IF NOT EXISTS hook_id      uuid REFERENCES hooks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS funnel_stage text,
  ADD COLUMN IF NOT EXISTS primary_text text,
  ADD COLUMN IF NOT EXISTS headline     text,
  ADD COLUMN IF NOT EXISTS cta_text     text,
  ADD COLUMN IF NOT EXISTS creative_idea text,
  ADD COLUMN IF NOT EXISTS talent_notes  text,
  ADD COLUMN IF NOT EXISTS audio_direction text,
  ADD COLUMN IF NOT EXISTS placement_specs text;


-- 6. Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id                text PRIMARY KEY DEFAULT 'quake',
  product_knowledge text,
  guardrails        text,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO app_settings (id) VALUES ('quake') ON CONFLICT (id) DO NOTHING;


-- 7. Updated_at trigger for new tables
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
