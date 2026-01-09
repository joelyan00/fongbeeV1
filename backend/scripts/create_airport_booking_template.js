
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBookingTemplate() {
    console.log('Creating Airport Booking Template...');

    // 1. Get Category
    const { data: cat } = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', '接机服务')
        .single();

    if (!cat) {
        console.error('Category接机服务 not found. Please run previous script first.');
        return;
    }

    // 2. Define "Order Required Fields" for User
    const step1Fields = [
        { key: "flight_no", label: "航班号", type: "text", required: true, placeholder: "例如：AC025" },
        { key: "arrival_date", label: "到达日期", type: "date", required: true },
        {
            key: "terminal",
            label: "航站楼",
            type: "select",
            required: true,
            options: ["T1 国内 (Domestic)", "T1 国际 (International)", "T3 国内 (Domestic)", "T3 国际 (International)"]
        },
        {
            key: "pickup_method",
            label: "接机方式",
            type: "select",
            required: true,
            options: ["路边指定点 (Curbside)", "举牌接机 (Meet & Greet) +$20"]
        }
    ];

    const step2Fields = [
        { key: "passenger_name", label: "乘客姓名", type: "text", required: true, placeholder: "用于举牌或司机确认" },
        { key: "contact_phone", label: "联系电话", type: "text", required: true, placeholder: "优先填写本地号码" },
        { key: "social_contact", label: "微信/WhatsApp", type: "text", required: false, placeholder: "备用联系方式" },
        { key: "passenger_count", label: "乘客人数 (含儿童)", type: "number", required: true },
        { key: "luggage_count", label: "行李数量", type: "number", required: true, placeholder: "总件数" }
    ];

    const step3Fields = [
        { key: "destination_address", label: "送达地址", type: "address", required: true, placeholder: "Guelph 门牌号" },
        { key: "notes", label: "备注", type: "textarea", required: false, placeholder: "儿童座椅需求、行动不便、超大行李说明等" }
    ];

    // 3. Rich Description (Intro + Rules)
    // Since we don't have a 'rules' column, we append it to description or use a special step 0?
    // User text is very long. Ideally we store this in `description` but it might be plain text.
    // We'll put it in description.
    const fullDescription = `
【服务简介】
司机前往 Toronto Pearson International Airport (YYZ) 接机，按航班号追踪到达时间。
送达 Guelph 单一地址。

【服务时间】
每日 07:00 – 22:00（当地时间）

【车辆信息】
参考车型：Honda Civic 或同级
乘客上限：3人
行李建议：2大 + 2小

【价格参考】
$150 CAD / 单程（不含 407）

【额外费用】
- 举牌接机：+$20
- 额外停靠：+$15/个
- 超时等待：+$10/15分钟
- 407高速：实报实销

【取消/改期规则】
- 提前24小时免费改期
- 24小时内按取消/改期费收取
- No-show：司机已到并在免费等待期内联系不上，按取消处理。
  `.trim();

    const steps = [
        { title: "航班信息", fields: step1Fields },
        { title: "乘客信息", fields: step2Fields },
        { title: "行程详情", fields: step3Fields }
    ];

    const templateData = {
        name: '接机服务 (用户下单)',
        type: 'custom', // User-facing form
        category: cat.id,
        description: fullDescription,
        steps: steps,
        status: 'published'
    };

    // Upsert
    const { data: existing } = await supabase
        .from('form_templates')
        .select('id')
        .eq('name', '接机服务 (用户下单)')
        .single();

    if (existing) {
        const { error } = await supabase.from('form_templates').update(templateData).eq('id', existing.id);
        if (error) console.error(error);
        else console.log('Template updated.');
    } else {
        const { error } = await supabase.from('form_templates').insert(templateData);
        if (error) console.error(error);
        else console.log('Template created.');
    }
}

createBookingTemplate();
