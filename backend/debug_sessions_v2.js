
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase config');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function debugSessions() {
    try {
        // Use the ID we saw in previous diagnostics
        const userId = '62a80440-1fec-423c-a4e2-3d977f10231e';
        // Or checking provider ID: 13281d67-c208-4668-a247-c1a5e20f1007
        // Let's try both if possible, but start with the user from the order diagnostic.
        // Actually, the previous screenshot showed "Contact Customer: joejianlang", so the user viewing it is likely the Provider.
        // Provider ID: 13281d67-c208-4668-a247-c1a5e20f1007

        const targetUserId = '13281d67-c208-4668-a247-c1a5e20f1007';
        console.log(`[Debug] Fetching sessions for user: ${targetUserId}`);

        // 1. Fetch orders
        const { data: orders, error: orderErr } = await supabaseAdmin
            .from('orders')
            .select(`
                id, order_no, user_id, provider_id, service_type, service_listing_id, 
                service_title, user_last_active_at, provider_last_active_at, created_at
            `)
            .or(`user_id.eq.${targetUserId},provider_id.eq.${targetUserId}`)
            .order('created_at', { ascending: false });

        if (orderErr) {
            console.error('[Debug] Order fetch error:', orderErr);
            throw orderErr;
        }

        console.log(`[Debug] Found ${orders?.length || 0} orders.`);

        if (!orders || orders.length === 0) {
            console.log('No orders found.');
            return;
        }

        // 2. Process sessions (Copying logic from ordersV2.js)
        const sessionsPromises = orders.map(async (order) => {
            try {
                const isProvider = order.provider_id === targetUserId;
                const otherPartyId = isProvider ? order.user_id : order.provider_id;

                if (!otherPartyId) {
                    console.warn(`[Debug] Order ${order.id} missing other party ID`);
                    return null;
                }

                const myLastActiveAt = isProvider ? order.provider_last_active_at : order.user_last_active_at;

                // Message fetch
                const { data: latestMsg, error: msgError } = await supabaseAdmin
                    .from('order_messages')
                    .select('*')
                    .eq('order_id', order.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (msgError) console.error(`[Debug] Msg error:`, msgError);

                // Unread count
                const lastActiveTime = myLastActiveAt || '1970-01-01T00:00:00Z';
                const { count: unreadCount, error: countError } = await supabaseAdmin
                    .from('order_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('order_id', order.id)
                    .neq('sender_id', targetUserId)
                    .gt('created_at', lastActiveTime);

                if (countError) console.error(`[Debug] Count error:`, countError);

                // User info
                const { data: otherParty, error: userError } = await supabaseAdmin
                    .from('users')
                    .select('id, name, avatar_url')
                    .eq('id', otherPartyId)
                    .maybeSingle();

                if (userError) console.error(`[Debug] User fetch error:`, userError);

                return {
                    id: order.id,
                    result: 'OK'
                };
            } catch (innerError) {
                console.error(`[Debug] CRITICAL ERROR processing order ${order.id}:`, innerError);
                return null;
            }
        });

        const sessionsResults = await Promise.all(sessionsPromises);
        console.log('[Debug] Success. Results:', sessionsResults.length);

    } catch (error) {
        console.error('[Debug] FATAL TOP LEVEL ERROR:', error);
    }
}

debugSessions();
