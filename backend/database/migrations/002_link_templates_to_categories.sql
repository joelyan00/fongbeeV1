-- Link form_templates to custom_service_categories
ALTER TABLE form_templates 
    ADD COLUMN IF NOT EXISTS custom_service_category_id UUID REFERENCES custom_service_categories(id);

-- Update existing templates to a default category (e.g., '其他服务')
UPDATE form_templates 
SET custom_service_category_id = (SELECT id FROM custom_service_categories WHERE name = '其他服务' LIMIT 1)
WHERE custom_service_category_id IS NULL;

-- Specifically map some templates if possible
UPDATE form_templates 
SET custom_service_category_id = (SELECT id FROM custom_service_categories WHERE name = '小型维修' LIMIT 1)
WHERE name LIKE '%清洁%' OR name LIKE '%水管%';

UPDATE form_templates 
SET custom_service_category_id = (SELECT id FROM custom_service_categories WHERE name = '中型服务' LIMIT 1)
WHERE name LIKE '%搬家%' OR name LIKE '%接送%' OR name LIKE '%接机%';
