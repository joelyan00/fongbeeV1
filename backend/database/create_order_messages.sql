-- Create order_messages table for in-app chat
CREATE TABLE IF NOT EXISTS order_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON order_messages(order_id);

-- Optional: Notifications link (already exists)
-- This table will store persistent chat history between user and provider for a specific order.
