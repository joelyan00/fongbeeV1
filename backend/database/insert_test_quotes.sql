-- Insert Test Data for Custom Service Quotes
-- Run this in Supabase SQL Editor to create test data for the quotes feature

-- Note: This script will:
-- 1. Create test user if needed (for submission owner)
-- 2. Create test submissions (custom service requests)
-- 3. Create test quotes from providers for those submissions

-- First, let's get or create a test user for submissions
DO $$
DECLARE
    v_test_user_id UUID;
    v_provider_id UUID;
    v_submission_1_id UUID;
    v_submission_2_id UUID;
    v_submission_3_id UUID;
    v_submission_4_id UUID;
    v_submission_5_id UUID;
BEGIN
    -- Get or create test user
    SELECT id INTO v_test_user_id FROM users WHERE email = 'testuser@youfujia.com' LIMIT 1;
    
    IF v_test_user_id IS NULL THEN
        INSERT INTO users (email, password, name, phone, role, status)
        VALUES ('testuser@youfujia.com', '$2a$10$rK1VVsS4WcO.K5K5K5K5K.J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J', '测试用户', '13800138000', 'user', 'active')
        RETURNING id INTO v_test_user_id;
    END IF;

    -- Get existing provider (use the first approved provider found)
    SELECT u.id INTO v_provider_id 
    FROM users u
    JOIN provider_profiles pp ON u.id = pp.user_id
    WHERE u.role = 'provider' AND pp.status = 'approved'
    LIMIT 1;

    -- If no approved provider, get any provider
    IF v_provider_id IS NULL THEN
        SELECT id INTO v_provider_id FROM users WHERE role = 'provider' LIMIT 1;
    END IF;

    -- If still no provider, create one
    IF v_provider_id IS NULL THEN
        INSERT INTO users (email, password, name, phone, role, status)
        VALUES ('testprovider@youfujia.com', '$2a$10$rK1VVsS4WcO.K5K5K5K5K.J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J', '测试服务商', '13900139000', 'provider', 'active')
        RETURNING id INTO v_provider_id;

        INSERT INTO provider_profiles (user_id, company_name, status, description)
        VALUES (v_provider_id, '测试服务公司', 'approved', '专业提供各类家政服务');
    END IF;

    -- Create test submissions
    -- Submission 1: Pending (waiting for response)
    INSERT INTO submissions (id, template_id, user_id, user_name, user_email, form_data, status, created_at, updated_at)
    VALUES (
        uuid_generate_v4(), 
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
        v_test_user_id, 
        '王小明', 
        'testuser@youfujia.com',
        '{"contact_name": "王小明", "phone": "13812345678", "from_address": "北京市朝阳区世贸路1131号", "to_address": "北京市海淀区中关村南大街5号", "move_date": "2026-02-15", "items_desc": "两室一厅家具，约20个纸箱"}'::jsonb,
        'pending',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    )
    RETURNING id INTO v_submission_1_id;

    -- Submission 2: Pending
    INSERT INTO submissions (id, template_id, user_id, user_name, user_email, form_data, status, created_at, updated_at)
    VALUES (
        uuid_generate_v4(), 
        'b2c3d4e5-f6a7-8901-bcde-f23456789012', 
        v_test_user_id, 
        '李红', 
        'testuser@youfujia.com',
        '{"contact_name": "李红", "phone": "13887654321", "address": "上海市浦东新区陆家嘴金融城", "service_date": "2026-02-20", "cleaning_type": "deep"}'::jsonb,
        'pending',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    )
    RETURNING id INTO v_submission_2_id;

    -- Submission 3: Processing (accepted)
    INSERT INTO submissions (id, template_id, user_id, user_name, user_email, form_data, status, assigned_provider_id, created_at, updated_at)
    VALUES (
        uuid_generate_v4(), 
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
        v_test_user_id, 
        '张伟', 
        'testuser@youfujia.com',
        '{"contact_name": "张伟", "phone": "13655556666", "from_address": "广州市天河区体育西路", "to_address": "广州市越秀区北京路", "move_date": "2026-01-25"}'::jsonb,
        'processing',
        v_provider_id,
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '3 days'
    )
    RETURNING id INTO v_submission_3_id;

    -- Submission 4: Completed
    INSERT INTO submissions (id, template_id, user_id, user_name, user_email, form_data, status, assigned_provider_id, created_at, updated_at)
    VALUES (
        uuid_generate_v4(), 
        'b2c3d4e5-f6a7-8901-bcde-f23456789012', 
        v_test_user_id, 
        '刘芳', 
        'testuser@youfujia.com',
        '{"contact_name": "刘芳", "phone": "13922223333", "address": "深圳市南山区科技园", "service_date": "2026-01-10", "cleaning_type": "regular"}'::jsonb,
        'completed',
        v_provider_id,
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '15 days'
    )
    RETURNING id INTO v_submission_4_id;

    -- Submission 5: Cancelled
    INSERT INTO submissions (id, template_id, user_id, user_name, user_email, form_data, status, created_at, updated_at)
    VALUES (
        uuid_generate_v4(), 
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
        v_test_user_id, 
        '赵明', 
        'testuser@youfujia.com',
        '{"contact_name": "赵明", "phone": "13711112222", "from_address": "杭州市西湖区", "to_address": "杭州市余杭区", "move_date": "2026-01-20"}'::jsonb,
        'cancelled',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '5 days'
    )
    RETURNING id INTO v_submission_5_id;

    -- Now create quotes from the provider for these submissions
    
    -- Quote 1: Pending quote on submission 1
    INSERT INTO service_quotes (submission_id, provider_id, status, quote_price, deposit_price, message, created_at, updated_at)
    VALUES (
        v_submission_1_id,
        v_provider_id,
        'pending',
        25000.00,
        5000.00,
        '您好，根据您的需求，我们提供专业搬家服务。价格包含：人工搬运、包装材料、运输费用。',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    );

    -- Quote 2: Pending quote on submission 2
    INSERT INTO service_quotes (submission_id, provider_id, status, quote_price, deposit_price, message, created_at, updated_at)
    VALUES (
        v_submission_2_id,
        v_provider_id,
        'pending',
        3500.00,
        500.00,
        '深度清洁服务报价，包含：全屋清洁、家电清洗、玻璃清洁等。',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days'
    );

    -- Quote 3: Accepted quote on submission 3
    INSERT INTO service_quotes (submission_id, provider_id, status, quote_price, deposit_price, message, created_at, updated_at)
    VALUES (
        v_submission_3_id,
        v_provider_id,
        'accepted',
        18000.00,
        3000.00,
        '已确认服务，将按时上门。',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '3 days'
    );

    -- Quote 4: Accepted (completed) quote on submission 4
    INSERT INTO service_quotes (submission_id, provider_id, status, quote_price, deposit_price, message, created_at, updated_at)
    VALUES (
        v_submission_4_id,
        v_provider_id,
        'accepted',
        1200.00,
        200.00,
        '日常保洁服务已完成。',
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '15 days'
    );

    -- Quote 5: Rejected quote (user chose another provider)
    INSERT INTO service_quotes (submission_id, provider_id, status, quote_price, deposit_price, message, created_at, updated_at)
    VALUES (
        v_submission_5_id,
        v_provider_id,
        'rejected',
        15000.00,
        2500.00,
        '提供专业搬家服务',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '5 days'
    );

    -- Quote 6: Withdrawn quote (provider cancelled)
    INSERT INTO service_quotes (id, submission_id, provider_id, status, quote_price, deposit_price, message, created_at, updated_at)
    SELECT
        uuid_generate_v4(),
        v_submission_1_id,
        (SELECT id FROM users WHERE role = 'provider' AND id != v_provider_id LIMIT 1),
        'withdrawn',
        28000.00,
        4000.00,
        '抱歉，由于排期问题，无法提供服务',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day'
    WHERE EXISTS (SELECT id FROM users WHERE role = 'provider' AND id != v_provider_id LIMIT 1);

    RAISE NOTICE 'Test data created successfully!';
    RAISE NOTICE 'Test user ID: %', v_test_user_id;
    RAISE NOTICE 'Provider ID: %', v_provider_id;
    RAISE NOTICE 'Submission IDs: %, %, %, %, %', v_submission_1_id, v_submission_2_id, v_submission_3_id, v_submission_4_id, v_submission_5_id;
END $$;

-- Verify the data was inserted
SELECT 'Service Quotes Count:' as info, COUNT(*) as count FROM service_quotes;
SELECT 'Submissions Count:' as info, COUNT(*) as count FROM submissions;

-- View the created quotes with submission info
SELECT 
    sq.id as quote_id,
    sq.status as quote_status,
    sq.quote_price,
    sq.deposit_price,
    sq.message,
    sq.created_at,
    s.form_data->>'contact_name' as project_name,
    s.status as submission_status,
    u.name as provider_name
FROM service_quotes sq
JOIN submissions s ON sq.submission_id = s.id
JOIN users u ON sq.provider_id = u.id
ORDER BY sq.created_at DESC;
