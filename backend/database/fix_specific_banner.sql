-- Quick fix for the specific banner with duplicate URL
UPDATE banners 
SET image_url = 'https://pccxbehxiyoafcswlpyy.supabase.co/storage/v1/object/public/uploads/service-photos/1768759566941-073f6a43.png'
WHERE title = '新用户专享' 
  AND image_url LIKE '%fongbeev1-backe-end.onrender.com%';

-- Verify the fix
SELECT id, title, image_url 
FROM banners 
WHERE title = '新用户专享';
