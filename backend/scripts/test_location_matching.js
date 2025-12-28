import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('\n========== 测试分类 + 位置匹配 ==========\n');

// 模拟老严的服务范围
const allMyCategories = ['接送服务'];
const serviceCities = ['toronto', 'markham', 'richmond hill', 'mississauga', 'scarborough'];
const serviceAirports = []; // 老严没有配置具体机场

console.log('老严的服务类别:', allMyCategories);
console.log('老严的服务城市:', serviceCities);
console.log('老严的服务机场:', serviceAirports.length ? serviceAirports : '(未配置，将通过城市匹配机场)');

// 获取待处理订单
const { data: pendingSubmissions } = await supabase
    .from('submissions')
    .select('id, template_id, form_data, user_email')
    .eq('status', 'pending');

const templateIds = [...new Set(pendingSubmissions?.map(s => s.template_id).filter(id => id))];
let templateMap = {};
if (templateIds.length > 0) {
    const { data: templates } = await supabase
        .from('form_templates')
        .select('id, name')
        .in('id', templateIds);
    templateMap = templates?.reduce((acc, t) => { acc[t.id] = t; return acc; }, {}) || {};
}

console.log(`\n找到 ${pendingSubmissions?.length || 0} 个待处理订单:\n`);

pendingSubmissions?.forEach((s, i) => {
    const templateName = templateMap[s.template_id]?.name || '未知';
    console.log(`订单 ${i + 1}: ${templateName} (${s.user_email})`);

    // 1. 分类匹配
    let categoryMatch = false;
    const catKeyword = '接送';
    const templateKeyword = templateName.replace('服务', '');
    if (templateKeyword.includes('送') || templateKeyword.includes('接')) {
        categoryMatch = true;
    }
    console.log(`  分类匹配: ${categoryMatch ? '✅' : '❌'}`);

    // 2. 位置匹配
    const formData = s.form_data || {};
    let orderCity = null;
    let orderAirport = null;

    for (const key of Object.keys(formData)) {
        const field = formData[key];
        if (field && typeof field === 'object') {
            if (field.type === 'address' && field.value) {
                orderCity = field.value.city?.toLowerCase();
            }
            if (field.label && field.label.includes('机场')) {
                orderAirport = (field.value || '').toLowerCase();
            }
        }
    }

    console.log(`  订单城市: ${orderCity || '(无)'}`);
    console.log(`  订单机场: ${orderAirport || '(无)'}`);

    let locationMatch = false;

    // 检查城市
    if (orderCity) {
        locationMatch = serviceCities.some(sc => sc.includes(orderCity) || orderCity.includes(sc));
        console.log(`  城市匹配: ${locationMatch ? '✅' : '❌'}`);
    }

    // 检查机场（通过城市名）
    if (!locationMatch && orderAirport) {
        locationMatch = serviceCities.some(sc => orderAirport.includes(sc));
        console.log(`  机场城市匹配: ${locationMatch ? '✅' : '❌'}`);
    }

    const finalMatch = categoryMatch && locationMatch;
    console.log(`  最终结果: ${finalMatch ? '✅ 老严可见' : '❌ 老严不可见'}`);
    console.log();
});

console.log('========== 测试完成 ==========\n');
