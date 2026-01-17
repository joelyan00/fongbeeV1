-- Provider Credits and Pricing Configuration System
-- Phase 1: Credits, SMS Quota, and Pricing Configuration

-- 1. Add credits fields to users table for providers
ALTER TABLE users ADD COLUMN IF NOT EXISTS purchased_credits INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_credits INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_sms_used INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_sms_quota INT DEFAULT 50;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_quota_notified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create system pricing configuration table
CREATE TABLE IF NOT EXISTS system_pricing_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    config_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean
    category VARCHAR(50) DEFAULT 'general', -- credits, sms, subscription
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for system_pricing_config
ALTER TABLE system_pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to system_pricing_config" ON system_pricing_config
    FOR ALL USING (
        exists (select 1 from users where id = auth.uid() and role = 'admin')
    );

CREATE POLICY "Service role full access to system_pricing_config" ON system_pricing_config
    FOR ALL USING (auth.role() = 'service_role');

-- Read access for authenticated users (to check pricing)
CREATE POLICY "Authenticated users can read system_pricing_config" ON system_pricing_config
    FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_system_pricing_config_updated_at ON system_pricing_config;
CREATE TRIGGER update_system_pricing_config_updated_at
    BEFORE UPDATE ON system_pricing_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Insert default pricing configuration
INSERT INTO system_pricing_config (config_key, config_value, config_type, category, description) VALUES
-- Credits settings
('credits_per_cad', '100', 'number', 'credits', '1加币可购买的积分数'),
('credits_per_service_listing', '10', 'number', 'credits', '上架一个标准服务消耗的积分'),
('credits_per_quote', '5', 'number', 'credits', '响应一个订单/报价消耗的积分'),

-- SMS settings (for non-subscribers / credits users)
('free_sms_quota_credits_user', '50', 'number', 'sms', '积分用户每月免费短信条数'),
('sms_price_per_msg', '0.02', 'number', 'sms', '超额短信单价（加币）'),
('sms_low_balance_threshold', '10', 'number', 'sms', '低余额提醒阈值（剩余条数）'),

-- Subscription tier settings (placeholders for Phase 2)
('sub_basic_monthly_price', '19.99', 'number', 'subscription', '初级会员月费（加币）'),
('sub_basic_monthly_credits', '100', 'number', 'subscription', '初级会员每月赠送积分'),
('sub_basic_sms_quota', '100', 'number', 'subscription', '初级会员每月免费短信'),
('sub_basic_service_limit', '5', 'number', 'subscription', '初级会员可上架服务数'),

('sub_premium_monthly_price', '49.99', 'number', 'subscription', '高级会员月费（加币）'),
('sub_premium_monthly_credits', '300', 'number', 'subscription', '高级会员每月赠送积分'),
('sub_premium_sms_quota', '300', 'number', 'subscription', '高级会员每月免费短信'),
('sub_premium_service_limit', '20', 'number', 'subscription', '高级会员可上架服务数'),

('sub_vip_monthly_price', '99.99', 'number', 'subscription', 'VIP会员月费（加币）'),
('sub_vip_monthly_credits', '1000', 'number', 'subscription', 'VIP会员每月赠送积分'),
('sub_vip_sms_quota', '-1', 'number', 'subscription', 'VIP会员每月免费短信（-1表示无限）'),
('sub_vip_service_limit', '-1', 'number', 'subscription', 'VIP会员可上架服务数（-1表示无限）')
ON CONFLICT (config_key) DO NOTHING;

-- 4. Create credits transaction log table (for auditing)
CREATE TABLE IF NOT EXISTS credits_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'subscription_grant', 'consume', 'refund', 'admin_adjust'
    amount INT NOT NULL, -- positive for add, negative for consume
    balance_after INT, -- balance after this transaction
    credits_type VARCHAR(20) DEFAULT 'purchased', -- 'purchased' or 'monthly'
    description TEXT,
    reference_id UUID, -- order_id, service_id, etc.
    reference_type VARCHAR(50), -- 'order', 'service_listing', 'quote', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for credits_transactions
ALTER TABLE credits_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit transactions" ON credits_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role full access to credits_transactions" ON credits_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_credits_transactions_user_id ON credits_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_transactions_created_at ON credits_transactions(created_at);
