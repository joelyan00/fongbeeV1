-- Migration: create referral_links table
-- Stores short link mapping for referral flow.
-- Run with Supabase or PostgreSQL client.

CREATE TABLE referral_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    invite_ref VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    signature TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Index for fast lookup by token
CREATE INDEX IF NOT EXISTS idx_referral_token ON referral_links(token);
