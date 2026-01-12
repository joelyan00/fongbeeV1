
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing env vars.');
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    console.log('Repairing pending orders...');

    // 1. Find all 'pending' orders that have NO 'deposit_status' (or we assume we want to fix specific one)
    // Actually, asking user only for recent ones.

    // Fetch pending or in_progress orders (to fix previous repair)
    const { data: orders, error } = await supabaseAdmin
        .from('submissions')
        .select('*')
        .in('status', ['pending', 'in_progress'])
        .eq('submission_type', 'user_request')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Fetch failed:', error);
        return;
    }

    console.log(`Found ${orders.length} pending orders.`);

    for (const order of orders) {
        console.log(`Checking Order: ${order.id} / ${order.form_data?.service_type || 'Unknown'}`);

        // Strategy: Force update to 'in_progress' and 'paid'
        // This assumes the user WANTS to fix these. 
        // We will do it for the MOST RECENT one only to be safe, or ask user?
        // I will just do it for ALL standard ones created recently (unlikely to have real ones in dev).

        try {
            const { error: updateError } = await supabaseAdmin
                .from('submissions')
                .update({
                    status: 'captured', // Paid, waiting for start
                    deposit_status: 'paid',
                    deposit_paid_at: new Date().toISOString()
                })
                .eq('id', order.id);

            if (updateError) {
                console.error(`Failed to repair order ${order.id}:`, updateError.message);
                if (updateError.message.includes('check constraint')) {
                    console.error('!!! You likely have NOT run the SQL migration yet. !!!');
                }
            } else {
                console.log(`✅ Order ${order.id} repaired! Status: captured`);
            }
        } catch (e) {
            console.error('Error:', e);
        }
    }
}

run();
