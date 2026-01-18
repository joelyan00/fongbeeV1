-- ============================================
-- 修复: 如果表已存在但缺少列，添加缺失的列
-- ============================================

-- 方法1: 如果表不存在，创建完整表
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    content TEXT,
    related_order_id UUID,
    related_provider_id UUID,
    extra_data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 方法2: 如果表已存在但缺少列，添加它们
DO $$
BEGIN
    -- 添加 extra_data 列（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'extra_data') THEN
        ALTER TABLE notifications ADD COLUMN extra_data JSONB DEFAULT '{}';
    END IF;

    -- 添加 related_order_id 列（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'related_order_id') THEN
        ALTER TABLE notifications ADD COLUMN related_order_id UUID;
    END IF;

    -- 添加 related_provider_id 列（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'related_provider_id') THEN
        ALTER TABLE notifications ADD COLUMN related_provider_id UUID;
    END IF;

    -- 添加 read_at 列（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;
    END IF;
END $$;

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
