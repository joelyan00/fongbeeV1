import { supabaseAdmin } from './src/config/supabase.js';

async function run() {
    if (!supabaseAdmin) {
        console.error('Supabase admin not configured');
        return;
    }

    const userId = 'f150b841-0e95-48c7-bf64-f3aaf9be1ef2';
    const providerId = userId; // Reuse ID for simplicity

    // Create provider
    const { data: provider, error } = await supabaseAdmin.from('providers').upsert({
        id: providerId,
        user_id: userId,
        bio: 'Test Provider',
        status: 'approved'
    });

    if (error) {
        console.error('Error creating provider:', error);
    } else {
        console.log('Provider created/ensured:', providerId);
    }

    // Double check order linkage
    const { data: order } = await supabaseAdmin.from('orders').select('id, provider_id').eq('id', 'c7310cd5-ccab-4398-8934-7b3648179b6a').single();
    console.log('Order linkage verified:', order);
}

run();
