
-- Add rating column to provider_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'rating') THEN
        ALTER TABLE public.provider_profiles ADD COLUMN rating NUMERIC DEFAULT 5.0;
    END IF;
END $$;
