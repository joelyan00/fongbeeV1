-- Fix order_reviews table provider_id relationship
-- Existing provider_id column references provider_profiles(id), but backend uses user_id
-- We need to change the reference to users(id)

-- 1. Drop existing foreign key constraint if it exists
-- To find the constraint name, we might need a generic approach or assume standard naming
-- Supabase often uses [table]_[column]_fkey
ALTER TABLE order_reviews DROP CONSTRAINT IF EXISTS order_reviews_provider_id_fkey;

-- 2. Modify the column (it's already UUID) and add new constraint
ALTER TABLE order_reviews 
    ADD CONSTRAINT order_reviews_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES users(id);

-- Optional: If the table was and should be Unique per order, ensure it is
-- (It already has UNIQUE on order_id in some versions of the migration)
-- ALTER TABLE order_reviews ADD CONSTRAINT order_reviews_order_id_key UNIQUE (order_id);

COMMENT ON COLUMN order_reviews.provider_id IS 'References the users.id of the provider';
