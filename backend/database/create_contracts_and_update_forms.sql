-- Create contract_templates table
CREATE TABLE IF NOT EXISTS contract_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT, -- HTML content or markdown
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_contract_templates_updated_at ON contract_templates;
CREATE TRIGGER update_contract_templates_updated_at
    BEFORE UPDATE ON contract_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update form_templates to support 'complex' type and contract association
-- First, drop the constraint if it exists (Supabase might name it check_type or form_templates_type_check)
ALTER TABLE form_templates DROP CONSTRAINT IF EXISTS form_templates_type_check;

-- Add new column
ALTER TABLE form_templates ADD COLUMN IF NOT EXISTS contract_template_id UUID REFERENCES contract_templates(id);

-- Add new constraint
ALTER TABLE form_templates ADD CONSTRAINT form_templates_type_check 
    CHECK (type IN ('standard', 'custom', 'complex', 'provider_reg'));

-- Update submissions table to support 'draft' status
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_status_check 
    CHECK (status IN ('draft', 'pending', 'processing', 'completed', 'cancelled'));

-- RLS for contract_templates
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to contract templates" ON contract_templates
    FOR ALL USING (auth.role() = 'service_role');

-- Allow admins to manage (assuming backend uses service role, but good for completeness)
-- Note: 'admin' role logic depends on how auth is handled, usually service role bypasses RLS.
