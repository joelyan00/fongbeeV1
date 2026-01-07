-- Create provider_services table for storing services created by providers
CREATE TABLE IF NOT EXISTS provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    category_id UUID REFERENCES service_categories(id),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    price_unit TEXT DEFAULT 'per_service',
    additional_rate DECIMAL(10, 2),
    tax_included BOOLEAN DEFAULT FALSE,
    inclusions TEXT,
    exclusions TEXT,
    materials_policy TEXT DEFAULT 'client_provides',
    extra_fees TEXT,
    duration INTEGER, -- in hours
    service_area TEXT,
    advance_booking INTEGER DEFAULT 24, -- hours
    client_requirements TEXT,
    cancellation_policy TEXT DEFAULT 'flexible',
    is_licensed BOOLEAN DEFAULT FALSE,
    has_insurance BOOLEAN DEFAULT FALSE,
    deposit_ratio INTEGER DEFAULT 20, -- 0-100
    service_mode TEXT DEFAULT 'offline', -- offline, remote, store
    add_ons JSONB DEFAULT '[]'::jsonb,
    images TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster provider lookups
CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_status ON provider_services(status);
CREATE INDEX IF NOT EXISTS idx_provider_services_category ON provider_services(category);

-- Add RLS policies
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

-- Providers can view their own services
CREATE POLICY "Providers can view own services" ON provider_services
    FOR SELECT USING (auth.uid() = provider_id OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Providers can create their own services
CREATE POLICY "Providers can create services" ON provider_services
    FOR INSERT WITH CHECK (auth.uid() = provider_id);

-- Providers can update their own services
CREATE POLICY "Providers can update own services" ON provider_services
    FOR UPDATE USING (auth.uid() = provider_id);

-- Public can view approved services
CREATE POLICY "Public can view approved services" ON provider_services
    FOR SELECT USING (status = 'approved');

COMMENT ON TABLE provider_services IS 'Services offered by providers';
