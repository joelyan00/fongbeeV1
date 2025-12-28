import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('\n========== 检查服务范围和订单位置数据 ==========\n');

// 1. 老严的服务商档案 - 查看服务范围
console.log('1. 老严的服务商档案:');
const { data: laoyan } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'joelyan00@gmail.com')
    .single();

const { data: profile } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('user_id', laoyan.id)
    .single();

console.log('   服务商档案字段:');
Object.keys(profile || {}).forEach(key => {
    const val = profile[key];
    if (val !== null && val !== undefined) {
        console.log(`     ${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}`);
    }
});

// 2. 小严的订单 - 查看form_data中的位置信息
console.log('\n\n2. 小严的订单 form_data:');
const { data: submissions } = await supabase
    .from('submissions')
    .select('id, status, form_data, template_id')
    .eq('user_email', 'inegiup18@gmail.com')
    .eq('status', 'pending');

submissions?.forEach((s, i) => {
    console.log(`\n   订单 ${i + 1} (status: ${s.status}):`);
    console.log('   form_data:');
    const formData = s.form_data;
    Object.keys(formData || {}).forEach(key => {
        const val = formData[key];
        console.log(`     ${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}`);
    });
});

// 3. 检查接送服务的表单模板字段定义
console.log('\n\n3. 送机服务表单模板字段:');
const { data: templates } = await supabase
    .from('form_templates')
    .select('id, name, steps')
    .ilike('name', '%送机%');

templates?.forEach(t => {
    console.log(`\n   模板: ${t.name}`);
    t.steps?.forEach((step, idx) => {
        console.log(`   步骤 ${idx + 1}: ${step.title}`);
        step.fields?.forEach(f => {
            console.log(`     - ${f.label} (${f.type}, key: ${f.key})`);
        });
    });
});

console.log('\n========== 检查完成 ==========\n');
