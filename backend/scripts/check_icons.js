import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const { data } = await supabase.from('service_categories').select('name, icon').order('sort_order');
console.log('=== 数据库中的分类和图标 ===');
data.forEach(c => console.log(c.name + ': ' + c.icon));
