-- Fix inconsistent status: Set provider_profile to 'rejected' if they have a rejected application and are currently 'pending'.
UPDATE provider_profiles
SET 
    status = 'rejected',
    rejection_reason = service_type_applications.reason
FROM service_type_applications
WHERE 
    provider_profiles.user_id = service_type_applications.user_id
    AND service_type_applications.status = 'rejected'
    AND provider_profiles.status = 'pending';
