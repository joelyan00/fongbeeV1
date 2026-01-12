-- Propagate status updates to submissions table
-- First drop existing constraint
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;

-- Add new constraint with all used statuses
ALTER TABLE submissions 
ADD CONSTRAINT submissions_status_check 
CHECK (status IN (
    'draft', 
    'pending', 
    'pending_deposit', 
    'processing', 
    'in_progress', 
    'service_started', 
    'pending_verification', 
    'completed', 
    'cancelled',
    'captured' -- Just in case
));

-- Ensure deposit_status and related columns exist (just in case)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(50) DEFAULT 'unpaid';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS balance_status VARCHAR(50) DEFAULT 'unpaid';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMP WITH TIME ZONE;
