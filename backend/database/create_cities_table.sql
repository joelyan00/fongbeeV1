CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT, -- e.g., 'toronto', 'vancouver'
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Data
INSERT INTO cities (name, code, sort_order) VALUES 
('多伦多', 'toronto', 10),
('温哥华', 'vancouver', 20),
('万锦', 'markham', 30),
('列治文山', 'richmond-hill', 40),
('列治文', 'richmond', 50),
('本拿比', 'burnaby', 60),
('蒙特利尔', 'montreal', 70),
('卡尔加里', 'calgary', 80),
('渥太华', 'ottawa', 90);
