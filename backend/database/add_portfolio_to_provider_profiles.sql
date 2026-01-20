-- Add portfolio column to provider_profiles table
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS portfolio JSONB DEFAULT '[]';

-- Comment explaining the column
COMMENT ON COLUMN provider_profiles.portfolio IS 'Array of image URLs representing the provider business portfolio/gallery';
