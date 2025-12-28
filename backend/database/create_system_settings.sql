CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default 10% fee
INSERT INTO system_settings (key, value, description)
VALUES ('platform_fee_percent', '10', 'Percentage of deposit taken as platform fee')
ON CONFLICT (key) DO NOTHING;
