-- Add site configuration settings
INSERT INTO system_settings (key, value)
VALUES 
    ('site_name', '优服佳'),
    ('site_phone', '1-888-888-8888'),
    ('site_email', 'support@youfujia.com'),
    ('service_area', 'Greater Toronto Area (GTA), including Toronto, Markham, Richmond Hill, Vaughan, Mississauga, etc.')
ON CONFLICT (key) DO NOTHING;
