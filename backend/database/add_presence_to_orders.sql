
-- Add presence tracking columns to orders table for SMS suppression and inbox aggregation
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_last_active_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_last_active_at TIMESTAMPTZ;

-- Refresh schema cache if needed (Supabase usually handles this)
COMMENT ON COLUMN orders.user_last_active_at IS 'Last time the user was active in the chat for this order';
COMMENT ON COLUMN orders.provider_last_active_at IS 'Last time the provider was active in the chat for this order';
