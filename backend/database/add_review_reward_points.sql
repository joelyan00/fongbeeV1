-- Add review_reward_points to provider_profiles
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS review_reward_points INTEGER DEFAULT 0;

COMMENT ON COLUMN provider_profiles.review_reward_points IS 'Number of points rewarded to users for submitting a review';
