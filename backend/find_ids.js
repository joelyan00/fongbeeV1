import { supabaseAdmin } from './src/config/supabase.js';

async function run() {
    if (!supabaseAdmin) {
        console.error('Supabase admin not configured');
        return;
    }

    // Get a user
    const { data: users } = await supabaseAdmin.from('users').select('id, email').limit(5);
    console.log('Users:', users);

    // Get a provider
    const { data: providers, error } = await supabaseAdmin.from('providers').select('id, user_id').limit(5);
    console.log('Providers:', providers);
    if (error) console.error('Provider Error:', error);
}

run();
