-- 检查数据库中是否已存在积分和订阅相关的表

-- 1. 检查所有表名
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. 检查是否存在积分相关的表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
    table_name LIKE '%credit%' 
    OR table_name LIKE '%subscription%'
    OR table_name LIKE '%plan%'
    OR table_name LIKE '%member%'
)
ORDER BY table_name;

-- 3. 检查 providers 表的结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'providers'
ORDER BY ordinal_position;

-- 4. 检查 provider_profiles 表的结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'provider_profiles'
ORDER BY ordinal_position;

-- 5. 检查是否存在 credits_transactions 表
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'credits_transactions'
) as credits_transactions_exists;

-- 6. 如果存在，查看其结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'credits_transactions'
ORDER BY ordinal_position;
