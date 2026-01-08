-- Add service_city column to provider_services table
-- This column stores the city/cities where the service is available

ALTER TABLE provider_services 
ADD COLUMN IF NOT EXISTS service_city TEXT[];

-- Add index for faster city-based lookups
CREATE INDEX IF NOT EXISTS idx_provider_services_service_city ON provider_services USING GIN (service_city);

COMMENT ON COLUMN provider_services.service_city IS 'Array of cities where the service is available';
