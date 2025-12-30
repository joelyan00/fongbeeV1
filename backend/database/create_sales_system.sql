-- ============ Sales System Implementation ============

-- 1. Updates to Users Table
-- Add referrer_id to track who introduced this user (Provider/User)
ALTER TABLE users ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES users(id);

-- Update check constraint for role to include 'sales'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'provider', 'sales'));


-- 2. Create Sales Profiles Table
-- Stores specific information for Sales partners
CREATE TABLE IF NOT EXISTS sales_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
    referral_code VARCHAR(20) UNIQUE NOT NULL, -- The code they share: e.g. "JOEL888"
    commission_rate DECIMAL(5, 4) DEFAULT 0.1000, -- Default 10% commission (0.1000)
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    current_balance DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_profiles_user_id ON sales_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_profiles_code ON sales_profiles(referral_code);


-- 3. Create Commission Logs Table
-- Tracks every commission earned by a Sales partner
CREATE TABLE IF NOT EXISTS commission_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sales_id UUID REFERENCES users(id), -- The Sales person earning
    provider_id UUID REFERENCES users(id), -- The Provider generating the revenue
    order_id UUID, -- Reference to the order/submission (can be null if manual adjustment)
    order_amount DECIMAL(12, 2), -- Original Order Amount
    commission_amount DECIMAL(12, 2), -- Calculated Commission
    rate_snapshot DECIMAL(5, 4), -- Rate used at time of calculation
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_logs_sales_id ON commission_logs(sales_id);
CREATE INDEX IF NOT EXISTS idx_commission_logs_provider_id ON commission_logs(provider_id);


-- 4. Create Withdrawal Requests Table (Optional but recommended)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ Triggers ============
-- Auto-update updated_at for sales_profiles
DROP TRIGGER IF EXISTS update_sales_profiles_updated_at ON sales_profiles;
CREATE TRIGGER update_sales_profiles_updated_at
    BEFORE UPDATE ON sales_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Create Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id), -- The provider or user creating the ticket
    subject VARCHAR(255),
    description TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
