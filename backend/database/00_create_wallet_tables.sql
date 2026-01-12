-- ============================================================
-- Provider Wallet System
-- Stores provider earnings, deposits, and transaction history
-- ============================================================

-- 1. Provider Wallets Table (One per provider)
CREATE TABLE IF NOT EXISTS provider_wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES users(id) UNIQUE, -- 1:1 relationship with user
    
    -- Balance
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'CAD',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'suspended')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_provider_wallets_provider_id ON provider_wallets(provider_id);

-- 2. Wallet Transactions (Ledger)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES provider_wallets(id),
    
    -- Transaction Info
    amount DECIMAL(12, 2) NOT NULL, -- Positive for credit, Negative for debit
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'deposit_release',    -- 定金释放 (+ in regular booking)
        'milestone_payout',   -- 阶段付款 (+ in complex projects)
        'final_payout',       -- 尾款结算 (+)
        'penalty_deduction',  -- 罚金扣除 (-)
        'withdrawal',         -- 提现 (-)
        'refund_deduction',   -- 退款扣回 (-)
        'platform_fee',       -- 平台费 (-)
        'escrow_release'      -- 托管释放 (+ in emergency booking)
    )),
    
    -- References
    order_id UUID REFERENCES orders(id),
    reference_id VARCHAR(255), -- External ref (e.g., Stripe Payout ID)
    description TEXT,
    
    -- metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON wallet_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);

-- Trigger to update wallet balance on new transaction
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE provider_wallets
    SET balance = balance + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.wallet_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_wallet_balance ON wallet_transactions;
CREATE TRIGGER trg_update_wallet_balance
    AFTER INSERT ON wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_balance();

-- Trigger for updated_at on provider_wallets
DROP TRIGGER IF EXISTS update_provider_wallets_updated_at ON provider_wallets;
CREATE TRIGGER update_provider_wallets_updated_at
    BEFORE UPDATE ON provider_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
