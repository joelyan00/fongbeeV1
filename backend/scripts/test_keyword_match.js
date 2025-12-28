// 测试新的匹配逻辑

const allMyCategories = ['接送服务'];
const templateName = '送机服务';

console.log(`\n测试: 服务商类别=${allMyCategories} 是否匹配模板="${templateName}"\n`);

// 1. Exact match
const exactMatch = allMyCategories.includes(templateName);
console.log(`1. 完全匹配: ${exactMatch}`);

// 2. Template name contains provider's category
let partialMatch = false;
for (const cat of allMyCategories) {
    if (templateName.includes(cat) || cat.includes(templateName.replace('服务', ''))) {
        partialMatch = true;
    }
}
console.log(`2. 部分匹配: ${partialMatch}`);

// 3. Parent category match - skipped (no parent)
console.log(`3. 父分类匹配: false (无父分类数据)`);

// 4. Keyword-based matching
let keywordMatch = false;
for (const cat of allMyCategories) {
    const catKeyword = cat.replace('服务', '');
    const templateKeyword = templateName.replace('服务', '');

    console.log(`   catKeyword=${catKeyword}, templateKeyword=${templateKeyword}`);

    // For "接送" category
    if (catKeyword === '接送') {
        if (templateKeyword.includes('送') || templateKeyword.includes('接') || templateKeyword.includes('接送')) {
            console.log(`   ✅ 特殊规则: "${catKeyword}" 匹配 "${templateKeyword}" (包含 送/接)`);
            keywordMatch = true;
        }
    }
}
console.log(`4. 关键词匹配: ${keywordMatch}`);

console.log(`\n最终结果: ${exactMatch || partialMatch || keywordMatch ? '✅ 匹配成功' : '❌ 不匹配'}`);
