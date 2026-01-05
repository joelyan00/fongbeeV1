-- ============================================================
-- Add Optimistic Locking and Idempotency for Fault Tolerance
-- ============================================================

-- 1. Add version column to orders for optimistic locking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;

-- 2. Add idempotency_key to prevent duplicate orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- 3. Add processed flag to webhook events for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id VARCHAR(100) UNIQUE NOT NULL, -- Stripe event ID
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payload JSONB
);

-- RLS for webhook_events
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to webhook_events" ON webhook_events FOR ALL USING (auth.role() = 'service_role');

-- 4. Function for atomic status update with optimistic locking
CREATE OR REPLACE FUNCTION update_order_status_atomic(
    p_order_id UUID,
    p_current_version INT,
    p_new_status VARCHAR,
    p_new_capture_status VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INT;
BEGIN
    UPDATE orders
    SET 
        status = p_new_status,
        stripe_capture_status = COALESCE(p_new_capture_status, stripe_capture_status),
        version = version + 1,
        updated_at = NOW()
    WHERE id = p_order_id 
      AND version = p_current_version;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    -- Return true if exactly one row was updated
    RETURN rows_affected = 1;
END;
$$ LANGUAGE plpgsql;

-- 5. Function for atomic verification code check
CREATE OR REPLACE FUNCTION verify_code_atomic(
    p_verification_id UUID,
    p_code VARCHAR,
    p_max_attempts INT DEFAULT 3
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    v_record RECORD;
BEGIN
    -- Lock the row
    SELECT * INTO v_record
    FROM service_verifications
    WHERE id = p_verification_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, '验证记录不存在'::TEXT;
        RETURN;
    END IF;
    
    -- Check if already verified
    IF v_record.code_verified_at IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, '已经验证过'::TEXT;
        RETURN;
    END IF;
    
    -- Check expiry
    IF NOW() > v_record.code_expires_at THEN
        RETURN QUERY SELECT FALSE, '验证码已过期'::TEXT;
        RETURN;
    END IF;
    
    -- Check attempts
    IF v_record.attempts >= p_max_attempts THEN
        RETURN QUERY SELECT FALSE, '尝试次数过多'::TEXT;
        RETURN;
    END IF;
    
    -- Check code
    IF v_record.verification_code != p_code THEN
        UPDATE service_verifications
        SET attempts = attempts + 1
        WHERE id = p_verification_id;
        
        RETURN QUERY SELECT FALSE, ('验证码错误，剩余' || (p_max_attempts - v_record.attempts - 1) || '次')::TEXT;
        RETURN;
    END IF;
    
    -- Success - update record
    UPDATE service_verifications
    SET 
        code_verified_at = NOW(),
        result = 'approved'
    WHERE id = p_verification_id;
    
    RETURN QUERY SELECT TRUE, '验证成功'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Done
-- ============================================================
COMMENT ON COLUMN orders.version IS 'Optimistic locking version number';
COMMENT ON COLUMN orders.idempotency_key IS 'Unique key to prevent duplicate order creation';
COMMENT ON TABLE webhook_events IS 'Processed webhook events to ensure idempotency';
