-- Update the default admin email
-- Execute this query in your Supabase SQL Editor to update the admin account email.

UPDATE users 
SET email = 'joelyan00@gmail.com' 
WHERE email = 'admin@youfujia.com';
