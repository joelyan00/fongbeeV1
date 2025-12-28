
INSERT INTO public.users (id, email, password, role, name, phone)
VALUES ('test-provider-uuid-001', 'provider@test.com', 'hashed_pass', 'provider', 'Test Provider', '1234567890')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.provider_profiles (user_id, company_name, service_categories, status, rating, service_city)
VALUES ('test-provider-uuid-001', 'Best Movers Inc.', ARRAY['Moving', 'Cleaning'], 'approved', 4.8, 'Toronto')
ON CONFLICT (user_id) DO UPDATE 
SET service_categories = ARRAY['Moving', 'Cleaning'], status = 'approved';
