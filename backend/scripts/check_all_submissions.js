import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('查询所有 submissions...\n');

const { data, count } = await supabase
    .from('submissions')
    .select('id, user_id, user_email, template_id, status, created_at', { count: 'exact' });

console.log('总订单数:', count);
console.log('\n所有订单:');
data?.forEach(s => {
    console.log(`- email: ${s.user_email || 'NULL'} | status: ${s.status} | template_id: ${s.template_id?.slice(0, 8) || 'NULL'} | created: ${s.created_at}`);
});

// 也检查 user_email 列是否有数据
console.log('\n\n检查 user_email 列:');
const { data: emailCheck } = await supabase
    .from('submissions')
    .select('user_email')
    .not('user_email', 'is', null);
console.log('有 user_email 的记录数:', emailCheck?.length || 0);
