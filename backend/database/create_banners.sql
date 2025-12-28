CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying active banners
CREATE INDEX IF NOT EXISTS idx_banners_active_dates ON banners (is_active, start_date, end_date);

-- Insert some sample data
INSERT INTO banners (title, image_url, link_url, start_date, end_date, sort_order)
VALUES 
('Deep Cleaning Promo', 'https://images.unsplash.com/photo-1581578731117-104f2a863ccb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '/details/cleaning', NOW(), NOW() + INTERVAL '30 days', 1),
('Moving Service', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '/details/moving', NOW(), NOW() + INTERVAL '30 days', 2);
