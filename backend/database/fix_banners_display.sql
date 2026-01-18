-- Fix banner display issue by ensuring active banners exist
-- This script will insert/update banners with proper date ranges

-- First, delete any existing sample banners
DELETE FROM banners WHERE title IN ('Deep Cleaning Promo', 'Moving Service', 'City Square Promo');

-- Insert active banners with extended date ranges
INSERT INTO banners (title, image_url, link_url, start_date, end_date, is_active, sort_order, target_cities)
VALUES 
(
  'City Square Promo',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://www.citysquare.ca',
  NOW() - INTERVAL '1 day',  -- Started yesterday
  NOW() + INTERVAL '90 days', -- Valid for 90 days
  true,
  1,
  '["all"]'::jsonb
),
(
  'Deep Cleaning Special',
  'https://images.unsplash.com/photo-1581578731117-104f2a863ccb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  '/pages/index/index?tab=services',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '90 days',
  true,
  2,
  '["all"]'::jsonb
),
(
  'Moving Service Discount',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  '/pages/index/index?tab=services',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '90 days',
  true,
  3,
  '["all"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Verify the banners are active
SELECT 
  id, 
  title, 
  is_active, 
  start_date, 
  end_date,
  (start_date <= NOW() AND end_date >= NOW()) as is_currently_active
FROM banners
ORDER BY sort_order;
