-- Migration: Add support for subscription upgrades and downgrades
-- This adds fields to track scheduled plan changes

ALTER TABLE user_subscriptions 
    ADD COLUMN IF NOT EXISTS next_plan_id UUID REFERENCES subscription_plans(id),
    ADD COLUMN IF NOT EXISTS upgrade_notes TEXT;

-- Add index for querying subscriptions with pending plan changes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_next_plan 
    ON user_subscriptions(next_plan_id) 
    WHERE next_plan_id IS NOT NULL;

-- Add new status values for subscription lifecycle
-- 'active' - currently active subscription
-- 'cancelled' - user cancelled
-- 'expired' - subscription period ended
-- 'upgraded' - replaced by a higher-tier subscription
-- 'pending' - awaiting payment

COMMENT ON COLUMN user_subscriptions.next_plan_id IS '预约的下一个套餐ID（用于降级场景）';
COMMENT ON COLUMN user_subscriptions.upgrade_notes IS '升级/降级备注信息';
