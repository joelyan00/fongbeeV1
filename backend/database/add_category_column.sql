-- Add service_category column to submissions table for explicit category tracking
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS service_category TEXT;

-- Optional: Backfill existing data based on form_templates matching
-- Fix type mismatch (text vs uuid) by explicit casting
UPDATE submissions
SET service_category = form_templates.category
FROM form_templates
WHERE submissions.template_id::text = form_templates.id::text
AND submissions.service_category IS NULL;
