-- Insert missing pricing configuration keys
INSERT INTO system_pricing_config (config_key, config_value, config_type, description, category, is_public)
VALUES 
    -- Basic
    ('sub_basic_yearly_price', '299.99', 'number', '初级会员年费', 'subscription', true),
    ('sub_basic_listing_quota', '5', 'number', '初级会员每月上架数', 'subscription', true),
    
    -- Premium (Professional)
    ('sub_premium_yearly_price', '999.99', 'number', '高级会员年费', 'subscription', true),
    ('sub_premium_listing_quota', '20', 'number', '高级会员每月上架数', 'subscription', true),

    -- VIP (Premium)
    ('sub_vip_yearly_price', '2999.99', 'number', 'VIP会员年费', 'subscription', true),
    ('sub_vip_listing_quota', '100', 'number', 'VIP会员每月上架数', 'subscription', true)
ON CONFLICT (config_key) DO NOTHING;
