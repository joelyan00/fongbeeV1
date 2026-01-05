-- Youfujia Home Services Database Schema
-- Run this in Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ Users Table ============
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'provider')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    avatar_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============ Form Templates Table ============
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'custom' CHECK (type IN ('standard', 'custom')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    color VARCHAR(20) DEFAULT '#10b981',
    steps JSONB NOT NULL DEFAULT '[]',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_form_templates_type ON form_templates(type);
CREATE INDEX IF NOT EXISTS idx_form_templates_status ON form_templates(status);

-- ============ Submissions Table ============
CREATE TABLE IF NOT EXISTS submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id TEXT, -- Changed from UUID REFERENCES to allow string IDs for flexibility
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    user_email VARCHAR(255),
    form_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'processing', 'completed', 'cancelled')),
    assigned_provider_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_template_id ON submissions(template_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- ============ Row Level Security (RLS) Policies ============
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow service role full access (for backend)
CREATE POLICY "Service role has full access to users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Form templates policies
CREATE POLICY "Anyone can read published form templates" ON form_templates
    FOR SELECT USING (status = 'published');

CREATE POLICY "Service role has full access to form templates" ON form_templates
    FOR ALL USING (auth.role() = 'service_role');

-- Submissions policies
CREATE POLICY "Users can read their own submissions" ON submissions
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create submissions" ON submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role has full access to submissions" ON submissions
    FOR ALL USING (auth.role() = 'service_role');

-- ============ Insert Default Admin User ============
-- Password is 'admin123' hashed with bcrypt
INSERT INTO users (email, password, name, role, status)
VALUES (
    'admin@youfujia.com',
    '$2a$10$rK1VVsS4WcO.K5K5K5K5K.J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J',
    '管理员',
    'admin',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- ============ Insert Sample Form Templates ============
INSERT INTO form_templates (id, name, description, type, status, color, steps)
VALUES 
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '搬家服务',
    '标准搬家服务表单，包含出发地、目的地、物品描述等信息收集',
    'custom',
    'published',
    '#10b981',
    '[
        {
            "title": "基本信息",
            "description": "确定搬家的时间和地点",
            "fields": [
                {"key": "move_date", "label": "搬家日期", "type": "date", "required": true, "placeholder": "请选择预计搬家日期"},
                {"key": "from_address", "label": "出发地地址", "type": "address", "required": true, "placeholder": "请输入详细地址"},
                {"key": "to_address", "label": "目的地地址", "type": "address", "required": true, "placeholder": "请输入详细地址"}
            ]
        },
        {
            "title": "详细需求",
            "description": "补充楼层和物品信息",
            "fields": [
                {"key": "from_floor", "label": "出发地楼层", "type": "select", "required": true, "options": [{"label": "House/Townhouse (地面)", "value": "0"}, {"label": "Condo/Apartment (有电梯)", "value": "lift"}]},
                {"key": "items_desc", "label": "物品描述", "type": "textarea", "required": false, "placeholder": "例如：一张King Size床，两个床头柜，20个纸箱..."}
            ]
        },
        {
            "title": "联系方式",
            "description": "方便服务商与您取得联系",
            "fields": [
                {"key": "contact_name", "label": "联系人", "type": "text", "required": true, "placeholder": "怎么称呼您"},
                {"key": "phone", "label": "联系电话", "type": "number", "required": true, "placeholder": "服务商将通过此号码联系您"}
            ]
        }
    ]'::jsonb
),
(
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    '家庭清洁',
    '日常保洁、深度清洁等清洁服务表单',
    'custom',
    'published',
    '#3b82f6',
    '[
        {
            "title": "服务信息",
            "fields": [
                {"key": "service_date", "label": "服务日期", "type": "date", "required": true},
                {"key": "address", "label": "服务地址", "type": "address", "required": true},
                {"key": "cleaning_type", "label": "清洁类型", "type": "select", "required": true, "options": [{"label": "日常保洁", "value": "regular"}, {"label": "深度清洁", "value": "deep"}]}
            ]
        },
        {
            "title": "联系方式",
            "fields": [
                {"key": "contact_name", "label": "联系人", "type": "text", "required": true},
                {"key": "phone", "label": "联系电话", "type": "number", "required": true}
            ]
        }
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============ Updated At Trigger ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_form_templates_updated_at ON form_templates;
CREATE TRIGGER update_form_templates_updated_at
    BEFORE UPDATE ON form_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Done!
-- Your database is now ready for Youfujia Home Services

-- ============ Provider Profiles Table ============
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
    company_name VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON provider_profiles(user_id);

-- Add columns to provider_profiles
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS business_scope TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS license_url TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS service_categories JSONB DEFAULT '[]';
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS service_city TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS languages TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS id_front_url TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS id_back_url TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}';
