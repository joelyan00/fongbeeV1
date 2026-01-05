-- Migration: Add 'draft' status to submissions table
-- Run this in Supabase SQL Editor to update your existing table.

-- 1. Drop the existing constraint (using IF EXISTS to avoid errors if it has a different name or doesn't exist)
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;

-- 2. Add the new constraint including 'draft'
ALTER TABLE submissions ADD CONSTRAINT submissions_status_check 
CHECK (status IN ('draft', 'pending', 'processing', 'completed', 'cancelled'));

-- 3. Verify the change (Optional, just ensures no error)
COMMENT ON COLUMN submissions.status IS 'Status of the submission: draft, pending, processing, completed, cancelled';
