/**
 * Cron Jobs for Payment System
 * - Auto-capture deposits after regret period
 * - Provider cancellation rate calculation
 */
import cron from 'node-cron';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { capturePayment, isStripeConfigured } from '../services/stripeService.js';

/**
 * Auto-capture deposits after regret period expired
 * Runs every 5 minutes
 */
export const startRegretPeriodCron = () => {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('[Cron] Checking for expired regret periods...');

        if (!isSupabaseConfigured() || !isStripeConfigured()) {
            console.log('[Cron] Supabase or Stripe not configured, skipping');
            return;
        }

        try {
            // Find orders past their cancel deadline that haven't been captured
            const now = new Date().toISOString();

            const { data: orders, error } = await supabaseAdmin
                .from('orders')
                .select('id, order_no, stripe_payment_intent_id, deposit_amount, version')
                .eq('status', 'auth_hold')
                .eq('stripe_capture_status', 'uncaptured')
                .lt('cancel_deadline', now)
                .limit(50); // Process in batches

            if (error) {
                console.error('[Cron] Error fetching orders:', error);
                return;
            }

            if (!orders || orders.length === 0) {
                console.log('[Cron] No orders to capture');
                return;
            }

            console.log(`[Cron] Found ${orders.length} orders to capture`);

            for (const order of orders) {
                try {
                    // Capture the payment
                    const result = await capturePayment(order.stripe_payment_intent_id);
                    console.log(`[Cron] Captured order ${order.order_no}: ${result.status}`);

                    // Update order status atomically using optimistic locking
                    const { data: updated, error: updateError } = await supabaseAdmin
                        .rpc('update_order_status_atomic', {
                            p_order_id: order.id,
                            p_current_version: order.version,
                            p_new_status: 'captured',
                            p_new_capture_status: 'captured'
                        });

                    if (updateError || !updated) {
                        console.warn(`[Cron] Failed to update order ${order.order_no} - may have been modified`);
                        // Fallback to regular update
                        await supabaseAdmin
                            .from('orders')
                            .update({
                                status: 'captured',
                                stripe_capture_status: 'captured',
                                version: order.version + 1
                            })
                            .eq('id', order.id)
                            .eq('version', order.version);
                    }

                    console.log(`[Cron] ✅ Order ${order.order_no} captured successfully`);

                } catch (captureError) {
                    console.error(`[Cron] Failed to capture order ${order.order_no}:`, captureError.message);

                    // Mark order with error status if capture fails
                    await supabaseAdmin
                        .from('orders')
                        .update({
                            cancel_reason: `Auto-capture failed: ${captureError.message}`
                        })
                        .eq('id', order.id);
                }
            }

        } catch (error) {
            console.error('[Cron] Auto-capture job error:', error);
        }
    });

    console.log('✅ Regret period auto-capture cron job started (every 5 minutes)');
};

/**
 * Calculate monthly provider cancellation rates
 * Runs daily at midnight
 */
export const startCancellationStatsCron = () => {
    // Run daily at 00:05
    cron.schedule('5 0 * * *', async () => {
        console.log('[Cron] Calculating provider cancellation stats...');

        if (!isSupabaseConfigured()) return;

        try {
            const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

            // Get all providers with orders this month
            const { data: providers } = await supabaseAdmin
                .from('orders')
                .select('provider_id')
                .gte('created_at', `${yearMonth}-01`)
                .not('provider_id', 'is', null);

            if (!providers || providers.length === 0) return;

            // Get unique provider IDs
            const providerIds = [...new Set(providers.map(p => p.provider_id))];

            for (const providerId of providerIds) {
                // Count total and cancelled orders
                const { count: total } = await supabaseAdmin
                    .from('orders')
                    .select('id', { count: 'exact' })
                    .eq('provider_id', providerId)
                    .gte('created_at', `${yearMonth}-01`);

                const { count: cancelled } = await supabaseAdmin
                    .from('orders')
                    .select('id', { count: 'exact' })
                    .eq('provider_id', providerId)
                    .eq('status', 'cancelled_by_provider')
                    .gte('created_at', `${yearMonth}-01`);

                const rate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : 0;

                // Upsert stats
                await supabaseAdmin
                    .from('provider_cancellation_stats')
                    .upsert({
                        provider_id: providerId,
                        year_month: yearMonth,
                        total_orders: total,
                        cancelled_orders: cancelled,
                        cancellation_rate: rate
                    }, {
                        onConflict: 'provider_id,year_month'
                    });
            }

            console.log(`[Cron] Updated cancellation stats for ${providerIds.length} providers`);

        } catch (error) {
            console.error('[Cron] Cancellation stats job error:', error);
        }
    });

    console.log('✅ Provider cancellation stats cron job started (daily at 00:05)');
};

/**
 * Initialize all payment-related cron jobs
 */
export const initPaymentCronJobs = () => {
    startRegretPeriodCron();
    startCancellationStatsCron();
    console.log('🕐 Payment cron jobs initialized');
};

export default { initPaymentCronJobs, startRegretPeriodCron, startCancellationStatsCron };
