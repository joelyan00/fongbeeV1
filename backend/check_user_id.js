
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkUser() {
    // Check by email
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', 'joelyan@gmail.com')
        .maybeSingle();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('User found:', user?.id, user?.name, user?.email);
    }

    // Check orders where this user is both user and provider
    if (user) {
        const { data: overlap, error: overlapErr } = await supabaseAdmin
            .from('orders')
            .select('id, order_no, user_id, provider_id')
            .eq('user_id', user.id)
            .eq('provider_id', user.id);

        console.log(`Self-served orders (User ID == Provider ID): ${overlap?.length || 0}`);
        if (overlap && overlap.length > 0) {
            overlap.forEach(o => console.log(` - ${o.order_no}`));
        }
    }
}

checkUser();
