-- ==========================================
-- CLEANUP SCRIPT: RESET ALL NON-ADMIN DATA
-- ==========================================

-- 1. Clean up Commission Logs (Dependent on Users)
DELETE FROM commission_logs 
WHERE sales_id IN (SELECT id FROM users WHERE role != 'admin')
   OR provider_id IN (SELECT id FROM users WHERE role != 'admin');

-- 2. Clean up Withdrawals (Dependent on Sales Profiles/Users)
DELETE FROM withdrawal_requests 
WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');

-- 3. Clean up Support Tickets
DELETE FROM support_tickets 
WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');

-- 4. Clean up Sales Profiles
DELETE FROM sales_profiles 
WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');

-- 5. Clean up Provider Profiles & Applications
DELETE FROM service_type_applications 
WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');

DELETE FROM provider_profiles 
WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');

-- Clean up Wallet Transactions (Fix for foreign key constraint)
DELETE FROM wallet_transactions 
WHERE order_id IN (SELECT id FROM submissions WHERE user_id IN (SELECT id FROM users WHERE role != 'admin'))
   OR user_id IN (SELECT id FROM users WHERE role != 'admin');

-- 6. Clean up Submissions/Orders (Linked to Users)
DELETE FROM submissions 
WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');

-- 7. Clean up Verification Codes (Linked to email/phone usually)
-- If there is a foreign key, delete it. If it's just email/phone, we can leave it or clear all.
DELETE FROM verification_codes; 

-- 8. FINALLY: Delete the Users (Excluding Admin)
DELETE FROM users 
WHERE role != 'admin';

-- 9. Optional: Reset any sequences if needed, but UUIDs don't need reset.
