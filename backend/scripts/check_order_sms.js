// Debug script to check order provider info
import { supabaseAdmin as supabase } from '../src/config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkOrder() {
    console.log('=== Checking Order ===');

    // Get order info by order_no
    const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('order_no', 'ORD20260114569562')
        .single();

    if (orderErr) {
        console.error('Order not found:', orderErr);
        return;
    }

    console.log('Order:', {
        id: order.id,
        order_no: order.order_no,
        status: order.status,
        provider_id: order.provider_id,
        provider_response_status: order.provider_response_status,
        provider_access_token: order.provider_access_token ? 'EXISTS' : 'NULL'
    });

    // Get provider info
    if (order.provider_id) {
        const { data: provider, error: provErr } = await supabase
            .from('users')
            .select('id, name, phone, email')
            .eq('id', order.provider_id)
            .single();

        if (provErr) {
            console.error('Provider not found:', provErr);
        } else {
            console.log('Provider:', provider);
        }
    }

    // Get service info
    if (order.service_listing_id) {
        const { data: svc } = await supabase
            .from('provider_services')
            .select('id, name')
            .eq('id', order.service_listing_id)
            .single();
        console.log('Service:', svc);
    }
}

checkOrder();
