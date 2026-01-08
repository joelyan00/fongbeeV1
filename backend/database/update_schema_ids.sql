-- Add business IDs to database schema

-- 1. Add member_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_member_id ON users(member_id);

-- 2. Add service_identity_id to provider_services table
-- This ID stays the same across different versions/applications of the service
ALTER TABLE provider_services ADD COLUMN IF NOT EXISTS service_identity_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_provider_services_identity_id ON provider_services(service_identity_id);

-- 3. Create provider_service_applications table
-- This tracks the history of service submissions/updates
CREATE TABLE IF NOT EXISTS provider_service_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES provider_services(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES users(id),
    application_no TEXT UNIQUE NOT NULL, -- The unique SA-ID for this submission
    service_identity_id TEXT, -- Snapshot of the service identity ID
    snapshot_data JSONB NOT NULL DEFAULT '{}', -- Full copy of the service data at this point
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    admin_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_applications_no ON provider_service_applications(application_no);
CREATE INDEX IF NOT EXISTS idx_service_applications_service_id ON provider_service_applications(service_id);
CREATE INDEX IF NOT EXISTS idx_service_applications_provider_id ON provider_service_applications(provider_id);

-- Add simple RLS policies for the new table
ALTER TABLE provider_service_applications ENABLE ROW LEVEL SECURITY;

-- Providers can see their own applications
CREATE POLICY "Providers can view own applications" ON provider_service_applications
    FOR SELECT USING (auth.uid() = provider_id);

-- Service Role (Backend) implies full access, usually handled by bypassing RLS or service role key unique handling.
-- But we can add a policy just in case.
CREATE POLICY "Service role full access applications" ON provider_service_applications
    FOR ALL USING (auth.role() = 'service_role');
