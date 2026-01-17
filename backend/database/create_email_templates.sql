-- Create Email Templates Table
-- Run this SQL in Supabase to enable email template management

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    description TEXT,
    variables JSONB DEFAULT '[]',
    from_name VARCHAR(100) DEFAULT '优服佳 Fongbee',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin full access to email_templates" ON email_templates
    FOR ALL USING (
        exists (select 1 from users where id = auth.uid() and role = 'admin')
    );

CREATE POLICY "Service role full access to email_templates" ON email_templates
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert Default Templates
INSERT INTO email_templates (key, name, subject, html_content, description, variables, from_name) VALUES
(
    'verify_code',
    '验证码邮件',
    '【优服佳】{{actionText}}验证码',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #059669; margin: 0;">优服佳 Fongbee Service</h2>
        </div>
        <div style="padding: 20px; text-align: center;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 10px;">您正在进行 <strong>{{actionText}}</strong></p>
            <p style="color: #6b7280; font-size: 14px;">您的验证码是：</p>
            <h1 style="color: #059669; font-size: 36px; letter-spacing: 5px; margin: 20px 0; font-weight: bold;">{{code}}</h1>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">验证码 10 分钟内有效。如非本人操作，请忽略此邮件。</p>
        </div>
        <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
            &copy; {{year}} Fongbee Service. All rights reserved.
        </div>
    </div>',
    '用户注册或重置密码时发送的验证码邮件',
    '["code", "actionText", "year"]',
    '优服佳安全中心'
),
(
    'provider_hired',
    '服务商接单通知',
    '【优服佳】恭喜！您有新的订单已确认 (单号: {{orderNo}})',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #059669; text-align: center;">🎉 新订单通知</h2>
        <p>尊敬的服务商您好，客户已确认您的报价并完成定金支付。</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 0; color: #166534; font-weight: bold;">💰 已托管定金: ${{depositAmount}}</p>
        </div>
        {{orderDetails}}
        <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px;">请登录平台查看完整详情并联系客户。</p>
        </div>
    </div>',
    '客户确认订单并支付定金后通知服务商',
    '["orderNo", "depositAmount", "orderDetails"]',
    '优服佳订单中心'
),
(
    'sales_invitation',
    '销售合伙人邀请',
    '【优服佳】诚邀您成为销售合伙人',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #059669; text-align: center;">优服佳合伙人计划</h2>
        <p>您好！我们诚挚邀请您加入我们的销售合伙人团队，共享平台增长红利。</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{inviteLink}}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">立即加入并注册</a>
        </div>
        <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">直接跳转链接: {{inviteLink}}</p>
    </div>',
    '管理员邀请销售合伙人加入平台',
    '["inviteLink"]',
    '优服佳伙伴计划'
),
(
    'provider_invitation',
    '服务商入驻邀请',
    '【优服佳】{{inviterName}} 邀请您入驻成为服务商',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #059669; text-align: center;">服务商入驻邀请</h2>
        <p>您好！您的合作伙伴 <strong>{{inviterName}}</strong> 邀请您入驻平台。</p>
        <p>入驻后即可接收海量家庭服务订单。</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{inviteLink}}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">立即申请入驻</a>
        </div>
    </div>',
    '销售合伙人邀请服务商入驻平台',
    '["inviterName", "inviteLink"]',
    '优服佳入驻管理'
),
(
    'user_invitation',
    '用户邀请注册',
    '【优服佳】您的朋友 {{inviterName}} 赠送您家庭服务体验资格',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #059669; text-align: center;">优服佳服务体验邀请</h2>
        <p>您的朋友 <strong>{{inviterName}}</strong> 向您推荐了优服佳优质家庭服务。</p>
        <p>点击注册即可享受便捷的在线预约和优质的售后保障。</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{inviteLink}}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">立即领取并注册</a>
        </div>
    </div>',
    '销售合伙人邀请普通用户加入平台',
    '["inviterName", "inviteLink"]',
    '优服佳客户中心'
),
(
    'order_confirmation',
    '订单确认通知',
    '【优服佳】您的订单已确认 (单号: {{orderNo}})',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #059669; text-align: center;">✅ 订单已确认</h2>
        <p>尊敬的客户您好，您的订单已成功确认。</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 5px 0;"><strong>订单编号:</strong> {{orderNo}}</p>
            <p style="margin: 5px 0;"><strong>服务项目:</strong> {{serviceName}}</p>
            <p style="margin: 5px 0;"><strong>服务商:</strong> {{providerName}}</p>
            <p style="margin: 5px 0;"><strong>预约时间:</strong> {{serviceDate}}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="{{orderLink}}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">查看订单详情</a>
        </div>
    </div>',
    '订单确认后发送给用户',
    '["orderNo", "serviceName", "providerName", "serviceDate", "orderLink"]',
    '优服佳订单中心'
),
(
    'service_reminder',
    '服务提醒',
    '【优服佳】服务提醒：您的服务将于明天进行',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #059669; text-align: center;">⏰ 服务提醒</h2>
        <p>尊敬的客户您好，温馨提醒您的服务将于明天进行。</p>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #fcd34d;">
            <p style="margin: 5px 0;"><strong>服务项目:</strong> {{serviceName}}</p>
            <p style="margin: 5px 0;"><strong>预约时间:</strong> {{serviceDate}}</p>
            <p style="margin: 5px 0;"><strong>服务商:</strong> {{providerName}}</p>
            <p style="margin: 5px 0;"><strong>联系电话:</strong> {{providerPhone}}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">请确保服务地址有人接待。如需改期，请提前联系服务商。</p>
    </div>',
    '服务前一天发送的提醒邮件',
    '["serviceName", "serviceDate", "providerName", "providerPhone"]',
    '优服佳服务中心'
)
ON CONFLICT (key) DO UPDATE SET
    name = EXCLUDED.name,
    subject = EXCLUDED.subject,
    html_content = EXCLUDED.html_content,
    description = EXCLUDED.description,
    variables = EXCLUDED.variables,
    from_name = EXCLUDED.from_name,
    updated_at = NOW();
