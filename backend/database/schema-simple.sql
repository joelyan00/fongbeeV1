-- Youfujia Home Services Database Schema (Simplified)
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

-- ============ Form Templates Table ============
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'custom' CHECK (type IN ('standard', 'custom', 'provider_reg')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    color VARCHAR(20) DEFAULT '#10b981',
    steps JSONB NOT NULL DEFAULT '[]',
    category VARCHAR(100), -- Linked category if it's a provider_reg form
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ Submissions Table ============
CREATE TABLE IF NOT EXISTS submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id TEXT, -- Changed from UUID REFERENCES to allow string IDs like 'airport-pickup'
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    user_email VARCHAR(255),
    form_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    assigned_provider_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ Provider Profiles Table ============
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200),
    description TEXT,
    company_address TEXT,
    business_scope TEXT,
    license_url TEXT,
    website TEXT,
    service_categories JSONB DEFAULT '[]',
    service_city TEXT,
    languages TEXT,
    id_front_url TEXT,
    id_back_url TEXT,
    extra_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============ Service Type Applications Table ============
CREATE TABLE IF NOT EXISTS service_type_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    extra_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ Insert Default Admin User ============
-- Password is 'admin123' hashed with bcrypt
INSERT INTO users (email, password, name, role, status)
VALUES (
    'admin@youfujia.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjOURcnP1HlvJvtJA4X.tWFLV9vqBy',
    '系统管理员',
    'admin',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- ============ Insert Sample Form Templates ============
INSERT INTO form_templates (name, description, type, status, color, steps)
VALUES 
(
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
                {"key": "move_date", "label": "搬家日期", "type": "date", "required": true},
                {"key": "from_address", "label": "出发地地址", "type": "address", "required": true},
                {"key": "to_address", "label": "目的地地址", "type": "address", "required": true}
            ]
        },
        {
            "title": "联系方式",
            "fields": [
                {"key": "contact_name", "label": "联系人", "type": "text", "required": true},
                {"key": "phone", "label": "联系电话", "type": "text", "required": true}
            ]
        }
    ]'::jsonb
),
(
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
                {"key": "phone", "label": "联系电话", "type": "text", "required": true}
            ]
        }
    ]'::jsonb
);

-- ============ Insert Sample Provider Registration Forms ============
INSERT INTO form_templates (name, description, type, status, color, category, steps)
VALUES 
(
    '搬家服务商注册',
    '搬家公司入驻所需填写的详细信息',
    'provider_reg',
    'published',
    '#10b981',
    '搬家服务',
    '[
        {
            "title": "团队信息",
            "description": "介绍您的搬家团队规模",
            "fields": [
                {"key": "team_size", "label": "团队人数", "type": "number", "required": true},
                {"key": "truck_count", "label": "货车数量", "type": "number", "required": true},
                {"key": "moving_exp", "label": "从业年限", "type": "select", "options": [{"label": "1-3年", "value": "1-3"}, {"label": "3-5年", "value": "3-5"}, {"label": "5年以上", "value": "5+"}]}
            ]
        },
        {
            "title": "保险情况",
            "fields": [
                {"key": "has_insurance", "label": "是否有商业保险", "type": "radio", "options": [{"label": "是", "value": "yes"}, {"label": "否", "value": "no"}]}
            ]
        }
    ]'::jsonb
),
(
    '家庭清洁服务商注册',
    '清洁服务人员入驻所需填写的详细信息',
    'provider_reg',
    'published',
    '#3b82f6',
    '家庭清洁',
    '[
        {
            "title": "资质说明",
            "fields": [
                {"key": "certifications", "label": "专业证书/资格", "type": "textarea", "placeholder": "如：专业清洁培训证书等"},
                {"key": "equipment", "label": "自带设备情况", "type": "text", "placeholder": "如：吸尘器、专业清洁剂等"}
            ]
        }
    ]'::jsonb
);

-- Done! Your database is ready.
