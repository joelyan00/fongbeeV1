
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestOrder() {
    // First, find the user ID for joejianlang@gmail.com
    const { data: user, error: userErr } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', 'joejianlang@gmail.com')
        .single();

    if (userErr || !user) {
        console.error('User not found:', userErr);
        return;
    }

    console.log('Found user:', user.email, '->', user.id);

    const providerId = '13281d67-c208-4668-a247-c1a5e20f1007'; // Provider user ID
    const customerId = user.id;

    const orderId = randomUUID();
    const orderNo = 'ORD' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    console.log('Creating test order:', orderId);

    // 1. Insert into submissions table
    const { error: subErr } = await supabase.from('submissions').insert({
        id: orderId,
        template_id: 'test-template',
        user_id: customerId,
        user_name: '测试客户',
        user_email: user.email,
        form_data: {
            phone: '4164559844',
            serviceName: '测试清洁服务',
            address: '123 Test Street, Toronto',
            price: 200
        },
        status: 'captured',
        assigned_provider_id: providerId,
        notes: '这是一个测试订单'
    });

    if (subErr) {
        console.error('Failed to create submission:', subErr);
        return;
    }
    console.log('✅ Submission created');

    // 2. Insert into orders table
    const { error: ordErr } = await supabase.from('orders').insert({
        id: orderId,
        order_no: orderNo,
        service_type: 'standard',
        user_id: customerId,
        provider_id: providerId,
        total_amount: 200,
        deposit_amount: 60,
        deposit_rate: 30,
        status: 'captured',
        regret_period_hours: 24,
        cancel_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    if (ordErr) {
        console.error('Failed to create order:', ordErr);
        return;
    }
    console.log('✅ Order created');

    console.log(`
    ========================================
    测试订单已创建！
    订单ID: ${orderId}
    订单号: ${orderNo}
    客户: ${user.email}
    状态: captured (已付定金)
    客户电话: 4164559844
    
    请刷新服务商页面，应该能在"待上门"看到这个订单。
    ========================================
    `);
}

createTestOrder();
