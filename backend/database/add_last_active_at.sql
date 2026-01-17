-- Add last_active_at column to users table to track online status
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Create an index to speed up online status checks
CREATE INDEX IF NOT EXISTS idx_users_last_active_at ON users (last_active_at);
