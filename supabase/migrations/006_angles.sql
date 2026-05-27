-- 006_angles.sql
-- Adds angles table as a first-class entity between personas and concepts.
-- Angles hold the narrative frame (prose + structured fields).
-- Multiple concepts can reference the same angle.

-- New angles table
CREATE TABLE IF NOT EXISTS angles (
  id text PRIMARY KEY,
  icp_id text REFERENCES personas(id),
  title text NOT NULL DEFAULT 'New angle',
  angle_narrative text,
  core_message text,
  pain_point text,
  benefit text,
  desired_response text,
  test_axis text,
  angle_type text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Link concepts to angles
ALTER TABLE concepts ADD COLUMN IF NOT EXISTS angle_id text REFERENCES angles(id);

-- New hook fields for V2 package format
ALTER TABLE hooks ADD COLUMN IF NOT EXISTS text_overlay text;
ALTER TABLE hooks ADD COLUMN IF NOT EXISTS why_it_works text;
