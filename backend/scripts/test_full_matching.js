import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('\n========== 测试完整匹配逻辑 ==========\n');

// 模拟后端的完整匹配逻辑
const allMyCategories = ['接送服务'];

// 测试用例
const testTemplates = ['送机服务', '接机服务', '普通接送', '搬家服务', '家庭清洁'];

console.log('服务商类别:', allMyCategories);
console.log('\n匹配测试:\n');

testTemplates.forEach(templateName => {
    let matched = false;
    let matchReason = '';

    // 1. Exact match
    if (allMyCategories.includes(templateName)) {
        matched = true;
        matchReason = '完全匹配';
    }

    // 2. Partial match
    if (!matched) {
        for (const cat of allMyCategories) {
            if (templateName.includes(cat) || cat.includes(templateName.replace('服务', ''))) {
                matched = true;
                matchReason = '部分匹配';
                break;
            }
        }
    }

    // 3. Parent category match - skipped (no data in service_categories)

    // 4. Keyword-based matching
    if (!matched) {
        for (const cat of allMyCategories) {
            const catKeyword = cat.replace('服务', '');
            const templateKeyword = templateName.replace('服务', '');

            if (catKeyword === '接送') {
                if (templateKeyword.includes('送') || templateKeyword.includes('接') || templateKeyword.includes('接送')) {
                    matched = true;
                    matchReason = `关键词匹配 ("${catKeyword}" ↔ "${templateKeyword}")`;
                    break;
                }
            } else if (catKeyword.length >= 2 && templateKeyword.length >= 2) {
                for (let i = 0; i < catKeyword.length - 1; i++) {
                    const substr = catKeyword.substring(i, i + 2);
                    if (templateKeyword.includes(substr)) {
                        matched = true;
                        matchReason = `关键词匹配 (共同词: "${substr}")`;
                        break;
                    }
                }
            }
        }
    }

    console.log(`  "${templateName}" → ${matched ? '✅ 匹配' : '❌ 不匹配'}${matchReason ? ` (${matchReason})` : ''}`);
});

// 检查实际的 pending 订单
console.log('\n\n========== 实际待处理订单检查 ==========\n');

const { data: pendingSubmissions } = await supabase
    .from('submissions')
    .select('id, template_id, status, user_email')
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

console.log(`找到 ${pendingSubmissions?.length || 0} 个待处理订单:`);
pendingSubmissions?.forEach(s => {
    const templateName = templateMap[s.template_id]?.name || '未知';

    // 应用匹配逻辑
    let matched = false;
    for (const cat of allMyCategories) {
        const catKeyword = cat.replace('服务', '');
        const templateKeyword = templateName.replace('服务', '');

        if (catKeyword === '接送') {
            if (templateKeyword.includes('送') || templateKeyword.includes('接') || templateKeyword.includes('接送')) {
                matched = true;
                break;
            }
        }
    }

    console.log(`  - ${s.user_email} | ${templateName} | ${matched ? '✅ 老严可见' : '❌ 老严不可见'}`);
});

console.log('\n========== 测试完成 ==========\n');
