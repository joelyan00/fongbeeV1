-- Add Additional SMS Templates
-- Run this SQL in Supabase to add missing SMS templates

INSERT INTO sms_templates (key, name, content, description, variables) VALUES
(
    'deposit_received',
    '定金到账通知',
    '【优服佳】您的订单 {{orderNo}} 定金 ${{amount}} 已到账，请继续完成服务。',
    '服务商收到定金时通知',
    '["orderNo", "amount"]'
),
(
    'start_refused',
    '开工申请被拒绝',
    '【优服佳】您的订单 {{orderNo}} 用户的开工申请已被拒绝。原因：{{reason}}。请沟通后重新提交。',
    '用户拒绝服务商开工申请时',
    '["orderNo", "reason"]'
),
(
    'service_completed',
    '服务完成验收通知',
    '【优服佳】您的订单服务已完成，服务商已上传完工照片，请验收：{{link}}（{{hours}}小时内未响应将自动确认）',
    '服务商完成服务后通知用户验收',
    '["link", "hours"]'
),
(
    'rework_required',
    '返工通知',
    '【优服佳】您的订单 {{orderNo}} 用户反馈问题需要返工，请查看：{{link}}',
    '用户要求返工时通知服务商',
    '["orderNo", "link"]'
),
(
    'provider_response_accepted',
    '服务商接单通知',
    '【优服佳】服务商已接受您的订单，将于{{serviceDate}}上门服务，请保持联系方式畅通。',
    '服务商接受订单后通知用户',
    '["serviceDate"]'
),
(
    'provider_response_declined',
    '服务商拒单通知',
    '【优服佳】抱歉，服务商暂时无法接受您的订单。我们将为您重新匹配服务商。',
    '服务商拒绝订单后通知用户',
    '[]'
),
(
    'order_cancelled',
    '订单取消通知',
    '【优服佳】您的订单 {{orderNo}} 已取消，如有疑问请联系客服。',
    '订单取消时通知',
    '["orderNo"]'
),
(
    'payment_reminder',
    '付款提醒',
    '【优服佳】您有一笔订单待付款，请尽快完成支付以确保服务顺利进行：{{link}}',
    '提醒用户付款',
    '["link"]'
),
(
    'service_start_request',
    '开工申请通知',
    '【优服佳】服务商已提交开工申请，请确认：{{link}}',
    '服务商提交开工申请时通知用户',
    '["link"]'
),
(
    'new_message',
    '新消息通知',
    '【优服佳】您有一条关于订单 {{orderNo}} 的新消息，请及时查看：{{link}}',
    '收到新聊天消息时通知',
    '["orderNo", "link"]'
)
ON CONFLICT (key) DO UPDATE SET
    name = EXCLUDED.name,
    content = EXCLUDED.content,
    description = EXCLUDED.description,
    variables = EXCLUDED.variables,
    updated_at = NOW();
