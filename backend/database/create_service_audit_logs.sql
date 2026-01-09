-- Service Audit Logs Table
-- Records all lifecycle events for standard services
-- Enables full traceability and compliance auditing

CREATE TABLE IF NOT EXISTS service_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Service Reference
    service_identity_id TEXT NOT NULL,              -- Unique service identifier (never changes)
    service_id UUID REFERENCES provider_services(id) ON DELETE SET NULL,
    
    -- Action Details
    action TEXT NOT NULL,                           -- Action type: created, submitted, approved, rejected, edited, published, unpublished, archived
    previous_status TEXT,                           -- Status before action
    new_status TEXT,                                -- Status after action
    
    -- Actor Information
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role TEXT,                                -- 'provider', 'admin', 'system'
    actor_name TEXT,                                -- Cached name for display
    
    -- Rejection/Reason Details
    reason TEXT,                                    -- Detailed reason/comment
    reason_category TEXT,                           -- Structured category: qualification, content, pricing, description, images, duplicate, other
    
    -- Additional Metadata
    metadata JSONB DEFAULT '{}',                    -- Extra data (e.g., version snapshot, IP address)
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_service_identity ON service_audit_logs(service_identity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_service_id ON service_audit_logs(service_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON service_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON service_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON service_audit_logs(created_at DESC);

-- Add draft status to provider_services if not exists
-- This allows services to be saved without immediate submission
DO $$
BEGIN
    -- Check if the check constraint exists and update it
    -- Note: PostgreSQL doesn't have a simple "ADD IF NOT EXISTS" for constraints
    -- We'll add a comment to document the valid statuses instead
    COMMENT ON COLUMN provider_services.status IS 'Valid values: draft, pending, approved, rejected, published, unpublished, archived';
END $$;

-- Predefined rejection reasons lookup table (optional, for frontend can also hardcode)
CREATE TABLE IF NOT EXISTS rejection_reason_categories (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    label_zh TEXT NOT NULL,
    label_en TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- Insert default rejection categories
INSERT INTO rejection_reason_categories (code, label_zh, label_en, description, sort_order) VALUES
('qualification', '资质不全', 'Incomplete Qualification', '缺少必要的认证或资质文件', 1),
('content', '内容不合规', 'Non-compliant Content', '描述包含违禁或不当内容', 2),
('pricing', '价格异常', 'Pricing Issue', '定价不合理或与市场差异过大', 3),
('description', '描述不清晰', 'Unclear Description', '服务内容描述不完整或模糊', 4),
('images', '图片问题', 'Image Issue', '图片不清晰、不相关或侵权', 5),
('duplicate', '重复提交', 'Duplicate Submission', '与已有服务重复', 6),
('other', '其他原因', 'Other', '其他原因', 99)
ON CONFLICT (code) DO NOTHING;

-- RLS Policies
ALTER TABLE service_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON service_audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Providers can view audit logs for their own services
CREATE POLICY "Providers can view own service audit logs" ON service_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_services ps 
            WHERE ps.service_identity_id = service_audit_logs.service_identity_id 
            AND ps.provider_id = auth.uid()
        )
    );

-- Service Role has full access
CREATE POLICY "Service role full access audit logs" ON service_audit_logs
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE service_audit_logs IS 'Audit trail for service lifecycle events - tracks all changes, approvals, rejections';
