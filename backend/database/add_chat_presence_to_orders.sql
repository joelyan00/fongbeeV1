-- Add presence tracking columns to orders table
-- This allows us to track when the user or provider last viewed the chat
-- for a specific order, to avoid sending redundant SMS notifications.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_last_active_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_last_active_at TIMESTAMPTZ;

-- Indices for performance (though these tables aren't massive, it's good practice)
CREATE INDEX IF NOT EXISTS idx_orders_user_last_active ON orders (user_last_active_at);
CREATE INDEX IF NOT EXISTS idx_orders_provider_last_active ON orders (provider_last_active_at);

-- Add comments for documentation
COMMENT ON COLUMN orders.user_last_active_at IS 'Last time the user active in the chat room for this order';
COMMENT ON COLUMN orders.provider_last_active_at IS 'Last time the provider active in the chat room for this order';
