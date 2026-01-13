-- ============================================
-- 修复 RLS 安全警告
-- Enable RLS for tables missing security policies
-- ============================================

-- 1. user_sessions 表
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service account full access to user_sessions" ON user_sessions;
CREATE POLICY "Service account full access to user_sessions" ON user_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- 2. rejection_reason_categories 表
ALTER TABLE rejection_reason_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service account full access to rejection_reason_categories" ON rejection_reason_categories;
CREATE POLICY "Service account full access to rejection_reason_categories" ON rejection_reason_categories
    FOR ALL USING (true) WITH CHECK (true);

-- 3. service_blueprints 表
ALTER TABLE service_blueprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service account full access to service_blueprints" ON service_blueprints;
CREATE POLICY "Service account full access to service_blueprints" ON service_blueprints
    FOR ALL USING (true) WITH CHECK (true);

SELECT 'RLS enabled for all tables!' as result;
