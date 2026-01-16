-- ============================================================
-- COMPREHENSIVE DATABASE RESET SCRIPT
-- ============================================================
-- This script wipes all transactional data and test accounts.
-- It PRESERVES: 
-- 1. Admin users (role = 'admin')
-- 2. System settings
-- 3. Form templates
-- 4. Categories and Cities
-- 5. Banners

BEGIN;

-- 1. Order Related Tables (Child tables first)
DELETE FROM order_messages;
DELETE FROM order_reviews;
DELETE FROM order_verifications;
DELETE FROM service_verifications;
DELETE FROM order_milestones;
DELETE FROM order_ratings;
DELETE FROM order_contracts;
DELETE FROM provider_cancellation_stats;
DELETE FROM wallet_transactions;
DELETE FROM commission_logs;
DELETE FROM withdrawal_requests;

-- 2. Orders and Submissions
DELETE FROM orders;
DELETE FROM submissions;

-- 3. Provider/Service Data
DELETE FROM provider_services;
DELETE FROM service_type_applications;
DELETE FROM provider_profiles;

-- 4. User Interaction Data
DELETE FROM support_tickets;
DELETE FROM notifications;
DELETE FROM user_sessions;
DELETE FROM verification_codes;

-- 5. Users (Keep only Admins)
-- Note: 'admin@youfujia.com' is protected just in case.
DELETE FROM users 
WHERE role != 'admin' 
  AND email != 'admin@youfujia.com';

COMMIT;

-- Verification of cleanup
SELECT 'orders' as table_name, COUNT(*) as count FROM orders
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'users (total)', COUNT(*) FROM users
UNION ALL
SELECT 'users (admin)', COUNT(*) FROM users WHERE role = 'admin'
UNION ALL
SELECT 'provider_services', COUNT(*) FROM provider_services;
