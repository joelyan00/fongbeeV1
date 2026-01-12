
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const orderId = '9083bfd4-cdd7-4931-8376-ce17b15dda3b';

    // Check orders table
    const { data: order } = await supabase
        .from('orders')
        .select('id, status, order_no')
        .eq('id', orderId)
        .single();
    console.log('Orders table status:', order?.status);

    // Check submissions table
    const { data: sub } = await supabase
        .from('submissions')
        .select('id, status')
        .eq('id', orderId)
        .single();
    console.log('Submissions table status:', sub?.status);

    // Check verification result
    const { data: ver } = await supabase
        .from('service_verifications')
        .select('result')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1);
    console.log('Verification result:', ver?.[0]?.result);
}

check();
