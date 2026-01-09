
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

    // 2. Define Template Fields (General Standard Service Structure)
    const fields = [
        {
            key: "service_purpose",
            label: "服务类别的目的",
            type: "select",
            required: true,
            options: ["民用 (Civil)", "商用 (Commercial)"],
            placeholder: "请选择类别目的"
        },
        {
            key: "service_method",
            label: "服务方式",
            type: "radio",
            required: true,
            options: ["上门服务", "远程服务", "到店/律所"]
        },
        { key: "title", label: "服务标题", type: "text", required: true, placeholder: "例如：专业深度保洁" },
        { key: "description", label: "服务描述", type: "textarea", required: true, placeholder: "请详细描述提供的服务内容、特点等..." },
        { key: "service_city", label: "服务覆盖城市", type: "city_select", required: true, multiple: true },
        { key: "estimated_duration", label: "预计时长 (小时)", type: "number", required: false },
        { key: "advance_booking", label: "提前预约 (小时)", type: "number", required: false, placeholder: "24" },
        { key: "usage_notes", label: "客户须知 / 准备事项", type: "textarea", required: false, placeholder: "如：需提供水电、车位..." },
        { key: "price", label: "价格 (加元)", type: "number", required: true, placeholder: "0.00" },
        {
            key: "unit",
            label: "计价单位",
            type: "select",
            required: true,
            options: ["次", "小时", "天", "件", "附"]
        },
        { key: "tax_included", label: "价格已含税 (GST/HST)", type: "checkbox", required: false },
        {
            key: "deposit_ratio",
            label: "定金比例(%)",
            type: "select",
            required: true,
            options: ["0", "20", "30", "50", "100"]
        },
        {
            key: "material_policy",
            label: "材料/消耗品政策",
            type: "select",
            required: false,
            options: ["包含材料", "不含材料 (客户自备)", "实报实销"]
        }
    ];

    const steps = [
        {
            title: '基本信息',
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
