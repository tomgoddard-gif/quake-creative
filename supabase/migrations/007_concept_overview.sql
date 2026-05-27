-- 007_concept_overview.sql
-- Adds concept_overview (format-agnostic creative direction)
-- and production_complexity (ugc | mid | professional) to concepts.

ALTER TABLE concepts ADD COLUMN IF NOT EXISTS concept_overview text;
ALTER TABLE concepts ADD COLUMN IF NOT EXISTS production_complexity text;
