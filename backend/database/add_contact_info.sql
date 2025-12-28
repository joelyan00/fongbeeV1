-- Add service_phone and email columns to provider_profiles table
ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS service_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS email VARCHAR(100);
