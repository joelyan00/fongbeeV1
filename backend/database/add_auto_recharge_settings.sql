-- Add Auto-Recharge Settings to Provider Profiles
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS auto_recharge_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS auto_recharge_amount INTEGER DEFAULT 0;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS auto_recharge_threshold INTEGER DEFAULT 0;
