import { supabaseAdmin } from './src/config/supabase.js';

async function run() {
    const orderId = 'c7310cd5-ccab-4398-8934-7b3648179b6a';
    const { data: order } = await supabaseAdmin.from('orders').select('user_id, provider_id').eq('id', orderId).single();
    console.log('Order participants:', order);
}
run();
