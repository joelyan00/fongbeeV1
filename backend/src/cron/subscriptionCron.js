import cron from 'node-cron';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { createImmediatePayment, isStripeConfigured } from '../services/stripeService.js';

/**
 * Subscription Renewal Cron Job
 * Runs daily at 01:00 AM
 */
export const startSubscriptionRenewalCron = () => {
    // Run daily at 1:00 AM
    cron.schedule('0 1 * * *', async () => {
        console.log('[Cron] Running subscription renewal check...');

        if (!isSupabaseConfigured()) {
            console.log('[Cron] Supabase not configured, skipping');
            return;
        }

        try {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 2); // Look ahead 48 hours

            // 1. Find subscriptions that are active, have auto_renew enabled, and are expiring soon
            const { data: expiringSubs, error } = await supabaseAdmin
                .from('user_subscriptions')
                .select(`
                    *,
                    subscription_plans!user_subscriptions_plan_id_fkey(
                        id, name, price_monthly, price_yearly, included_credits, included_standard_listings
                    ),
                    users!user_subscriptions_user_id_fkey(
                        id, email, wallet_balance, stripe_customer_id
                    )
                `)
                .eq('status', 'active')
                .eq('auto_renew', true)
                .lte('end_date', tomorrow.toISOString())
                .gte('end_date', now.toISOString());

            if (error) {
                console.error('[Cron] Error fetching expiring subscriptions:', error);
                return;
            }

            if (!expiringSubs || expiringSubs.length === 0) {
                console.log('[Cron] No subscriptions due for renewal');
                return;
            }

            console.log(`[Cron] Found ${expiringSubs.length} subscriptions to renew`);

            for (const sub of expiringSubs) {
                await renewSubscription(sub);
            }

        } catch (error) {
            console.error('[Cron] Subscription renewal job error:', error);
        }
    });

    console.log('✅ Subscription renewal cron job scheduled (daily at 01:00)');
};

/**
 * Handle renewal for a single subscription
 */
async function renewSubscription(sub) {
    const { id: subId, user_id: userId, plan_id: planId, subscription_plans: plan, users: user, billing_cycle } = sub;
    const amount = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

    console.log(`[Cron] Attempting renewal for User ${user.email} (Plan: ${plan.name}, Cycle: ${billing_cycle})`);

    try {
        let paymentSuccess = false;
        let paymentMethod = null;

        // --- PHASE 1: Try Wallet Balance ---
        if (user.wallet_balance >= amount) {
            console.log(`[Cron] Charging wallet for User ${user.email}: ${amount}`);

            const { data: walletRes, error: walletError } = await supabaseAdmin.rpc('deduct_wallet_balance', {
                p_user_id: userId,
                p_amount: amount,
                p_description: `Subscription Renewal: ${plan.name} (${billing_cycle})`
            });

            if (!walletError && walletRes) {
                paymentSuccess = true;
                paymentMethod = 'wallet';
            } else {
                console.warn(`[Cron] Wallet deduction failed for User ${user.email}:`, walletError);
            }
        }

        // --- PHASE 2: Try Stripe (if wallet failed and customer has card) ---
        if (!paymentSuccess && isStripeConfigured() && user.stripe_customer_id) {
            console.log(`[Cron] Attempting Stripe charge for User ${user.email}: ${amount}`);
            try {
                const stripeRes = await createImmediatePayment({
                    amount,
                    currency: 'cad',
                    customerId: user.stripe_customer_id,
                    metadata: {
                        user_id: userId,
                        subscription_id: subId,
                        type: 'subscription_renewal'
                    }
                });

                if (stripeRes.status === 'succeeded') {
                    paymentSuccess = true;
                    paymentMethod = 'stripe';
                }
            } catch (stripeError) {
                console.warn(`[Cron] Stripe renewal failed for User ${user.email}:`, stripeError.message);
            }
        }

        // --- PHASE 3: Update Subscription ---
        if (paymentSuccess) {
            const newEndDate = new Date(sub.end_date);
            if (billing_cycle === 'yearly') {
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            } else {
                newEndDate.setMonth(newEndDate.getMonth() + 1);
            }

            const { error: updateError } = await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    end_date: newEndDate.toISOString(),
                    remaining_credits: plan.included_credits,
                    remaining_listings: plan.included_standard_listings,
                    updated_at: new Date().toISOString()
                })
                .eq('id', subId);

            if (updateError) {
                console.error(`[Cron] Failed to update subscription ${subId} after payment:`, updateError);
            } else {
                console.log(`[Cron] ✅ Successfully renewed subscription for User ${user.email}. New end date: ${newEndDate.toISOString()}`);

                // Record transaction
                await supabaseAdmin.from('credits_transactions').insert({
                    user_id: userId,
                    amount: -amount,
                    balance_type: 'wallet',
                    transaction_type: 'subscription_payment',
                    description: `Automatic Renewal: ${plan.name} (${billing_cycle}) via ${paymentMethod}`,
                    metadata: { subscription_id: subId, payment_method: paymentMethod }
                });
            }
        } else {
            console.warn(`[Cron] ❌ All payment methods failed for User ${user.email}. Subscription will expire on ${sub.end_date}`);
            // Optional: Send notification to user here
        }

    } catch (err) {
        console.error(`[Cron] Error processing renewal for ${user.email}:`, err);
    }
}

export default { startSubscriptionRenewalCron };
