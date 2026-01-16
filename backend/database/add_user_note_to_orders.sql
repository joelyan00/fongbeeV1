-- Add user_note column to orders table
-- Indicates special instructions or messages from the user to the provider

ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_note TEXT;

COMMENT ON COLUMN orders.user_note IS 'Optional message from user to provider at time of order';
