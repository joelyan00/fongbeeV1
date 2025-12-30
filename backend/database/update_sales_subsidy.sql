-- Add bonus_enabled column to sales_profiles
ALTER TABLE sales_profiles ADD COLUMN IF NOT EXISTS bonus_enabled BOOLEAN DEFAULT FALSE;
