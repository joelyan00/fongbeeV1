-- ============================================================
-- TARGETED ORDER DATA RESET SCRIPT (ROBUST VERSION)
-- ============================================================
-- This script wipes TRANSACTIONAL data (orders, messages, reviews).
-- It skips tables that do not exist to avoid errors.

DO $$ 
DECLARE
    t_name TEXT;
BEGIN
    -- List of tables to attempt deletion from (order matters for FKs)
    FOR t_name IN 
        SELECT unnest(ARRAY[
            'order_messages', 'order_reviews', 'order_verifications', 
            'service_verifications', 'order_milestones', 'order_ratings', 
            'order_contracts', 'wallet_transactions', 'commission_logs', 
            'withdrawal_requests', 'orders', 'submissions'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t_name) THEN
            EXECUTE format('DELETE FROM %I', t_name);
            RAISE NOTICE 'Cleared table: %', t_name;
        END IF;
    END LOOP;

    -- Reset credits if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'credits') THEN
        UPDATE users SET credits = 0 WHERE role != 'admin';
        RAISE NOTICE 'Reset users.credits';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
        UPDATE users SET points = 0 WHERE role != 'admin';
        RAISE NOTICE 'Reset users.points';
    END IF;

    -- Reset wallet balance if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_wallets') THEN
        UPDATE provider_wallets SET balance = 0;
        RAISE NOTICE 'Reset provider_wallets.balance';
    END IF;

    -- Reset ratings in provider tables
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_profiles') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'rating') THEN
            UPDATE provider_profiles SET rating = 5.0;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'reviews_count') THEN
            UPDATE provider_profiles SET reviews_count = 0;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'rating') THEN
            UPDATE providers SET rating = 5.0;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'reviews_count') THEN
            UPDATE providers SET reviews_count = 0;
        END IF;
    END IF;

END $$;

-- Summary Verification
SELECT 
    (SELECT COUNT(*) FROM orders) as orders_remaining,
    (SELECT COUNT(*) FROM submissions) as submissions_remaining,
    (SELECT COUNT(*) FROM users) as users_remaining;
