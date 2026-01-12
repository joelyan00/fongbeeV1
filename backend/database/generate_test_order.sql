-- ============================================================
-- Generate Test Order for Split Payout
-- Total: 100 CAD, Deposit: 20 CAD
-- ============================================================

DO $$
DECLARE
    v_user_id UUID;
    v_provider_id UUID;
    v_order_id UUID;
    v_submission_id UUID;
    v_order_no VARCHAR(50);
BEGIN
    -- 1. Get a random user and provider
    SELECT id INTO v_user_id FROM users WHERE role = 'user' LIMIT 1;
    SELECT id INTO v_provider_id FROM users WHERE role = 'provider' LIMIT 1;
    
    IF v_user_id IS NULL OR v_provider_id IS NULL THEN
        RAISE EXCEPTION 'Need at least one user and one provider in the database';
    END IF;

    v_order_no := 'TEST' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    v_order_id := uuid_generate_v4();
    v_submission_id := uuid_generate_v4();

    -- 2. Create Submission (for detail display)
    INSERT INTO submissions (id, user_id, assigned_provider_id, status, form_data, deposit_price)
    VALUES (
        v_submission_id,
        v_user_id,
        v_provider_id,
        'processing',
        '{"phone": "4164559844", "address": {"city": "Toronto", "street": "123 Test St"}, "service_date": "2024-01-20", "contact_name": "Test User"}'::jsonb,
        20.00
    );

    -- 3. Create Order
    INSERT INTO orders (
        id, order_no, service_type, user_id, provider_id, submission_id,
        total_amount, deposit_amount, deposit_rate, status, stripe_capture_status
    ) VALUES (
        v_order_id,
        v_order_no,
        'standard',
        v_user_id,
        v_provider_id,
        v_submission_id,
        100.00,
        20.00,
        20.00,
        'captured', -- Ready for "Start Service"
        'captured'
    );

    RAISE NOTICE 'Test Order Created! ID: %, OrderNo: %', v_order_id, v_order_no;
END $$;
