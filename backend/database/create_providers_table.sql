-- Create providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    bio TEXT,
    experience_years INTEGER,
    service_radius_km INTEGER,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, suspended
    stripe_account_id TEXT,
    stripe_payouts_enabled BOOLEAN DEFAULT false,
    referred_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (optional for this fix but good practice)
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Insert a test provider matching the ID we used (f150b841-0e95-48c7-bf64-f3aaf9be1ef2)
-- Note: We used this ID for provider_id in the order. If provider_id references providers.id, we need a row here with that ID.
-- If provider_id references users.id, we still need this table for the join.

INSERT INTO providers (id, user_id, bio, status)
VALUES (
    'f150b841-0e95-48c7-bf64-f3aaf9be1ef2', 
    'f150b841-0e95-48c7-bf64-f3aaf9be1ef2', -- Referencing the same user for simplicity
    'Test Provider Bio', 
    'approved'
)
ON CONFLICT (id) DO UPDATE SET status = 'approved';
