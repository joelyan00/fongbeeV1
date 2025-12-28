ALTER TABLE banners ADD COLUMN IF NOT EXISTS target_cities JSONB DEFAULT '["all"]'::jsonb;
