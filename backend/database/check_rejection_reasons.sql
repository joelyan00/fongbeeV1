-- Check rejection reasons in both profiles and applications
SELECT 
    u.email,
    p.user_id,
    p.status as profile_status,
    p.rejection_reason as profile_rejection_reason,
    p.updated_at as profile_updated_at,
    s.status as app_status,
    s.category,
    s.reason as app_reason,
    s.updated_at as app_updated_at
FROM 
    provider_profiles p
JOIN 
    users u ON p.user_id = u.id
LEFT JOIN 
    service_type_applications s ON p.user_id = s.user_id
WHERE 
    p.status = 'rejected' OR s.status = 'rejected'
ORDER BY 
    s.updated_at DESC;
