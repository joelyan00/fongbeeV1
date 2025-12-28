-- Add deposit_price column to service_quotes table
ALTER TABLE service_quotes ADD COLUMN IF NOT EXISTS deposit_price DECIMAL(10, 2) DEFAULT 0.00;
