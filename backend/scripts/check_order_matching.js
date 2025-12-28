// Script to check database data for order matching test
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('='.repeat(60));
    console.log('检查数据库数据是否满足订单匹配测试条件');
    console.log('='.repeat(60));

    // 1. Check providers with airport service
    console.log('\n📋 1. 检查提供"接机服务"的服务商:');
    const { data: providers, error: providerError } = await supabase
        .from('provider_profiles')
        .select('id, user_id, company_name, service_categories, status')
        .eq('status', 'approved');

    if (providerError) {
        console.error('   Error:', providerError.message);
    } else {
        const airportProviders = providers.filter(p => {
            const cats = p.service_categories || [];
            return cats.some(cat =>
                cat.includes('接机') ||
                cat.includes('机场') ||
                cat.toLowerCase().includes('airport')
            );
        });

        if (airportProviders.length === 0) {
            console.log('   ❌ 没有找到提供接机服务的已审核服务商');
            console.log('\n   所有已审核服务商的服务类别:');
            providers.forEach(p => {
                console.log(`   - ${p.company_name || p.user_id}: ${JSON.stringify(p.service_categories)}`);
            });
        } else {
            console.log(`   ✅ 找到 ${airportProviders.length} 个提供接机服务的服务商:`);
            airportProviders.forEach(p => {
                console.log(`   - ${p.company_name || 'Unknown'} (user_id: ${p.user_id})`);
                console.log(`     服务类别: ${JSON.stringify(p.service_categories)}`);
            });
        }
    }

    // 2. Check form templates for airport service
    console.log('\n📋 2. 检查接机服务表单模板:');
    const { data: templates, error: templateError } = await supabase
        .from('form_templates')
        .select('id, name, type, category, status');

    if (templateError) {
        console.error('   Error:', templateError.message);
    } else {
        const airportTemplates = templates.filter(t =>
            t.name?.includes('接机') ||
            t.name?.includes('机场') ||
            t.category?.includes('接机') ||
            t.name?.toLowerCase().includes('airport')
        );

        if (airportTemplates.length === 0) {
            console.log('   ❌ 没有找到接机服务相关的表单模板');
            console.log('\n   所有表单模板:');
            templates.forEach(t => {
                console.log(`   - [${t.type}] ${t.name} (分类: ${t.category || '-'}, 状态: ${t.status})`);
            });
        } else {
            console.log(`   ✅ 找到 ${airportTemplates.length} 个接机服务模板:`);
            airportTemplates.forEach(t => {
                console.log(`   - ID: ${t.id}`);
                console.log(`     名称: ${t.name}`);
                console.log(`     类型: ${t.type}, 分类: ${t.category || '-'}, 状态: ${t.status}`);
            });
        }
    }

    // 3. Check pending submissions for airport service
    console.log('\n📋 3. 检查待处理的接机服务请求:');
    const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select('id, template_id, status, assigned_provider_id, form_data, created_at')
        .eq('status', 'pending')
        .is('assigned_provider_id', null)
        .order('created_at', { ascending: false })
        .limit(20);

    if (subError) {
        console.error('   Error:', subError.message);
    } else {
        console.log(`   共有 ${submissions.length} 个待处理且未分配的订单:`);

        // Get template names for these submissions
        const templateIds = [...new Set(submissions.map(s => s.template_id).filter(Boolean))];
        let templateNameMap = {};

        if (templateIds.length > 0) {
            const { data: subTemplates } = await supabase
                .from('form_templates')
                .select('id, name')
                .in('id', templateIds);

            templateNameMap = (subTemplates || []).reduce((acc, t) => {
                acc[t.id] = t.name;
                return acc;
            }, {});
        }

        submissions.forEach(s => {
            const templateName = templateNameMap[s.template_id] ||
                s.form_data?._raw_template_id ||
                '未知模板';
            const isAirport = templateName.includes('接机') ||
                templateName.includes('机场') ||
                templateName.toLowerCase().includes('airport');

            console.log(`   ${isAirport ? '✈️' : '  '} ID: ${s.id.substring(0, 8)}... | 服务: ${templateName} | 创建: ${new Date(s.created_at).toLocaleString()}`);
        });

        const airportSubs = submissions.filter(s => {
            const name = templateNameMap[s.template_id] || s.form_data?._raw_template_id || '';
            return name.includes('接机') || name.includes('机场') || name.toLowerCase().includes('airport');
        });

        if (airportSubs.length === 0) {
            console.log('\n   ❌ 没有待处理的接机服务请求');
        } else {
            console.log(`\n   ✅ 其中 ${airportSubs.length} 个是接机服务请求`);
        }
    }

    // 4. Check users with provider role
    console.log('\n📋 4. 检查用户角色:');
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('role', 'provider');

    if (userError) {
        console.error('   Error:', userError.message);
    } else {
        console.log(`   共有 ${users.length} 个 role='provider' 的用户`);
        users.slice(0, 5).forEach(u => {
            console.log(`   - ${u.name || u.email} (ID: ${u.id.substring(0, 8)}...)`);
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log('检查完成');
    console.log('='.repeat(60));
}

check().catch(console.error);
