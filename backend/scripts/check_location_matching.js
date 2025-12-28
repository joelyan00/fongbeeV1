// Script to check location matching conditions
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
    console.log('检查服务地点匹配条件');
    console.log('='.repeat(60));

    // 1. Check provider's service area
    console.log('\n📍 1. 检查 jianliang 服务商的服务区域:');
    const { data: provider, error: providerError } = await supabase
        .from('provider_profiles')
        .select('id, user_id, company_name, service_city, service_categories')
        .eq('user_id', 'e37c94a6-f9da-49af-8d36-9da18d34c961')
        .single();

    if (providerError) {
        console.error('   Error:', providerError.message);
    } else {
        console.log(`   服务商: ${provider.company_name}`);
        console.log(`   服务区域 (service_city): ${provider.service_city || '未设置'}`);
        console.log(`   服务类别: ${JSON.stringify(provider.service_categories)}`);
    }

    // 2. Check submissions' location data
    console.log('\n📍 2. 检查待处理接机订单的地点信息:');
    const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select('id, form_data, created_at')
        .eq('status', 'pending')
        .is('assigned_provider_id', null)
        .order('created_at', { ascending: false });

    if (subError) {
        console.error('   Error:', subError.message);
    } else {
        const airportSubs = submissions.filter(s => {
            const rawId = s.form_data?._raw_template_id || '';
            return rawId.includes('接机');
        });

        console.log(`   共 ${airportSubs.length} 个接机服务订单:`);
        airportSubs.forEach(s => {
            console.log(`\n   订单 ID: ${s.id.substring(0, 8)}...`);
            console.log(`   创建时间: ${new Date(s.created_at).toLocaleString()}`);

            // Check for location-related fields in form_data
            const fd = s.form_data || {};
            const locationFields = ['city', 'location', 'address', 'service_city',
                'pickup_location', 'destination', 'airport',
                '城市', '地点', '地址', '接机地点', '目的地'];

            let foundLocation = false;
            for (const key of Object.keys(fd)) {
                if (locationFields.some(lf => key.toLowerCase().includes(lf.toLowerCase()))) {
                    console.log(`   ${key}: ${fd[key]}`);
                    foundLocation = true;
                }
            }

            if (!foundLocation) {
                console.log(`   (未找到明确的地点字段)`);
                console.log(`   表单字段: ${Object.keys(fd).join(', ')}`);
            }
        });
    }

    // 3. Check if backend does location matching
    console.log('\n📍 3. 后端匹配逻辑分析:');
    console.log('   当前后端代码只匹配【服务类别】，不匹配【服务地点】');
    console.log('   匹配逻辑: myCategories.includes(s.form_templates?.name)');
    console.log('   ⚠️ 如果需要地点匹配，需要额外开发');

    console.log('\n' + '='.repeat(60));
    console.log('检查完成');
    console.log('='.repeat(60));
}

check().catch(console.error);
