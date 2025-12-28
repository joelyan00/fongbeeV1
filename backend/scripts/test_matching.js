import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('\n========== 测试匹配逻辑 ==========\n');

// 模拟后端的匹配逻辑
const { data: pendingSubmissions } = await supabase
    .from('submissions')
    .select('id, template_id, status')
    .eq('status', 'pending');

const templateIds = [...new Set(pendingSubmissions.map(s => s.template_id).filter(id => id))];

let templateMap = {};
if (templateIds.length > 0) {
    const { data: templates } = await supabase
        .from('form_templates')
        .select('id, name')
        .in('id', templateIds);
    templateMap = templates?.reduce((acc, t) => { acc[t.id] = t; return acc; }, {}) || {};
}

// 老严的服务类别
const laoyangId = (await supabase.from('users').select('id').eq('email', 'joelyan00@gmail.com').single()).data.id;

const { data: profile } = await supabase
    .from('provider_profiles')
    .select('service_categories')
    .eq('user_id', laoyangId)
    .single();

const { data: approvedApps } = await supabase
    .from('service_type_applications')
    .select('category')
    .eq('user_id', laoyangId)
    .eq('status', 'approved');

const allMyCategories = [...(profile?.service_categories || [])];
approvedApps?.forEach(app => {
    if (!allMyCategories.includes(app.category)) {
        allMyCategories.push(app.category);
    }
});

console.log('老严的所有服务类别:', allMyCategories);

// 获取分类的父子关系
const { data: allCategories } = await supabase
    .from('service_categories')
    .select('id, name, parent_id');

const childToParentMap = {};
allCategories?.forEach(cat => {
    if (cat.parent_id) {
        const parent = allCategories.find(c => c.id === cat.parent_id);
        if (parent) {
            childToParentMap[cat.name] = parent.name;
        }
    }
});

console.log('\n子分类->父分类映射:', childToParentMap);

// 测试匹配
console.log('\n待处理订单匹配测试:');
pendingSubmissions?.forEach(s => {
    const templateName = templateMap[s.template_id]?.name || '未知';
    console.log(`\n订单模板: "${templateName}"`);

    // 1. Exact match
    const exactMatch = allMyCategories.includes(templateName);
    console.log(`  1. 完全匹配: ${exactMatch}`);

    // 2. Partial match
    let partialMatch = false;
    for (const cat of allMyCategories) {
        if (templateName.includes(cat) || cat.includes(templateName.replace('服务', ''))) {
            partialMatch = true;
            console.log(`  2. 部分匹配: ✅ (${cat} <-> ${templateName})`);
            break;
        }
    }
    if (!partialMatch) console.log(`  2. 部分匹配: ❌`);

    // 3. Parent match
    const parentCat = childToParentMap[templateName];
    const parentMatch = parentCat && allMyCategories.includes(parentCat);
    console.log(`  3. 父分类匹配: ${parentMatch ? '✅ (父分类: ' + parentCat + ')' : '❌ (无父分类或父分类不匹配)'}`);

    const finalMatch = exactMatch || partialMatch || parentMatch;
    console.log(`  最终结果: ${finalMatch ? '✅ 匹配成功' : '❌ 不匹配'}`);
});

console.log('\n========== 测试完成 ==========\n');
