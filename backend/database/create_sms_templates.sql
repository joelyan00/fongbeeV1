-- Create SMS Templates Table
CREATE TABLE IF NOT EXISTS sms_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    variables JSONB DEFAULT '[]', -- List of supported variables for UI hint
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin full access to sms_templates" ON sms_templates
    FOR ALL USING (
        exists (select 1 from users where id = auth.uid() and role = 'admin')
    );

CREATE POLICY "Service role full access to sms_templates" ON sms_templates
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger
DROP TRIGGER IF EXISTS update_sms_templates_updated_at ON sms_templates;
CREATE TRIGGER update_sms_templates_updated_at
    BEFORE UPDATE ON sms_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert Default Templates
INSERT INTO sms_templates (key, name, content, description, variables) VALUES
(
    'provider_invite', 
    '邀请服务商入驻', 
    '【优服佳】您好，客户{{userName}}正在寻找{{serviceName}}{{details}}。请点击链接查看详情并报价：{{link}}',
    '当客户指定手机号邀请服务商时发送',
    '["userName", "serviceName", "details", "link"]'
),
(
    'verify_code',
    '注册验证码',
    '【优服佳】您的验证码是{{code}}，5分钟内有效。请勿泄露给他人。',
    '用户注册或登录时的验证码',
    '["code"]'
),
(
    'new_assigned_order',
    '新订单指派通知',
    '【优服佳】您有一个新的{{serviceName}}订单待确认，请点击查看详情并响应：{{link}}',
    '系统指派订单给服务商时',
    '["serviceName", "link"]'
)
ON CONFLICT (key) DO NOTHING;
