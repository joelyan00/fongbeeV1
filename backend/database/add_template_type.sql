-- Add template_type column to service_blueprints
ALTER TABLE service_blueprints 
ADD COLUMN IF NOT EXISTS template_type VARCHAR(50) DEFAULT 'standard_service';

-- Comment on column
COMMENT ON COLUMN service_blueprints.template_type IS 'Type of the template: standard_service, simple_custom, complex_custom';
