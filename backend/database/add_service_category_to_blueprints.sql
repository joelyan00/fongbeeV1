-- Phase 1: Add service_category field to service_blueprints table
-- This allows blueprints to be associated with specific service categories

-- Add service_category column
ALTER TABLE service_blueprints 
ADD COLUMN IF NOT EXISTS service_category VARCHAR(100);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_blueprints_service_category 
ON service_blueprints(service_category);

-- Update existing blueprints with service categories
-- Match based on blueprint name
UPDATE service_blueprints 
SET service_category = '清洁服务' 
WHERE name LIKE '%清洁%' AND service_category IS NULL;

UPDATE service_blueprints 
SET service_category = '搬家服务' 
WHERE name LIKE '%搬家%' AND service_category IS NULL;

-- Verify the changes
SELECT id, name, category, service_category, status 
FROM service_blueprints 
WHERE status = 'published';
