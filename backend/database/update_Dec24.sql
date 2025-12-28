-- ==========================================
-- 2025-12-24 综合更新脚本
-- 包含功能：
-- 1. 平台服务费设置 (System Settings)
-- 2. 广告位管理 (Banners)
-- ==========================================

-- 1. 创建系统设置表 (用于存平台费比例)
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初始化平台费为 10%
INSERT INTO system_settings (key, value, description)
VALUES ('platform_fee_percent', '10', '平台服务费抽成比例')
ON CONFLICT (key) DO NOTHING;

-- 2. 创建广告管理表
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_banners_active_dates ON banners (is_active, start_date, end_date);

-- 3. (可选) 确保 order 表有 platform_fee 字段记录历史费用
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10, 2) DEFAULT 0;

-- 插入一条演示广告
INSERT INTO banners (title, image_url, link_url, start_date, end_date, sort_order)
VALUES 
('新用户专享', 'https://images.unsplash.com/photo-1581578731117-104f2a863ccb', '', NOW(), NOW() + INTERVAL '30 days', 1);
