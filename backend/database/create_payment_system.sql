-- ============================================================
-- Payment System Database Migration
-- Create tables for orders, milestones, contracts, verifications, ratings
-- ============================================================

-- 1. Orders Table (订单主表)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    
    -- Service Type
    service_type VARCHAR(30) NOT NULL CHECK (service_type IN ('standard', 'simple_custom', 'complex_custom')),
    
    -- Related Entities
    user_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID NOT NULL REFERENCES users(id),
    submission_id UUID REFERENCES submissions(id),
    service_listing_id UUID, -- For standard services
    
    -- Amounts
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    deposit_rate DECIMAL(5, 2) NOT NULL DEFAULT 0, -- Percentage (e.g., 30.00 = 30%)
    currency VARCHAR(3) DEFAULT 'CAD',
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'created' CHECK (status IN (
        'created',           -- Order created, awaiting payment
        'auth_hold',         -- Pre-auth success, in regret period
        'cancelled',         -- Cancelled by user in regret period
        'cancelled_by_provider', -- Cancelled by provider
        'cancelled_forfeit', -- Cancelled by user after regret period
        'captured',          -- Deposit captured, awaiting service
        'in_progress',       -- Service in progress
        'pending_verification', -- Awaiting user verification
        'rework',            -- Rework requested
        'verified',          -- Verified, awaiting rating
        'rated',             -- Rated, awaiting final payment
        'completed'          -- Fully completed
    )),
    
    -- Regret Period (for standard/simple_custom)
    regret_period_hours INT DEFAULT 24,
    cancel_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Stripe
    stripe_payment_intent_id VARCHAR(255),
    stripe_capture_status VARCHAR(20) DEFAULT 'uncaptured' CHECK (stripe_capture_status IN ('uncaptured', 'captured', 'refunded', 'partial_refund')),
    
    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    provider_rating_exempt BOOLEAN DEFAULT FALSE, -- User exempts provider from rating penalty
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. Order Milestones Table (里程碑/阶段)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Phase Info
    phase_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Amount
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'CAD',
    is_deposit BOOLEAN DEFAULT FALSE, -- True for deposit phase in complex_custom
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',              -- Not started
        'awaiting_payment',     -- Waiting for user to pay
        'paid_escrow',          -- Paid, held in escrow
        'in_progress',          -- Work in progress
        'pending_verification', -- Awaiting verification
        'verified',             -- Verified by user
        'paid_out',             -- Paid to provider
        'rework'                -- Rework requested
    )),
    
    -- Verification Code
    verification_code VARCHAR(10),
    code_expires_at TIMESTAMP WITH TIME ZONE,
    code_attempts INT DEFAULT 0,
    
    -- Stripe
    stripe_payment_intent_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    paid_out_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(order_id, phase_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_milestones_order_id ON order_milestones(order_id);
CREATE INDEX IF NOT EXISTS idx_order_milestones_status ON order_milestones(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_order_milestones_updated_at ON order_milestones;
CREATE TRIGGER update_order_milestones_updated_at
    BEFORE UPDATE ON order_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. Order Contracts Table (合同版本管理)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Version
    version INT NOT NULL DEFAULT 1,
    parent_version_id UUID REFERENCES order_contracts(id),
    
    -- Content
    content TEXT NOT NULL, -- Contract body (Markdown/HTML)
    milestones_snapshot JSONB, -- Snapshot of milestones at signing time
    
    -- Signing Status
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft',            -- Being edited
        'pending_provider', -- Waiting for provider to sign
        'pending_user',     -- Waiting for user to sign
        'signed',           -- Both parties signed
        'superseded'        -- Replaced by newer version
    )),
    
    -- Signatures
    provider_signed_at TIMESTAMP WITH TIME ZONE,
    user_signed_at TIMESTAMP WITH TIME ZONE,
    
    -- Modification Request
    modification_requested_by UUID REFERENCES users(id),
    modification_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(order_id, version)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_contracts_order_id ON order_contracts(order_id);
CREATE INDEX IF NOT EXISTS idx_order_contracts_status ON order_contracts(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_order_contracts_updated_at ON order_contracts;
CREATE TRIGGER update_order_contracts_updated_at
    BEFORE UPDATE ON order_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. Service Verifications Table (服务验证记录)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES order_milestones(id) ON DELETE CASCADE,
    
    -- Type
    type VARCHAR(30) NOT NULL CHECK (type IN ('start_service', 'request_acceptance')),
    
    -- Photo Evidence
    photo_url TEXT,
    
    -- Verification Code
    verification_code VARCHAR(10),
    code_sent_at TIMESTAMP WITH TIME ZONE,
    code_expires_at TIMESTAMP WITH TIME ZONE,
    code_verified_at TIMESTAMP WITH TIME ZONE,
    attempts INT DEFAULT 0,
    
    -- Result
    result VARCHAR(20) CHECK (result IN ('pending', 'approved', 'rework_required')),
    remark TEXT,
    user_photos JSONB, -- Photos uploaded by user for verification
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_verifications_order_id ON service_verifications(order_id);
CREATE INDEX IF NOT EXISTS idx_service_verifications_milestone_id ON service_verifications(milestone_id);

-- ============================================================
-- 5. Order Ratings Table (评价)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Rater
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Rating
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    photos JSONB, -- Array of photo URLs
    
    -- Response from provider
    provider_response TEXT,
    provider_responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(order_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_ratings_order_id ON order_ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_order_ratings_user_id ON order_ratings(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_order_ratings_updated_at ON order_ratings;
CREATE TRIGGER update_order_ratings_updated_at
    BEFORE UPDATE ON order_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. Provider Cancellation Stats (服务商取消统计)
-- ============================================================
CREATE TABLE IF NOT EXISTS provider_cancellation_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES users(id),
    
    -- Monthly stats
    year_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    total_orders INT DEFAULT 0,
    cancelled_orders INT DEFAULT 0,
    cancellation_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage
    
    -- Rating penalty
    rating_penalties_applied INT DEFAULT 0,
    rating_penalties_exempted INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider_id, year_month)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_provider_cancellation_stats_provider_id ON provider_cancellation_stats(provider_id);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_cancellation_stats ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to orders" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to order_milestones" ON order_milestones FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to order_contracts" ON order_contracts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to service_verifications" ON service_verifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to order_ratings" ON order_ratings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to provider_cancellation_stats" ON provider_cancellation_stats FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- Utility Function: Generate Order Number
-- ============================================================
CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS VARCHAR(50) AS $$
DECLARE
    prefix VARCHAR(10);
    date_part VARCHAR(8);
    seq_part VARCHAR(6);
BEGIN
    prefix := 'ORD';
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');
    seq_part := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    RETURN prefix || date_part || seq_part;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Done
-- ============================================================
COMMENT ON TABLE orders IS 'Main orders table for all service types';
COMMENT ON TABLE order_milestones IS 'Payment milestones for orders (deposit + phases)';
COMMENT ON TABLE order_contracts IS 'Contract version management for complex custom services';
COMMENT ON TABLE service_verifications IS 'Service start and acceptance verification records';
COMMENT ON TABLE order_ratings IS 'User ratings for completed orders';
COMMENT ON TABLE provider_cancellation_stats IS 'Monthly cancellation statistics for providers';
