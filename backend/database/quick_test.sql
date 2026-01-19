-- ============================================================
-- 快速测试脚本 - 积分与订阅系统
-- ============================================================
-- 说明：在Supabase SQL Editor中执行此脚本
-- 或者复制 001_create_credits_subscription_tables.sql 的内容

-- 1. 检查表是否已存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'custom_service_categories',
  'subscription_plans',
  'user_subscriptions'
);

-- 如果上面的查询返回0行，说明需要运行迁移
-- 请执行：backend/database/migrations/001_create_credits_subscription_tables.sql

-- 2. 如果表已存在，检查默认数据
SELECT name, quote_credits_cost FROM custom_service_categories;
-- 应该返回5个类别

SELECT name, tier, price_monthly, included_credits, included_standard_listings 
FROM subscription_plans;
-- 应该返回3个套餐

-- 3. 检查视图
SELECT * FROM active_user_subscriptions LIMIT 1;

-- 4. 为现有服务商设置默认用户类型（如果还没设置）
UPDATE providers 
SET user_type = 'credits' 
WHERE user_type IS NULL;

-- 验证
SELECT user_type, COUNT(*) FROM providers GROUP BY user_type;

-- 5. 创建一个测试订阅（可选）
-- 注意：替换 USER_ID 为实际的用户ID
/*
INSERT INTO user_subscriptions (
  user_id, 
  plan_id, 
  status, 
  start_date, 
  end_date,
  remaining_credits, 
  remaining_listings
) VALUES (
  'YOUR_USER_ID',  -- 替换为实际用户ID
  (SELECT id FROM subscription_plans WHERE tier = 'basic' LIMIT 1),
  'active',
  NOW(),
  NOW() + INTERVAL '1 month',
  100,
  5
);
*/

-- 6. 测试查询
-- 查看所有活跃订阅
SELECT 
  user_email,
  plan_name,
  remaining_credits,
  remaining_listings,
  end_date
FROM active_user_subscriptions;

-- 查看积分交易记录
SELECT * FROM credits_transactions ORDER BY created_at DESC LIMIT 10;

-- 完成！
SELECT '✅ 数据库检查完成' as status;
