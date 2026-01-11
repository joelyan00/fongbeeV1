-- Add schedule column to provider_profiles table
-- Run this script in your Supabase SQL Editor

ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '[]';
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS holidays JSONB DEFAULT '[]';
