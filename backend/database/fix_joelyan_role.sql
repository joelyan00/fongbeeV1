-- Force 'joelyan00@gmail.com' to be a Provider
-- Run this in Supabase SQL Editor if the user is stuck as Admin

UPDATE users 
SET role = 'provider' 
WHERE email = 'joelyan00@gmail.com';

-- Verify the change
SELECT * FROM users WHERE email = 'joelyan00@gmail.com';
