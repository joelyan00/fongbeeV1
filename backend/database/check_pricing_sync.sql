-- Check system pricing configuration
SELECT config_key, config_value 
FROM system_pricing_config 
WHERE config_key LIKE 'sub_%_yearly_price' 
   OR config_key LIKE 'sub_%_monthly_price';

-- Check subscription plans
SELECT name, tier, price_monthly, price_yearly 
FROM subscription_plans 
ORDER BY sort_order;
