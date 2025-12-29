-- Reset Admin Password to 'admin123'
-- Run this in Supabase SQL Editor

UPDATE users 
SET password = '$2a$10$Ke1Mlg3Y8Q7RrRaKNgZggOqYsNDJheCS8IxOqXpIlY4GKhMMmyrka'
WHERE email = 'fongbeead@gmail.com';
