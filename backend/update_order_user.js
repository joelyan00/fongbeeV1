import { supabaseAdmin } from './src/config/supabase.js';

async function run() {
    if (!supabaseAdmin) {
        console.error('Supabase admin not configured');
        return;
    }

    const orderId = 'c7310cd5-ccab-4398-8934-7b3648179b6a';
    const correctUserId = 'f150b841-0e95-48c7-bf64-f3aaf9be1ef2'; // joelyan00

    const { error } = await supabaseAdmin.from('orders').update({
        user_id: correctUserId
    }).eq('id', orderId);

    if (error) {
        console.error('Error updating order:', error);
    } else {
        console.log('Order updated to user:', correctUserId);
    }
}

run();
