-- Add submission_type column to differentiate between user requests and provider listings
-- Run this in Supabase SQL Editor

-- Add submission_type column
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS submission_type VARCHAR(30) DEFAULT 'user_request' 
CHECK (submission_type IN ('user_request', 'provider_listing'));

-- Add listing_status column for provider listing applications
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS listing_status VARCHAR(20) 
CHECK (listing_status IN ('pending', 'approved', 'rejected'));

-- Add reviewed_by for tracking who approved/rejected
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

-- Add reviewed_at timestamp
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Add rejection_reason
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add provider_id to link to the provider who created this listing
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES users(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_submission_type ON submissions(submission_type);
CREATE INDEX IF NOT EXISTS idx_submissions_listing_status ON submissions(listing_status);
CREATE INDEX IF NOT EXISTS idx_submissions_provider_id ON submissions(provider_id);

-- Update existing submissions to be user_request type
UPDATE submissions SET submission_type = 'user_request' WHERE submission_type IS NULL;
