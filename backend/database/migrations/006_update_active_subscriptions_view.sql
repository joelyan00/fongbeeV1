-- Update active_user_subscriptions view to include new columns
CREATE OR REPLACE VIEW active_user_subscriptions AS
SELECT 
    us.*,
    sp.name as plan_name,
    sp.tier as plan_tier,
    sp.included_credits,
    sp.included_standard_listings,
    u.email as user_email,
    pp.company_name as provider_name,
    nsp.name as next_plan_name
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN subscription_plans nsp ON us.next_plan_id = nsp.id
JOIN users u ON us.user_id = u.id
LEFT JOIN provider_profiles pp ON pp.user_id = u.id
WHERE us.status = 'active' 
    AND us.end_date > NOW();
