-- ============================================
-- User Sessions Table for Device Management
-- ============================================
-- Tracks active login sessions per user
-- Enables limiting to max 3 devices
-- Auto-kicks oldest device when limit exceeded
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,  -- SHA256 hash of the JWT token
    device_info TEXT,                  -- User-Agent string
    device_name VARCHAR(255),          -- Parsed friendly device name
    ip_address VARCHAR(45),            -- IPv4 or IPv6
    location VARCHAR(255),             -- City/Country from IP (optional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason VARCHAR(100)        -- 'manual', 'device_limit', 'password_change', etc.
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active) WHERE is_active = true;

-- Comment
COMMENT ON TABLE user_sessions IS 'Tracks active user login sessions for device management';
