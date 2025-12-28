import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('\n========== 详细诊断：小严的订单 ==========\n');

// 1. 查找小严的所有订单（通过email）
console.log('1. 查找 inegiup18@gmail.com 的所有订单...');
const { data: submissions } = await supabase
    .from('submissions')
    .select(`
        id,
        user_id,
        user_email,
        template_id,
        status,
        created_at,
        form_templates (id, name, type)
    `)
    .eq('user_email', 'inegiup18@gmail.com')
    .order('created_at', { ascending: false });

console.log('   订单数量:', submissions?.length || 0);
submissions?.forEach((s, i) => {
    console.log(`\n   订单${i + 1}:`);
    console.log(`     ID: ${s.id}`);
    console.log(`     user_id: ${s.user_id}`);
    console.log(`     template_id: ${s.template_id}`);
    console.log(`     status: ${s.status}`);
    console.log(`     模板信息:`, s.form_templates);
});

// 2. 查找 pending 状态的订单
console.log('\n\n2. 查找所有 pending 状态订单...');
const { data: pendingSubmissions } = await supabase
    .from('submissions')
    .select(`
        id,
        user_email,
        template_id,
        status,
        form_templates (id, name, type)
    `)
    .eq('status', 'pending');

console.log('   Pending订单数量:', pendingSubmissions?.length || 0);
pendingSubmissions?.forEach(s => {
    console.log(`   - ${s.user_email} | 模板: ${s.form_templates?.name || s.template_id} | 状态: ${s.status}`);
});

// 3. 查找老严的服务类别
console.log('\n\n3. 查找老严的服务类别...');
const { data: laoyan } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'joelyan00@gmail.com')
    .single();

if (laoyan) {
    const { data: approvedApps } = await supabase
        .from('service_type_applications')
        .select('category, status')
        .eq('user_id', laoyan.id)
        .eq('status', 'approved');

    console.log('   老严已批准的服务类型:', approvedApps);

    // 检查匹配
    console.log('\n\n4. 检查订单-服务商匹配...');
    const myCategories = approvedApps?.map(a => a.category) || [];
    console.log('   老严的服务类别:', myCategories);

    pendingSubmissions?.forEach(s => {
        const templateName = s.form_templates?.name;
        console.log(`\n   订单模板名称: "${templateName}"`);

        // 检查各种匹配方式
        if (templateName) {
            const exactMatch = myCategories.includes(templateName);
            const partialMatch = myCategories.some(cat => templateName.includes(cat) || cat.includes(templateName));

            console.log(`     完全匹配 (templateName === category): ${exactMatch}`);
            console.log(`     部分匹配: ${partialMatch}`);
        } else {
            console.log(`     ⚠️  模板名称为空或未关联模板！`);
        }
    });
}

// 5. 检查 form_templates 表
console.log('\n\n5. 检查所有表单模板...');
const { data: templates } = await supabase
    .from('form_templates')
    .select('id, name, type, status')
    .order('name');

console.log('   表单模板:');
templates?.forEach(t => {
    console.log(`   - ${t.name} (${t.type}) | ID: ${t.id.slice(0, 8)}... | 状态: ${t.status}`);
});

console.log('\n========== 诊断完成 ==========\n');
