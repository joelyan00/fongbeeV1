
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from current directory (backend)
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    const orderNo = 'ORD20260121517503';
    console.log(`Diagnosing order: ${orderNo}`);

    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_no', orderNo)
        .single();

    if (error) {
        console.error('Order not found:', error);
        return;
    }

    console.log('Order Schema Keys:', Object.keys(order));
    console.log('User Last Active:', order.user_last_active_at);
    console.log('Provider Last Active:', order.provider_last_active_at);

    // Check messages
    const { data: messages } = await supabase
        .from('order_messages')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });

    console.log(`\nMessages found: ${messages?.length || 0}`);
}

diagnose();
