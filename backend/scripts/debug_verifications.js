
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log('CWD:', process.cwd());
console.log('Script dir:', __dirname);

// Try multiple paths
const paths = [
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../.env.local'),
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), 'backend/.env')
];

let loaded = false;
for (const p of paths) {
    if (dotenv.config({ path: p }).error === undefined) {
        console.log('Loaded env from:', p);
        loaded = true;
        break;
    }
}

if (!loaded) {
    // Try without path (default .env)
    dotenv.config();
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

console.log('Env Keys Present:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars. URL:', !!supabaseUrl, 'KEY:', !!supabaseServiceKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    console.log('Checking tables...');

    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: submissionsCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });

    console.log(`Orders count: ${ordersCount}`);
    console.log(`Submissions count: ${submissionsCount}`);

    // Get all verifications
    const { data: verifications, error } = await supabase
        .from('service_verifications')
        .select('*');

    if (error) {
        console.error('Error fetching verifications:', error);
    } else {
        console.log(`Found ${verifications.length} verifications.`);
        verifications.forEach(v => {
            console.log(`- ID: ${v.id}, Order: ${v.order_id}, Result: ${v.result}`);
        });
    }

    // Verify specific submission
    const targetId = 'c8f0426c-a252-4b4d-ab16-ddc1aadc1019';
    console.log(`Checking target submission: ${targetId}`);

    const { data: sub } = await supabase.from('submissions').select('*').eq('id', targetId).single();

    if (sub) {
        console.log('Submission found:');
        console.log('- User ID:', sub.user_id);
        console.log('- Provider ID:', sub.assigned_provider_id);
        console.log('- Status:', sub.status);
    } else {
        console.log('Submission not found!');
    }

    // Check if it exists in orders
    const { data: ord } = await supabase.from('orders').select('*').eq('id', targetId).single();
    if (ord) console.log('Order record EXISTS.');
    else console.log('Order record MISSING.');
}

check();
