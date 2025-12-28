import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const { data, count } = await supabase
    .from('service_type_applications')
    .select('id, user_id, category, status, created_at, reason', { count: 'exact' });

console.log('总记录数:', count);
console.log('所有记录:');
data.forEach(app => {
    console.log(`- ${app.category} | ${app.status} | ${app.created_at}`);
});
