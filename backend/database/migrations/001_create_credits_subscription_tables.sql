-- ============================================================
-- Credits and Subscription System - Database Migration
-- ============================================================

-- 1. Custom Service Categories Table
-- Stores configurable quote credit costs per service category
CREATE TABLE IF NOT EXISTS custom_service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    quote_credits_cost INTEGER NOT NULL DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active categories
CREATE INDEX IF NOT EXISTS idx_custom_service_categories_active 
    ON custom_service_categories(is_active);

-- Insert default categories
INSERT INTO custom_service_categories (name, description, quote_credits_cost) VALUES
('小型维修', '小额维修服务，如修水龙头、换灯泡、小家电维修等', 5),
('中型服务', '中等规模服务，如家电维修、小面积装修、管道疏通等', 15),
('大型工程', '大额工程服务，如整屋装修、大型设备安装、工程项目等', 50),
('紧急服务', '紧急上门服务，需要快速响应', 30),
('其他服务', '未分类的定制服务', 20)
ON CONFLICT DO NOTHING;

-- 2. Subscription Plans Table
-- Stores subscription tier configurations
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    tier VARCHAR(50) NOT NULL, -- 'basic', 'professional', 'premium'
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    included_credits INTEGER NOT NULL DEFAULT 0,
    included_standard_listings INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active 
    ON subscription_plans(is_active, sort_order);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, tier, price_monthly, price_yearly, included_credits, included_standard_listings, description, features, sort_order) VALUES
(
    '基础版', 
    'basic', 
    29.99, 
    299.99, 
    100, 
    5, 
    '适合个人服务商，提供基础功能',
    '{"features": ["100积分/月", "5次标准服务上架", "基础客服支持", "数据统计"]}'::jsonb,
    1
),
(
    '专业版', 
    'professional', 
    99.99, 
    999.99, 
    500, 
    20, 
    '适合小型团队，提供专业功能',
    '{"features": ["500积分/月", "20次标准服务上架", "优先客服支持", "高级数据分析", "营销工具"]}'::jsonb,
    2
),
(
    '高级版', 
    'premium', 
    299.99, 
    2999.99, 
    2000, 
    100, 
    '适合大型服务商，提供全部功能',
    '{"features": ["2000积分/月", "100次标准服务上架", "专属客服经理", "定制报表", "API访问", "优先展示"]}'::jsonb,
    3
)
ON CONFLICT DO NOTHING;

-- 3. User Subscriptions Table
-- Tracks user subscription status and remaining quotas
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'pending'
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    remaining_credits INTEGER NOT NULL DEFAULT 0,
    remaining_listings INTEGER NOT NULL DEFAULT 0,
    auto_renew BOOLEAN DEFAULT true,
    payment_method VARCHAR(50), -- 'stripe', 'alipay', 'wechat'
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user 
    ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status 
    ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date 
    ON user_subscriptions(end_date);

-- 4. Extend Credits Transactions Table
-- Add columns to track subscription and service category
ALTER TABLE credits_transactions 
    ADD COLUMN IF NOT EXISTS service_category_id UUID REFERENCES custom_service_categories(id),
    ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES user_subscriptions(id),
    ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50); -- 'quote', 'listing', 'purchase', 'subscription_grant', 'refund'

-- Index for transaction types
CREATE INDEX IF NOT EXISTS idx_credits_transactions_type 
    ON credits_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credits_transactions_category 
    ON credits_transactions(service_category_id);

-- 5. Extend Provider Profiles Table (if exists)
-- Add user type and active subscription tracking
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'provider_profiles') THEN
        ALTER TABLE provider_profiles 
            ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'credits', -- 'credits' or 'subscription'
            ADD COLUMN IF NOT EXISTS active_subscription_id UUID REFERENCES user_subscriptions(id);
        
        -- Index for user type
        CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_type 
            ON provider_profiles(user_type);
        
        RAISE NOTICE 'Extended provider_profiles table successfully';
    ELSE
        RAISE NOTICE 'Table provider_profiles does not exist, skipping extension';
    END IF;
END $$;


-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_custom_service_categories_updated_at ON custom_service_categories;
CREATE TRIGGER update_custom_service_categories_updated_at 
    BEFORE UPDATE ON custom_service_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Create view for active subscriptions
CREATE OR REPLACE VIEW active_user_subscriptions AS
SELECT 
    us.*,
    sp.name as plan_name,
    sp.tier as plan_tier,
    sp.included_credits,
    sp.included_standard_listings,
    u.email as user_email,
    pp.company_name as provider_name
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN users u ON us.user_id = u.id
LEFT JOIN provider_profiles pp ON pp.user_id = u.id
WHERE us.status = 'active' 
    AND us.end_date > NOW();

COMMENT ON TABLE custom_service_categories IS '定制服务类别配置表，存储每个类别的报价积分消耗';
COMMENT ON TABLE subscription_plans IS '订阅套餐配置表，存储不同级别的订阅方案';
COMMENT ON TABLE user_subscriptions IS '用户订阅记录表，跟踪订阅状态和剩余配额';
COMMENT ON VIEW active_user_subscriptions IS '活跃订阅视图，方便查询当前有效的订阅';
