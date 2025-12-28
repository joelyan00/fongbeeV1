-- 1. Update Users Table: Wallet Balance
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10, 2) DEFAULT 0.00;

-- 2. Update Orders Table: Payment Tracking
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS deposit_price DECIMAL(10, 2) DEFAULT 0.00;

-- Payment Status
-- pending_deposit: 已接单，待付定金
-- deposit_paid: 已付定金，待开工
-- in_progress: 已开工 (定金已划拨)
-- pending_balance: 完工，待付尾款
-- completed: 尾款已付，订单结束
-- cancelled: 取消
-- Note: existing 'status' column might be used, but let's add a specific 'payment_stage' to avoid confusion, 
-- or just use the main status. Let's use specific columns for amounts and rely on main status for flow.
-- We'll imply stages from the main status + money fields.

-- 3. Create Transactions Table (Ledger)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    order_id UUID REFERENCES service_requests(id),
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'deposit_incoming', 'deposit_release_to_provider', 'balance_payment', 'withdrawal'
    status VARCHAR(50) DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON wallet_transactions(user_id);
