-- Fix banner image URLs
-- Remove duplicate domain prefix and fix localhost URLs

-- Update the banner with duplicate URL
UPDATE banners 
SET image_url = 'https://pccxbehxiyoafcswlpyy.supabase.co/storage/v1/object/public/uploads/service-photos/1768759314990-b979e159.png'
WHERE id = '2466978a-96a2-4616-aa9e-79aa5fd69601';

-- Fix localhost URLs - replace with placeholder images
UPDATE banners 
SET image_url = 'https://images.unsplash.com/photo-1581578731117-104f2a863ccb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
WHERE image_url LIKE 'http://localhost%' OR image_url LIKE '%localhost%';

-- Verify all banners have valid URLs
SELECT 
  id, 
  title, 
  image_url,
  is_active,
  (image_url LIKE 'https://%') as has_valid_url
FROM banners
WHERE is_active = true
ORDER BY sort_order;
