-- ---------------------------------------------------------
-- 修复数据库缺少的字段 (Run this in Supabase SQL Editor)
-- ---------------------------------------------------------

-- 1. 确保服务商档案表存在
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 补齐缺失的字段 (使用 IF NOT EXISTS 防止报错)
ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS service_city TEXT;

ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS languages TEXT;

ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS id_front_url TEXT;

ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS id_back_url TEXT;

ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS company_address TEXT;

ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS business_scope TEXT;

ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(200);

ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS service_categories JSONB DEFAULT '[]';

-- 3. 验证更新 (可选，查看列信息)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'provider_profiles';
