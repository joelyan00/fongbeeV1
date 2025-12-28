-- ============================================================
-- 添加子分类支持 - 为 service_categories 表添加 parent_id
-- 请在 Supabase SQL Editor 中运行
-- ============================================================

-- 1. 添加 parent_id 列（允许为空，空表示是父分类/顶级分类）
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;

-- 2. 添加索引以加速父子查询
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON service_categories(parent_id);

-- 3. 验证结构
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'service_categories';

-- ============================================================
-- 示例：创建接送服务的子分类结构
-- ============================================================

-- 先确保父分类存在
-- INSERT INTO service_categories (name, icon, sort_order) 
-- VALUES ('接送服务', 'car', 20)
-- ON CONFLICT (name) DO UPDATE SET icon = 'car';

-- 创建子分类（需先获取父分类的 ID）
-- 以下是手动方式，您也可以通过 Admin Dashboard 操作

-- 获取接送服务的 ID
-- SELECT id FROM service_categories WHERE name = '接送服务';

-- 创建子分类（假设父 ID 已知）
-- INSERT INTO service_categories (name, icon, sort_order, parent_id) VALUES
--     ('机场接送', 'plane', 21, '父分类的UUID'),
--     ('普通接送', 'car', 22, '父分类的UUID')
-- ON CONFLICT (name) DO NOTHING;
