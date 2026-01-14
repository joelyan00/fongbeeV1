import { supabaseAdmin } from './src/config/supabase.js';
import fs from 'fs';
import path from 'path';

async function run() {
    if (!supabaseAdmin) {
        console.error('Supabase admin not configured');
        return;
    }

    try {
        const sqlPath = path.join(process.cwd(), 'database', 'generate_test_order.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // We can't run the whole file with variables easily via RPC exec_sql if it has DO blocks or variables not supported by the simple wrapper.
        // Instead, let's just insert a specific order using JS for reliability.

        const orderId = 'c7310cd5-ccab-4398-8934-7b3648179b6a'; // Reuse the ID the user is on if possible, or create new.
        // Actually, force creating the one the user is on to fix their screen

        // 1. Check if user exists to link to
        const { data: user } = await supabaseAdmin.from('users').select('id').limit(1).single();
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'; // Fallback

        // 2. Check provider or create one
        let providerId = '00000000-0000-0000-0000-000000000000';
        const { data: provider } = await supabaseAdmin.from('providers').select('id').limit(1).single();

        if (provider) {
            providerId = provider.id;
        } else {
            // Try to create a provider for the user if none exists
            console.log('No providers found, attempting to create one for user:', userId);
            const { data: newProvider, error: createError } = await supabaseAdmin.from('providers').insert({
                user_id: userId,
                bio: 'Test Provider',
                experience_years: 5,
                service_radius_km: 10,
                status: 'approved'
            }).select().single();

            if (newProvider) {
                providerId = newProvider.id;
                console.log('Created new provider:', providerId);
            } else {
                console.error('Failed to create provider:', createError);
                // If table doesn't exist, we'll see it here
            }
        }

        // 3. Upsert order
        const { error } = await supabaseAdmin.from('orders').upsert({
            id: orderId,
            order_no: 'ORD-' + Date.now(),
            service_type: 'standard',
            user_id: userId,
            provider_id: providerId,
            status: 'captured',
            deposit_amount: 20.00,
            currency: 'CAD',
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error('Error creating restoration order:', error);
        } else {
            console.log(`Successfully restored/created order ${orderId}`);
        }

    } catch (e) {
        console.error('Script failed:', e);
    }
}

run();
