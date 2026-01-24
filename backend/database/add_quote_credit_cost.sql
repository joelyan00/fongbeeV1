-- Add quote_credit_cost column to service_categories table
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS quote_credit_cost INTEGER DEFAULT 0;

-- Optional: Update existing rows to have default 0 if needed (though default handles new rows)
-- UPDATE service_categories SET quote_credit_cost = 0 WHERE quote_credit_cost IS NULL;
