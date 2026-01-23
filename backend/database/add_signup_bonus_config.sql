-- Add Signup Bonus Configuration to Pricing Config
INSERT INTO system_pricing_config (config_key, config_value, config_type, category, description) VALUES
('enable_provider_signup_bonus', 'false', 'boolean', 'credits', '是否开启新服务商注册奖励积分'),
('provider_signup_bonus_amount', '50', 'number', 'credits', '新服务商注册奖励积分数')
ON CONFLICT (config_key) DO NOTHING;
