import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('\n========== 诊断：服务商能否看到订单 ==========\n');

// 1. 找到服务商老严
console.log('1. 查找服务商"老严"...');
const { data: users } = await supabase
    .from('users')
    .select('id, name, email, role')
    .ilike('name', '%老严%');

console.log('   用户:', users);

let providerId = null;
if (users && users.length > 0) {
    providerId = users[0].id;

    // 查找老严的 provider profile
    const { data: profile } = await supabase
        .from('provider_profiles')
        .select('id, company_name, service_categories, business_scope, status')
        .eq('user_id', providerId)
        .single();

    console.log('   服务商档案:', profile);

    // 查找老严已批准的服务类型
    const { data: apps } = await supabase
        .from('service_type_applications')
        .select('category, status')
        .eq('user_id', providerId);

    console.log('   服务类型申请:', apps);
}

// 2. 找到用户小严的订单
console.log('\n2. 查找用户"小严"的订单...');
const { data: xiaoyanUsers } = await supabase
    .from('users')
    .select('id, name, email')
    .ilike('name', '%小严%');

console.log('   用户:', xiaoyanUsers);

if (xiaoyanUsers && xiaoyanUsers.length > 0) {
    const xiaoyanId = xiaoyanUsers[0].id;

    // 查找小严的订单
    const { data: submissions } = await supabase
        .from('submissions')
        .select(`
            id,
            status,
            created_at,
            form_data,
            template_id,
            form_templates (id, name, type)
        `)
        .eq('user_id', xiaoyanId)
        .order('created_at', { ascending: false });

    console.log('   订单数量:', submissions?.length || 0);
    submissions?.forEach((s, i) => {
        console.log(`   订单${i + 1}:`, {
            id: s.id,
            status: s.status,
            template: s.form_templates?.name,
            created: s.created_at
        });
    });
}

// 3. 查找所有待处理的接送服务订单
console.log('\n3. 查找所有待处理的"接送服务"相关订单...');
const { data: allPendingSubmissions } = await supabase
    .from('submissions')
    .select(`
        id,
        status,
        user_id,
        template_id,
        form_templates (id, name, type)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

console.log('   待处理订单:');
allPendingSubmissions?.forEach(s => {
    console.log(`   - ${s.form_templates?.name || '未知模板'} | 状态: ${s.status} | ID: ${s.id.slice(0, 8)}`);
});

// 4. 检查后端的匹配逻辑
console.log('\n4. 模拟后端匹配逻辑...');
if (providerId) {
    // 获取服务商的服务类别
    const { data: profile } = await supabase
        .from('provider_profiles')
        .select('service_categories, business_scope')
        .eq('user_id', providerId)
        .single();

    const { data: approvedApps } = await supabase
        .from('service_type_applications')
        .select('category')
        .eq('user_id', providerId)
        .eq('status', 'approved');

    let myCategories = [];
    if (profile?.service_categories) {
        try {
            myCategories = typeof profile.service_categories === 'string'
                ? JSON.parse(profile.service_categories)
                : profile.service_categories;
        } catch (e) {
            myCategories = [profile.service_categories];
        }
    }
    if (profile?.business_scope && !myCategories.includes(profile.business_scope)) {
        myCategories.push(profile.business_scope);
    }
    if (approvedApps) {
        approvedApps.forEach(app => {
            if (!myCategories.includes(app.category)) {
                myCategories.push(app.category);
            }
        });
    }

    console.log('   老严可接的服务类别:', myCategories);

    // 检查每个待处理订单是否匹配
    console.log('\n   订单匹配结果:');
    allPendingSubmissions?.forEach(s => {
        const templateName = s.form_templates?.name;
        const isMatch = myCategories.some(cat => {
            // 完全匹配
            if (templateName === cat) return true;
            // 模板名称包含分类名
            if (templateName?.includes(cat)) return true;
            // 分类名包含模板名称（如 "接送服务" 包含 "接机"）
            if (cat?.includes(templateName?.replace('服务', ''))) return true;
            return false;
        });
        console.log(`   - ${templateName}: ${isMatch ? '✅ 匹配' : '❌ 不匹配'}`);
    });
}

console.log('\n========== 诊断完成 ==========\n');
