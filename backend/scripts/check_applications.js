import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const { data } = await supabase
    .from('service_type_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

console.log('=== 最近的服务类型申请 ===');
data.forEach(app => {
    console.log(`\nID: ${app.id}`);
    console.log(`用户ID: ${app.user_id}`);
    console.log(`分类: ${app.category}`);
    console.log(`状态: ${app.status}`);
    console.log(`创建时间: ${app.created_at}`);
    console.log(`理由: ${app.reason || '无'}`);
});
