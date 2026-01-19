-- ============================================================
-- FIX: Remove Duplicate Subscription Plans and Categories
-- ============================================================

-- 1. Cleanup subscription_plans
-- Keep only one entry for each tier, delete others
DELETE FROM subscription_plans 
WHERE id NOT IN (
    SELECT id 
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY tier ORDER BY created_at ASC) as rn 
        FROM subscription_plans
    ) sub 
    WHERE rn = 1
);

-- Add unique constraint to prevent future duplicates
-- We use a DO block to make it safe if the constraint already exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_plan_tier') THEN
        ALTER TABLE subscription_plans ADD CONSTRAINT unique_plan_tier UNIQUE (tier);
    END IF;
END $$;


-- 2. Cleanup custom_service_categories
-- Keep only one entry for each name, delete others
DELETE FROM custom_service_categories 
WHERE id NOT IN (
    SELECT id 
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn 
        FROM custom_service_categories
    ) sub 
    WHERE rn = 1
);

-- Add unique constraint to prevent future duplicates
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_category_name') THEN
        ALTER TABLE custom_service_categories ADD CONSTRAINT unique_category_name UNIQUE (name);
    END IF;
END $$;
