-- Add rejection_reason column to provider_profiles table
ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
