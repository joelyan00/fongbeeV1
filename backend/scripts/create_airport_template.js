
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading root .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
// Try loading backend .env (overrides if present)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log('Trying to connect with URL:', supabaseUrl ? 'Found' : 'Not Found');
console.log('Trying to connect with Key:', supabaseServiceKey ? 'Found' : 'Not Found');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials. Checked VITE_SUPABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTemplate() {
    console.log('Starting template creation...');

    // 1. Get Category ID for "接机服务"
    const { data: categories, error: catError } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('name', '接机服务')
        .single();

    let categoryId;
    if (catError || !categories) {
        console.log('Category "接机服务" not found. Creating it...');
        const { data: newCat, error: createError } = await supabase
            .from('service_categories')
            .insert({
                name: '接机服务',
                icon: 'plane',
                is_active: true,
                sort_order: 10,
                standard_enabled: true,
                custom_enabled: true
            })
            .select()
            .single();

        if (createError) {
            console.error('Failed to create category:', createError);
            return;
        }
        categoryId = newCat.id;
        console.log('Created category:', newCat.name, categoryId);
    } else {
        categoryId = categories.id;
        console.log('Found category:', categories.name, categoryId);
    }

    // 2. Define Template Fields

    // Section A: Provider Listing Fields (Provider fills these)
    const providerFields = [
        { key: "cover_image", label: "服务封面", type: "image", required: true, fill_by: 'provider' },
        { key: "title", label: "服务标题", type: "text", required: true, placeholder: "例如：多伦多皮尔逊机场舒适接送", fill_by: 'provider' },
        { key: "service_purpose", label: "服务目的", type: "select", options: ["民用", "商用"], required: true, fill_by: 'provider' },
        { key: "service_method", label: "服务方式", type: "radio", options: ["上门服务", "接送服务"], required: true, fill_by: 'provider' },
        { key: "description", label: "服务简介 (含规则)", type: "textarea", required: true, fill_by: 'provider', placeholder: "填写服务简介、规则、车型等..." },
        { key: "price", label: "基础价格 ($)", type: "number", required: true, fill_by: 'provider' },
        { key: "deposit_amount", label: "定金 ($)", type: "number", required: false, fill_by: 'provider' },
        { key: "unit", label: "单位", type: "text", required: true, fill_by: 'provider', placeholder: "次/单程" },
        { key: "service_city", label: "服务城市", type: "city_select", required: true, fill_by: 'provider', multiple: true }
    ];

    // Section B: User Booking Fields (Customer fills these at checkout)
    const userFields = [
        { key: "flight_no", label: "航班号", type: "text", required: true, fill_by: 'customer', placeholder: "例如：AC025" },
        { key: "arrival_date", label: "到达日期", type: "date", required: true, fill_by: 'customer' },
        { key: "terminal", label: "航站楼", type: "select", options: ["T1 国内", "T1 国际", "T3 国内", "T3 国际"], required: true, fill_by: 'customer' },
        { key: "pickup_method", label: "接机方式", type: "select", options: ["路边指定点", "举牌接机 (+$20)"], required: true, fill_by: 'customer' },
        { key: "passenger_name", label: "乘客姓名", type: "text", required: true, fill_by: 'customer' },
        { key: "contact_phone", label: "联系电话", type: "text", required: true, fill_by: 'customer' },
        { key: "passenger_count", label: "乘客人数", type: "number", required: true, fill_by: 'customer' },
        { key: "luggage_count", label: "行李件数", type: "number", required: true, fill_by: 'customer' },
        { key: "destination_address", label: "送达地址", type: "address", required: true, fill_by: 'customer' },
        { key: "notes", label: "备注", type: "textarea", required: false, fill_by: 'customer' }
    ];

    const steps = [
        {
            title: '服务发布信息 (服务商填写)',
            fields: providerFields
        },
        {
            title: '用户下单必填项 (预览)',
            fields: userFields
        }
    ];

    // 3. Insert Template
    const templateData = {
        name: '接机标准服务模版', // Updated Name
        type: 'standard', // Remains Standard
        category: categoryId,
        description: '含用户下单表单的标准接机服务',
        steps: steps,
        status: 'published'
    };

    // Check if exists (by ID or Name). Since name changed, we might create duplicate if we don't handle carefully.
    // We'll search by type 'standard' and category or name.
    // Ideally we update the existing '接机服务' (standard).
    const { data: existing } = await supabase
        .from('form_templates')
        .select('id')
        .eq('category', categoryId) // Assuming one standard template per category for now? Or search by old name?
        .eq('type', 'standard')
        .single();

    if (existing) {
        console.log('Template exists. Updating...');
        const { error: updateError } = await supabase
            .from('form_templates')
            .update(templateData)
            .eq('id', existing.id);
        if (updateError) console.error('Update failed:', updateError);
        else console.log('Template updated successfully!');
    } else {
        // Fallback: search by new name
        const { data: existingName } = await supabase.from('form_templates').select('id').eq('name', '接机标准服务模版').single();
        if (existingName) {
            await supabase.from('form_templates').update(templateData).eq('id', existingName.id);
            console.log('Template updated by name.');
        } else {
            console.log('Creating new template...');
            const { error: insertError } = await supabase.from('form_templates').insert(templateData);
            if (insertError) console.error('Insert failed:', insertError);
            else console.log('Template created successfully!');
        }
    }
}

createTemplate();
