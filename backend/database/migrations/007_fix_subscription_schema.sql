-- Combine missing columns and view update into one migration script

-- 1. Add missing columns to user_subscriptions table
ALTER TABLE user_subscriptions 
    ADD COLUMN IF NOT EXISTS next_plan_id UUID REFERENCES subscription_plans(id),
    ADD COLUMN IF NOT EXISTS upgrade_notes TEXT;

-- 2. Add index for pending plan changes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_next_plan 
    ON user_subscriptions(next_plan_id) 
    WHERE next_plan_id IS NOT NULL;

-- 3. Add column comments
COMMENT ON COLUMN user_subscriptions.next_plan_id IS '预约的下一个套餐ID（用于降级场景）';
COMMENT ON COLUMN user_subscriptions.upgrade_notes IS '升级/降级备注信息';

-- 4. Recreate the view with the new columns
DROP VIEW IF EXISTS active_user_subscriptions;

CREATE OR REPLACE VIEW active_user_subscriptions AS
SELECT 
    us.*,
    sp.name as plan_name,
    sp.tier as plan_tier,
    sp.included_credits,
    sp.included_standard_listings,
    u.email as user_email,
    pp.company_name as provider_name,
    nsp.name as next_plan_name
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN subscription_plans nsp ON us.next_plan_id = nsp.id
JOIN users u ON us.user_id = u.id
LEFT JOIN provider_profiles pp ON pp.user_id = u.id
WHERE us.status = 'active' 
    AND us.end_date > NOW();
