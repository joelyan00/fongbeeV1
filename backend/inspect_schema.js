import { supabaseAdmin } from './src/config/supabase.js';

async function run() {
    if (!supabaseAdmin) {
        console.error('Supabase admin not configured');
        return;
    }

    // Try to get one order to see keys
    const { data, error } = await supabaseAdmin.from('orders').select('*').limit(1).single();

    if (data) {
        console.log('Order Schema Keys:', Object.keys(data));
    } else {
        console.error('Could not fetch order or no orders exist:', error);
    }
}

run();
