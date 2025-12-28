-- Create notifications table
-- Using gen_random_uuid() which is available in Postgres 13+ by default
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'quote_received', 'system', etc.
    title VARCHAR(255),
    content TEXT,
    related_id UUID, -- Optional link to other tables
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster unread count
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
