ALTER TABLE provider_services ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}';
COMMENT ON COLUMN provider_services.form_data IS 'Store dynamic form responses based on template';
