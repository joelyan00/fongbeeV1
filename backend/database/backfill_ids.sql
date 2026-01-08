-- Backfill script for Member IDs
-- Generates MEMBER-YYYYMMDD-XXXXX for users who don't have one
-- Uses the user's created_at date to keep history meaningful

DO $$
DECLARE
    r RECORD;
    new_id TEXT;
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    rand_suffix TEXT;
    i INT;
    created_date TEXT;
BEGIN
    FOR r IN SELECT id, created_at FROM users WHERE member_id IS NULL LOOP
        -- 1. Generate Random 5-char formatting
        rand_suffix := '';
        FOR i IN 1..5 LOOP
            rand_suffix := rand_suffix || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;

        -- 2. Format Date (use Created At, default to Now if null)
        IF r.created_at IS NOT NULL THEN
            created_date := to_char(r.created_at, 'YYYYMMDD');
        ELSE
            created_date := to_char(NOW(), 'YYYYMMDD');
        END IF;

        -- 3. Construct ID
        new_id := 'MEMBER-' || created_date || '-' || rand_suffix;

        -- 4. Update
        UPDATE users SET member_id = new_id WHERE id = r.id;
        
        RAISE NOTICE 'Updated User % with ID %', r.id, new_id;
    END LOOP;
END $$;
