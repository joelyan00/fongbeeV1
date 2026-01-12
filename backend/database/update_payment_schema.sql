-- ============================================================
-- Update Orders Table for Payment & Verification Flow
-- ============================================================

-- 1. Add deposit_status to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(20) DEFAULT 'unpaid' 
CHECK (deposit_status IN (
    'unpaid',           -- Initial state
    'pending_auth',     -- Pre-authorized (Cooling-off)
    'held',             -- Captured by platform (Held)
    'released',         -- Released to provider wallet
    'refunded',         -- Refunded to user
    'forfeited'         -- Forfeited to provider (No-show/Late Cancel)
));

-- 2. Add verification fields directly to orders (if simple flow preferred)
-- Note: create_payment_system.sql uses `service_verifications` table, which is better.
-- We will stick to `service_verifications` for the detailed records.
-- But we might need a flag on orders to quickly check current step.

-- Ensure cooling_off_expires_at exists
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cooling_off_expires_at TIMESTAMP WITH TIME ZONE;

-- Add auto-acceptance timeout
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS auto_accept_at TIMESTAMP WITH TIME ZONE;

-- Index for cron jobs
CREATE INDEX IF NOT EXISTS idx_orders_cooling_off_expires ON orders(cooling_off_expires_at) WHERE deposit_status = 'pending_auth';
CREATE INDEX IF NOT EXISTS idx_orders_auto_accept_at ON orders(auto_accept_at) WHERE status = 'pending_acceptance';
