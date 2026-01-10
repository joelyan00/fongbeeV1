-- Hybrid Form/Template System Migration
-- Separates onboarding forms from service blueprints

-- ============ Step 1: Add template_mode column ============
ALTER TABLE form_templates 
ADD COLUMN IF NOT EXISTS template_mode VARCHAR(20) DEFAULT 'form' 
CHECK (template_mode IN ('form', 'blueprint'));

-- ============ Step 2: Update existing templates ============
-- Mark provider registration forms as 'form' (keep as form-based)
UPDATE form_templates 
SET template_mode = 'form' 
WHERE category = 'provider_registration' OR category IS NULL;

-- Mark service templates as 'blueprint' (evolve to blueprint-based)
UPDATE form_templates 
SET template_mode = 'blueprint' 
WHERE category IN ('standard_service', 'simple_custom', 'complex_custom');

-- ============ Step 3: Create service_blueprints table ============
CREATE TABLE IF NOT EXISTS service_blueprints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES form_templates(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    
    -- Pre-filled content for cloning
    pre_filled_content JSONB DEFAULT '{
        "title": "",
        "subtitle": "",
        "service_description": "",
        "highlights": [],
        "included_items": [],
        "excluded_items": [],
        "duration_estimate": "",
        "price_range": {"min": 0, "max": 0, "unit": "per_service"}
    }',
    
    -- SOP (Standard Operating Procedure)
    sop_content TEXT,
    
    -- FAQ
    faq_content JSONB DEFAULT '[]',
    
    -- Pricing guide
    pricing_guide JSONB DEFAULT '{
        "base_price": 0,
        "price_factors": [],
        "commission_rate": 0.1
    }',
    
    -- Sample images
    images JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blueprints_category ON service_blueprints(category);
CREATE INDEX IF NOT EXISTS idx_blueprints_status ON service_blueprints(status);
CREATE INDEX IF NOT EXISTS idx_blueprints_template ON service_blueprints(template_id);

-- ============ Step 4: Create trigger for updated_at ============
DROP TRIGGER IF EXISTS update_service_blueprints_updated_at ON service_blueprints;
CREATE TRIGGER update_service_blueprints_updated_at
    BEFORE UPDATE ON service_blueprints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============ Step 5: Insert sample blueprints ============
INSERT INTO service_blueprints (name, description, category, pre_filled_content, sop_content, faq_content, status)
VALUES 
(
    '深度清洁服务',
    '专业家庭深度清洁服务模版',
    'standard_service',
    '{
        "title": "深度清洁服务",
        "subtitle": "让您的家焕然一新",
        "service_description": "我们的专业团队将为您提供全方位的深度清洁服务，包括厨房油污清理、卫生间消毒、家具表面擦拭等。",
        "highlights": ["专业设备", "环保清洁剂", "细节处理"],
        "included_items": ["厨房清洁", "卫生间清洁", "卧室清洁", "客厅清洁"],
        "excluded_items": ["外墙清洗", "地毯深度清洗"],
        "duration_estimate": "3-4小时",
        "price_range": {"min": 150, "max": 300, "unit": "per_service"}
    }',
    '## 服务流程
1. 确认服务范围和特殊要求
2. 准备清洁工具和材料
3. 从上到下、从里到外进行清洁
4. 垃圾收集和整理
5. 最终检查和客户验收',
    '[
        {"question": "需要我提供清洁工具吗？", "answer": "不需要，我们会自带专业工具和环保清洁剂"},
        {"question": "需要多长时间完成？", "answer": "根据房屋面积，通常需要3-4小时"},
        {"question": "宠物在场可以吗？", "answer": "可以，但建议将宠物安置在其他房间"}
    ]',
    'published'
),
(
    '搬家服务',
    '专业搬家服务模版',
    'standard_service',
    '{
        "title": "专业搬家服务",
        "subtitle": "安全、快捷、省心",
        "service_description": "提供专业的搬家服务，包括物品打包、搬运、运输和摆放。",
        "highlights": ["专业包装", "准时到达", "物品保险"],
        "included_items": ["家具拆装", "物品打包", "搬运上楼", "新居摆放"],
        "excluded_items": ["钢琴搬运", "贵重艺术品"],
        "duration_estimate": "根据物品量定",
        "price_range": {"min": 200, "max": 800, "unit": "per_service"}
    }',
    '## 服务流程
1. 上门评估物品数量
2. 提供报价和时间安排
3. 准备打包材料
4. 物品打包和保护
5. 装车运输
6. 新址卸货和摆放
7. 验收确认',
    '[
        {"question": "大件家具怎么处理？", "answer": "我们会进行专业拆装和保护"},
        {"question": "易碎物品怎么办？", "answer": "会使用专业包装材料多层保护"},
        {"question": "有物品损坏赔偿吗？", "answer": "是的，我们提供物品损坏赔偿保障"}
    ]',
    'published'
)
ON CONFLICT DO NOTHING;

-- Done!
