
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
    console.log('Inserting test user...');

    // 1. Check if user exists or insert. Since we can't easily insert via raw SQL with admin client usually without rpc, 
    // let's just insert into provider_profiles if we can find a user, or try to create one via auth api if possible.
    // Actually, standard table insertion works if RLS allows or using service role.

    // Let's first try to get any user to use as provider.
    const { data: users, error: uErr } = await supabase.from('users').select('id').limit(1);

    if (uErr) {
        console.error('Error fetching users', uErr);
        return;
    }

    let providerId;

    if (users && users.length > 0) {
        providerId = users[0].id; // Use first available user
        console.log('Using existing user as test provider:', providerId);
    } else {
        console.log('No users found. Please sign up a user first.');
        return;
    }

    // 2. Upsert provider profile
    const { error: pErr } = await supabase.from('provider_profiles').upsert({
        user_id: providerId,
        company_name: 'Test Provider Company',
        service_categories: ['Moving', 'Cleaning', 'General'],
        status: 'approved',
        status: 'approved',
        service_city: 'Toronto'
    });

    if (pErr) console.error('Error upserting profile', pErr);
    else console.log('Provider profile upserted successfully!');
}

run();
