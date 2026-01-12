-- Add notes column to service_verifications table to support provider text input
ALTER TABLE service_verifications ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing records if needed (optional)
-- COMMENT ON COLUMN service_verifications.notes IS 'Provider description/notes for service start or acceptance';
