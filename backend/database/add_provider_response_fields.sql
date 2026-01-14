-- Provider Response Fields Migration
-- Adds fields for provider order notification and response tracking

-- Token for magic link authentication
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_access_token text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_token_expires_at timestamptz;

-- Provider response tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_response_status text DEFAULT 'pending';
  -- Values: pending, accepted, rejected, negotiating

-- Proposed service time (when provider suggests a time)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS proposed_service_time timestamptz;

-- Provider message/notes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_message text;

-- Timestamp when provider responded
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_responded_at timestamptz;

-- Index for token lookup
CREATE INDEX IF NOT EXISTS idx_orders_provider_token ON orders(provider_access_token) WHERE provider_access_token IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN orders.provider_response_status IS 'pending=waiting, accepted=confirmed, rejected=declined, negotiating=discussing details';
