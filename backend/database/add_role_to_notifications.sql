
-- Add target_role column to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_role VARCHAR(20) DEFAULT 'user';

-- Update existing notifications (optional, but good for data consistency)
-- Most existing order notifications for providers have 'new_order' etc in extra_data
UPDATE notifications 
SET target_role = 'provider' 
WHERE extra_data->>'type' IN ('new_order', 'order_verified', 'rework_requested', 'order_rated');
