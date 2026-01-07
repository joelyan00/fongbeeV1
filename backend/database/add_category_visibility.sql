-- 服务分类可见性控制
-- 添加 standard_enabled 和 custom_enabled 字段到 service_categories 表

-- 添加标准服务/定制服务可见性字段
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS standard_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS custom_enabled BOOLEAN DEFAULT TRUE;

-- 更新现有记录，默认都启用
UPDATE service_categories 
SET 
    standard_enabled = COALESCE(standard_enabled, TRUE),
    custom_enabled = COALESCE(custom_enabled, TRUE)
WHERE standard_enabled IS NULL OR custom_enabled IS NULL;

-- 添加注释
COMMENT ON COLUMN service_categories.standard_enabled IS '是否在标准服务中显示此分类';
COMMENT ON COLUMN service_categories.custom_enabled IS '是否在定制服务中显示此分类';
