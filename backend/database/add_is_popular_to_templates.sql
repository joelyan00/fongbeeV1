-- Add is_popular column to form_templates table
ALTER TABLE form_templates
ADD COLUMN is_popular BOOLEAN DEFAULT false;

-- Comment for the new column
COMMENT ON COLUMN form_templates.is_popular IS 'Control if the template appears in popular templates section';
