-- Add missing columns to provider_profiles table
-- Run this script in your Supabase SQL Editor to fix the "missing column" error

ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS business_scope TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS license_url TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS service_categories JSONB DEFAULT '[]';
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS service_city TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS languages TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS id_front_url TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS id_back_url TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}';

-- Ensure users table has correct constraints if not already
-- (Optional, just to be safe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'provider'));
    END IF;
END $$;
