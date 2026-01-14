import { supabaseAdmin } from './src/config/supabase.js';

async function run() {
    const orderId = 'c7310cd5-ccab-4398-8934-7b3648179b6a';
    const userId = 'f150b841-0e95-48c7-bf64-f3aaf9be1ef2';

    // Set both user_id and provider_id to the same user to ensure access
    const { error } = await supabaseAdmin.from('orders').update({
        user_id: userId,
        provider_id: userId
    }).eq('id', orderId);

    if (error) {
        console.error('Error updating order:', error);
    } else {
        console.log('Order updated allow access for:', userId);
    }
}
run();
