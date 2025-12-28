-- Add Credit System Support
-- Run this in Supabase SQL Editor

-- 1. Add credits column to users table (covers both Providers and Members)
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- 2. Add quote_credit_cost to form_templates (Cost to quote on this service)
ALTER TABLE form_templates ADD COLUMN IF NOT EXISTS quote_credit_cost INTEGER DEFAULT 0;

-- 3. Create Credit Transactions Table (Audit log for points)
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    amount INTEGER NOT NULL, -- Positive for add, Negative for spend
    type VARCHAR(50) NOT NULL, -- e.g., 'admin_gift', 'purchase', 'quote_fee', 'refund'
    description TEXT,
    created_by UUID REFERENCES users(id), -- Who performed the action (e.g., admin)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for transaction history
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);

-- 4. Create Service Quotes Table (To track providers quoting on submissions)
CREATE TABLE IF NOT EXISTS service_quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    quote_price DECIMAL(10, 2), -- Optional estimated price provided by provider
    message TEXT, -- Message to the user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for quotes
CREATE INDEX IF NOT EXISTS idx_service_quotes_submission_id ON service_quotes(submission_id);
CREATE INDEX IF NOT EXISTS idx_service_quotes_provider_id ON service_quotes(provider_id);

-- 5. RLS Policies

-- Credit Transactions Policies
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to transactions" ON credit_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Service Quotes Policies
ALTER TABLE service_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own quotes" ON service_quotes
    FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Users can view quotes for their submissions" ON service_quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM submissions 
            WHERE submissions.id = service_quotes.submission_id 
            AND submissions.user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can create quotes" ON service_quotes
    FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Service role has full access to quotes" ON service_quotes
    FOR ALL USING (auth.role() = 'service_role');
