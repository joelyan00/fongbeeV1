-- Add form_template_id to contract_templates to support 1:1 association with service forms
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS form_template_id UUID REFERENCES form_templates(id);

-- Optional: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_contract_templates_form_template_id ON contract_templates(form_template_id);
