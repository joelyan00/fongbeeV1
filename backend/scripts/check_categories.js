import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('\n========== 检查分类表结构 ==========\n');

const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .order('name');

console.log('所有分类:');
categories?.forEach(cat => {
    console.log(`- ${cat.name}`);
    console.log(`    ID: ${cat.id}`);
    console.log(`    parent_id: ${cat.parent_id || '无'}`);
    console.log(`    is_active: ${cat.is_active}`);
});

// 检查 form_templates 表中的名称
console.log('\n\n========== 表单模板名称 ==========\n');
const { data: templates } = await supabase
    .from('form_templates')
    .select('id, name, type')
    .order('name');

templates?.forEach(t => {
    console.log(`- ${t.name} (${t.type})`);
});
