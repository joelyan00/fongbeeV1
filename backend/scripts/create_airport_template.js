
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

    // 2. Define Template Fields (Wrapped in Steps)
    const fields = [
        { key: "cover_image", label: "服务封面", type: "image", required: true },
        { key: "title", label: "服务标题", type: "text", required: true, placeholder: "例如：多伦多皮尔逊机场舒适接送" },
        { key: "price", label: "基础价格 ($)", type: "number", required: true },
        { key: "deposit_amount", label: "定金金额 ($)", type: "number", required: false, placeholder: "0表示无需定金" },
        { key: "vehicle_type", label: "车型", type: "select", required: true, options: ["5座轿车", "7座SUV", "商务MPV", "豪华轿车"] },
        { key: "passenger_capacity", label: "最大载客 (人)", type: "number", required: true },
        { key: "luggage_capacity", label: "最大行李 (件)", type: "number", required: true },
        { key: "night_surcharge", label: "夜间加价 ($)", type: "number", required: false, placeholder: "例如：10" },
        { key: "meet_and_greet_fee", label: "举牌服务费 ($)", type: "number", required: false, placeholder: "例如：15" },
        { key: "description", label: "服务包含", type: "textarea", required: true, placeholder: "详细描述服务内容、等待政策等..." },
        { key: "service_exclusions", label: "费用不含", type: "textarea", required: false, placeholder: "例如：高速费、停车费、过桥费等..." },
        { key: "usage_notes", label: "注意事项", type: "textarea", required: false, placeholder: "例如：请提前24小时预约，退改规则等..." },
        { key: "service_city", label: "服务城市", type: "city_select", required: true }
    ];

    const steps = [
        {
            title: '接机服务详情',
            description: '请填写服务的详细信息',
            fields: fields
        }
    ];

    // 3. Insert Template
    const templateData = {
        name: '接机服务', // Matches screenshot "接机服务"
        type: 'standard', // For Provider Standard Service
        category: categoryId, // Note: column is 'category' in form_templates, NOT category_id
        description: '用户接机的上架',
        steps: steps,
        status: 'published'
    };

    // Check if really exists to update
    // We match by name AND type to be safe, or just name
    const { data: existing } = await supabase
        .from('form_templates')
        .select('id')
        .eq('name', '接机服务')
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
        console.log('Creating new template...');
        const { error: insertError } = await supabase
            .from('form_templates')
            .insert(templateData);
        if (insertError) console.error('Insert failed:', insertError);
        else console.log('Template created successfully!');
    }
}

createTemplate();
