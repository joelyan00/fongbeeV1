-- ============================================
-- 服务验收流程 - 数据库迁移
-- ============================================

-- 1. 创建 order_verifications 表
CREATE TABLE IF NOT EXISTS order_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('service_start', 'completion', 'rework_request', 'rework_completion')),
    submitted_by VARCHAR(20) NOT NULL CHECK (submitted_by IN ('provider', 'user')),
    photos TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_order_verifications_order_id ON order_verifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_verifications_type ON order_verifications(type);

-- 2. 更新 orders 表
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rework_count INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS verification_deadline TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_transferred_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(20) DEFAULT 'non_escrow' CHECK (transaction_type IN ('non_escrow', 'escrow'));

-- 3. 添加系统配置项
INSERT INTO system_settings (key, value, description)
VALUES 
    ('deposit_ratio', '20', '定金比例（%），最低20%'),
    ('platform_commission_with_partner', '5', '平台佣金比例（有合伙人时，%）'),
    ('platform_commission_no_partner', '10', '平台佣金比例（无合伙人时，%）'),
    ('sales_partner_commission', '5', '销售合伙人佣金比例（%）'),
    ('auto_complete_hours', '48', '用户无响应自动完成时间（小时）')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. 创建订单评价表（如果不存在）
CREATE TABLE IF NOT EXISTS order_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id),
    rating_professionalism INT CHECK (rating_professionalism >= 1 AND rating_professionalism <= 5),
    rating_attitude INT CHECK (rating_attitude >= 1 AND rating_attitude <= 5),
    rating_punctuality INT CHECK (rating_punctuality >= 1 AND rating_punctuality <= 5),
    rating_overall INT CHECK (rating_overall >= 1 AND rating_overall <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_reviews_order_id ON order_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_order_reviews_provider_id ON order_reviews(provider_id);

-- 5. RLS 策略
ALTER TABLE order_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_reviews ENABLE ROW LEVEL SECURITY;

-- order_verifications policies
DROP POLICY IF EXISTS "Service account full access to order_verifications" ON order_verifications;
CREATE POLICY "Service account full access to order_verifications" ON order_verifications
    FOR ALL USING (true) WITH CHECK (true);

-- order_reviews policies  
DROP POLICY IF EXISTS "Service account full access to order_reviews" ON order_reviews;
CREATE POLICY "Service account full access to order_reviews" ON order_reviews
    FOR ALL USING (true) WITH CHECK (true);

SELECT 'Migration completed successfully!' as result;
