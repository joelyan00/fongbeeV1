-- Fix inconsistent provider states
-- 1. Ensure provider_profiles are approved if they have any approved service applications
UPDATE provider_profiles 
SET status = 'approved' 
WHERE user_id IN (
  SELECT user_id FROM service_type_applications WHERE status = 'approved'
) AND status != 'approved';

-- 2. Ensure users have 'provider' role if they have any approved service applications
UPDATE users
SET role = 'provider'
WHERE id IN (
  SELECT user_id FROM service_type_applications WHERE status = 'approved'
) AND role != 'provider';
