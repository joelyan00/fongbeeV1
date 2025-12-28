-- Create Service Categories table
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(255) DEFAULT 'grid', -- Icon name or Image URL
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories (matching your current hardcoded ones)
INSERT INTO service_categories (name, icon, sort_order) VALUES
    ('搬家服务', 'truck', 10),
    ('接机服务', 'plane', 20),
    ('家庭清洁', 'home', 30),
    ('日常保洁', 'spray', 31),
    ('房屋保养', 'tool', 40),
    ('庭院维护', 'sun', 50),
    ('税务理财', 'dollar-sign', 60),
    ('房产交易', 'key', 70),
    ('汽车服务', 'car', 80),
    ('水管维修', 'droplet', 90),
    ('电路维修', 'zap', 100),
    ('其他服务', 'grid', 999)
ON CONFLICT (name) DO NOTHING;

-- Grant permissions (if needed, usually service_role has access)
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON service_categories FOR ALL USING (
  exists (select 1 from users where users.id = auth.uid() and users.role = 'admin')
);
