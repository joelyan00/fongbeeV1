-- ============================================
-- 用户通知/收件箱表
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 通知类型
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    -- 类型: order_status, quote_received, payment, review_reminder, promotion, system
    
    -- 通知内容
    title VARCHAR(255) NOT NULL,
    content TEXT,
    
    -- 关联数据 (可选)
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    related_provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- 额外数据 (JSON)
    extra_data JSONB DEFAULT '{}',
    
    -- 状态
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 索引
    CONSTRAINT valid_type CHECK (type IN ('order_status', 'quote_received', 'payment', 'review_reminder', 'promotion', 'system', 'message'))
);

-- 索引优化查询
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 启用 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的通知
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- 用户可以更新自己的通知（标记已读）
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 仅服务端可以插入通知
CREATE POLICY "Service role can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

COMMENT ON TABLE notifications IS '用户通知/收件箱';
COMMENT ON COLUMN notifications.type IS '通知类型: order_status, quote_received, payment, review_reminder, promotion, system, message';
COMMENT ON COLUMN notifications.extra_data IS '额外数据，如跳转链接、图标等';
