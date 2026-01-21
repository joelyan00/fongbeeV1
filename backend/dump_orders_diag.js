
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function dumpOrders() {
    const userId = '13281d67-c208-4668-a247-c1a5e20f1007'; // joelyan@gmail.com

    console.log(`Dumping orders for userId: ${userId}`);

    const { data: asUser, error: err1 } = await supabaseAdmin
        .from('orders')
        .select('id, order_no, user_id, provider_id, service_title')
        .eq('user_id', userId);

    console.log(`Orders as CLIENT (${asUser?.length || 0}):`);
    asUser?.forEach(o => console.log(` - ${o.order_no} | ID: ${o.id} | Provider: ${o.provider_id} | Title: ${o.service_title}`));

    const { data: asProvider, error: err2 } = await supabaseAdmin
        .from('orders')
        .select('id, order_no, user_id, provider_id, service_title')
        .eq('provider_id', userId);

    console.log(`Orders as PROVIDER (${asProvider?.length || 0}):`);
    asProvider?.forEach(o => console.log(` - ${o.order_no} | ID: ${o.id} | User: ${o.user_id} | Title: ${o.service_title}`));
}

dumpOrders();
