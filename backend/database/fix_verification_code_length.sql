-- Alter verification_code column to accept longer tokens
-- Run this in Supabase SQL Editor

ALTER TABLE service_verifications 
ALTER COLUMN verification_code TYPE VARCHAR(50);
