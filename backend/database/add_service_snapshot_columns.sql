-- Add snapshot columns to store service title and description at the time of order creation
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_title TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_description TEXT;

-- Optional: Add a comment to explain the purpose of these columns
COMMENT ON COLUMN orders.service_title IS 'Snapshot of the service title at the time of order creation';
COMMENT ON COLUMN orders.service_description IS 'Snapshot of the service description at the time of order creation';
