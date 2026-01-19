-- Migration to add reply fields to order_reviews table
ALTER TABLE order_reviews ADD COLUMN IF NOT EXISTS reply_content TEXT;
ALTER TABLE order_reviews ADD COLUMN IF NOT EXISTS reply_at TIMESTAMPTZ;

COMMENT ON COLUMN order_reviews.reply_content IS 'Provider reply to the customer review';
COMMENT ON COLUMN order_reviews.reply_at IS 'Timestamp when the provider replied';
