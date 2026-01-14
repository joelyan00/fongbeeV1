-- Add photos column to order_reviews table
ALTER TABLE order_reviews ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
