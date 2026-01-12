
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
    const { data } = await supabase
        .from('service_verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    console.log('Recent verifications:');
    data?.forEach(v => {
        console.log(`- Order: ${v.order_id}`);
        console.log(`  Photo URL: ${v.photo_url}`);
        console.log(`  Token: ${v.verification_code}`);
        console.log('---');
    });
}

check();
