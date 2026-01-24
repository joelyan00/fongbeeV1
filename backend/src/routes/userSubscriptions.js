/**
 * User Subscriptions Routes
 * Manages user subscription status and quotas
 */
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============================================================
// GET /api/user/subscription - Get current user's subscription
// ============================================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: subs, error } = await supabaseAdmin
            .from('user_subscriptions')
            .select('*, subscription_plans!user_subscriptions_plan_id_fkey(name, tier)')
            .eq('user_id', userId)
            .in('status', ['active', 'trialing', 'cancelled'])
            .gte('end_date', new Date().toISOString())
            .order('end_date', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ success: false, message: 'Database query error', error });
        }
        const subscription = subs && subs.length > 0 ? subs[0] : null;

        if (!subscription) {
            return res.json({
                success: true,
                data: null,
                message: '无活跃订阅'
            });
        }

        // Flatten the response
        const planInfo = subscription.subscription_plans;
        const plan = Array.isArray(planInfo) ? planInfo[0] : planInfo;
        const flattenedData = {
            ...subscription,
            plan_name: plan?.name || subscription.plan_name,
            plan_tier: plan?.tier || subscription.plan_tier || subscription.tier
        };

        res.json({ success: true, data: flattenedData });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ success: false, message: '获取订阅失败', error: error.message });
    }
});

// ============================================================
// POST /api/user/subscription/subscribe - Subscribe to a plan
// Handles: new subscriptions, upgrades (immediate), downgrades (scheduled)
// ============================================================
router.post('/subscribe', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { plan_id, billing_cycle, confirm_change } = req.body; // billing_cycle: 'monthly' or 'yearly'

        if (!plan_id || !billing_cycle) {
            return res.status(400).json({ success: false, message: '缺少必填字段' });
        }

        // Get new plan details
        const { data: newPlan, error: planError } = await supabaseAdmin
            .from('subscription_plans')
            .select('*')
            .eq('id', plan_id)
            .eq('is_active', true)
            .single();

        if (planError || !newPlan) {
            return res.status(404).json({ success: false, message: '套餐不存在' });
        }

        // Check for existing active subscription
        const { data: existingSub, error: subQueryError } = await supabaseAdmin
            .from('user_subscriptions')
            .select('*, subscription_plans(*)')
            .eq('user_id', userId)
            .eq('status', 'active')
            .gte('end_date', new Date().toISOString())
            .maybeSingle(); // Better than single() to avoid PGRST116 error if not found

        if (subQueryError) {
            console.error('[Subscribe] Existing sub query error:', subQueryError);
        }

        // If user has existing subscription, handle upgrade/downgrade
        if (existingSub) {
            const currentPlan = existingSub.subscription_plans;
            const currentPrice = billing_cycle === 'yearly' ? currentPlan.price_yearly : currentPlan.price_monthly;
            const newPrice = billing_cycle === 'yearly' ? newPlan.price_yearly : newPlan.price_monthly;

            // Same plan - no change needed
            if (existingSub.plan_id === plan_id) {
                return res.status(400).json({ success: false, message: '您已订阅该套餐' });
            }

            const isUpgrade = newPrice > currentPrice;

            // Return confirmation info if not confirmed
            if (!confirm_change) {
                return res.json({
                    success: true,
                    requires_confirmation: true,
                    change_type: isUpgrade ? 'upgrade' : 'downgrade',
                    current_plan: {
                        id: currentPlan.id,
                        name: currentPlan.name,
                        tier: currentPlan.tier,
                        price_monthly: currentPlan.price_monthly,
                        price_yearly: currentPlan.price_yearly,
                        included_credits: currentPlan.included_credits,
                        remaining_credits: existingSub.remaining_credits,
                        remaining_listings: existingSub.remaining_listings,
                        end_date: existingSub.end_date
                    },
                    new_plan: {
                        id: newPlan.id,
                        name: newPlan.name,
                        tier: newPlan.tier,
                        price_monthly: newPlan.price_monthly,
                        price_yearly: newPlan.price_yearly,
                        included_credits: newPlan.included_credits,
                        included_listings: newPlan.included_standard_listings,
                        price: newPrice
                    },
                    message: isUpgrade
                        ? '升级将立即生效，当前会员积分将重置，购买积分保留。'
                        : '降级将在当前订阅周期结束后生效。'
                });
            }

            // Handle confirmed upgrade (immediate)
            if (isUpgrade) {
                // Get user's Stripe customer ID
                const { data: user, error: userError } = await supabaseAdmin
                    .from('users')
                    .select('stripe_customer_id, email')
                    .eq('id', userId)
                    .single();

                if (userError || !user?.stripe_customer_id) {
                    return res.status(400).json({ success: false, message: '未找到有效的 Stripe 客户信息，请先绑定支付卡。' });
                }

                // Process payment for full new plan price
                const { createImmediatePayment } = await import('../services/stripeService.js');
                const paymentResult = await createImmediatePayment({
                    amount: newPrice,
                    currency: 'cad',
                    customerId: user.stripe_customer_id,
                    metadata: {
                        userId,
                        type: 'subscription_upgrade',
                        old_plan_id: existingSub.plan_id,
                        new_plan_id: plan_id,
                        billing_cycle
                    }
                });

                if (paymentResult.status !== 'succeeded' && paymentResult.status !== 'processing') {
                    return res.status(400).json({
                        success: false,
                        message: `支付失败: ${paymentResult.status}`
                    });
                }

                // Cancel old subscription
                await supabaseAdmin
                    .from('user_subscriptions')
                    .update({
                        status: 'cancelled',
                        auto_renew: false,
                        upgrade_notes: `升级至 ${newPlan.name}`
                    })
                    .eq('id', existingSub.id);

                // Create new subscription with full credits
                const startDate = new Date();
                const endDate = new Date();
                if (billing_cycle === 'yearly') {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                } else {
                    endDate.setMonth(endDate.getMonth() + 1);
                }

                const { data: newSubscription, error: subError } = await supabaseAdmin
                    .from('user_subscriptions')
                    .insert({
                        user_id: userId,
                        plan_id,
                        status: 'active',
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        remaining_credits: newPlan.included_credits,
                        remaining_listings: newPlan.included_standard_listings,
                        auto_renew: true
                    })
                    .select()
                    .single();

                if (subError) throw subError;

                // Update provider profile
                await supabaseAdmin
                    .from('provider_profiles')
                    .update({
                        active_subscription_id: newSubscription.id,
                        user_type: 'subscription'
                    })
                    .eq('user_id', userId);

                // Record credit transactions
                // 1. Reset old subscription credits
                if (existingSub.remaining_credits > 0) {
                    await supabaseAdmin.from('credits_transactions').insert({
                        user_id: userId,
                        amount: -existingSub.remaining_credits,
                        transaction_type: 'subscription_reset',
                        credits_type: 'subscription',
                        description: `升级套餐 - 重置 ${currentPlan.name} 会员积分`,
                        subscription_id: existingSub.id
                    });
                }

                // 2. Grant new subscription credits
                await supabaseAdmin.from('credits_transactions').insert({
                    user_id: userId,
                    amount: newPlan.included_credits,
                    transaction_type: 'subscription_grant',
                    credits_type: 'subscription',
                    description: `升级至 ${newPlan.name} - 赠送积分`,
                    subscription_id: newSubscription.id
                });

                return res.json({
                    success: true,
                    message: '升级成功',
                    change_type: 'upgrade',
                    data: {
                        subscription: newSubscription,
                        amount: newPrice,
                        billing_cycle,
                        paymentIntentId: paymentResult.paymentIntentId
                    }
                });
            }

            // Handle confirmed downgrade (scheduled)
            await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    next_plan_id: plan_id,
                    auto_renew: true, // Keep auto_renew so scheduled job processes it
                    upgrade_notes: `计划降级至 ${newPlan.name}`
                })
                .eq('id', existingSub.id);

            return res.json({
                success: true,
                message: `降级已安排，将在 ${new Date(existingSub.end_date).toLocaleDateString('zh-CN')} 生效`,
                change_type: 'downgrade_scheduled',
                data: {
                    effective_date: existingSub.end_date,
                    next_plan: newPlan
                }
            });
        }

        // New subscription flow (no existing subscription)
        // Get user's Stripe customer ID
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('stripe_customer_id, email')
            .eq('id', userId)
            .single();

        if (userError || !user?.stripe_customer_id) {
            return res.status(400).json({ success: false, message: '未找到有效的 Stripe 客户信息，请先绑定支付卡。' });
        }

        // Calculate amount
        const amount = billing_cycle === 'yearly' ? newPlan.price_yearly : newPlan.price_monthly;

        // Process payment via Stripe
        const { createImmediatePayment } = await import('../services/stripeService.js');
        const paymentResult = await createImmediatePayment({
            amount,
            currency: 'cad',
            customerId: user.stripe_customer_id,
            metadata: {
                userId,
                type: 'subscription',
                plan_id,
                billing_cycle
            }
        });

        if (paymentResult.status !== 'succeeded' && paymentResult.status !== 'processing') {
            return res.status(400).json({
                success: false,
                message: `支付失败: ${paymentResult.status}`
            });
        }

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        if (billing_cycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Create active subscription
        const { data: subscription, error: subError } = await supabaseAdmin
            .from('user_subscriptions')
            .insert({
                user_id: userId,
                plan_id,
                status: 'active',
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                remaining_credits: newPlan.included_credits,
                remaining_listings: newPlan.included_standard_listings,
                auto_renew: true
            })
            .select()
            .single();

        if (subError) throw subError;

        // Update provider profile to subscription type
        const { error: profileError } = await supabaseAdmin
            .from('provider_profiles')
            .update({
                user_type: 'subscription',
                active_subscription_id: subscription.id
            })
            .eq('user_id', userId);

        if (profileError) {
            console.error('Failed to update provider profile:', profileError);
        }

        // Record credit grant transaction
        await supabaseAdmin.from('credits_transactions').insert({
            user_id: userId,
            amount: newPlan.included_credits,
            transaction_type: 'subscription_grant',
            credits_type: 'subscription',
            description: `订阅 ${newPlan.name} - 赠送积分`,
            subscription_id: subscription.id
        });

        res.json({
            success: true,
            message: '订阅成功',
            data: {
                subscription,
                amount,
                billing_cycle,
                paymentIntentId: paymentResult.paymentIntentId
            }
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ success: false, message: error.message || '订阅失败' });
    }
});

// ============================================================
// POST /api/user/subscription/cancel - Cancel subscription
// ============================================================
router.post('/cancel', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: subscription, error } = await supabaseAdmin
            .from('user_subscriptions')
            .update({
                status: 'cancelled',
                auto_renew: false
            })
            .eq('user_id', userId)
            .eq('status', 'active')
            .select()
            .single();

        if (error) throw error;
        if (!subscription) {
            return res.status(404).json({ success: false, message: '无活跃订阅' });
        }

        res.json({ success: true, message: '订阅已取消' });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ success: false, message: '取消订阅失败', error: error.message });
    }
});

// ============================================================
// POST /api/user/subscription/process-renewals - Process renewals & scheduled changes
// ADMIN ONLY - Should be called by cron job
// ============================================================
router.post('/process-renewals', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Find all active subscriptions that have expired or are about to expire (e.g. within last 24h)
        // For simplicity, we look for status='active' and end_date < NOW
        const { data: expiringSubs, error } = await supabaseAdmin
            .from('user_subscriptions')
            .select('*, subscription_plans(*)')
            .eq('status', 'active')
            .eq('auto_renew', true)
            .lt('end_date', new Date().toISOString());

        if (error) throw error;

        const results = {
            processed: 0,
            succeeded: 0,
            failed: 0,
            details: []
        };

        if (!expiringSubs || expiringSubs.length === 0) {
            return res.json({ success: true, message: '没有需要处理的续费', results });
        }

        const { createImmediatePayment } = await import('../services/stripeService.js');

        for (const sub of expiringSubs) {
            results.processed++;
            try {
                // Determine next plan
                let nextPlanId = sub.next_plan_id || sub.plan_id;

                // Fetch next plan details if it's different
                let nextPlan = sub.subscription_plans;
                if (sub.next_plan_id && sub.next_plan_id !== sub.plan_id) {
                    const { data: planData } = await supabaseAdmin
                        .from('subscription_plans')
                        .select('*')
                        .eq('id', sub.next_plan_id)
                        .single();
                    if (planData) nextPlan = planData;
                }

                // Get user stripe info
                const { data: user } = await supabaseAdmin
                    .from('users')
                    .select('stripe_customer_id')
                    .eq('id', sub.user_id)
                    .single();

                if (!user || !user.stripe_customer_id) {
                    throw new Error('User has no payment method');
                }

                // Determine price and duration
                const start = new Date(sub.start_date);
                const end = new Date(sub.end_date);
                const durationMs = end.getTime() - start.getTime();
                const isYearly = durationMs > 30 * 24 * 60 * 60 * 1000 * 6; // roughly > 6 months

                const amount = isYearly ? nextPlan.price_yearly : nextPlan.price_monthly;

                // Process Payment
                const paymentResult = await createImmediatePayment({
                    amount,
                    currency: 'cad',
                    customerId: user.stripe_customer_id,
                    metadata: {
                        userId: sub.user_id,
                        type: 'subscription_renewal',
                        plan_id: nextPlan.id,
                        previous_sub_id: sub.id
                    }
                });

                if (paymentResult.status !== 'succeeded') {
                    throw new Error(`Payment failed: ${paymentResult.status}`);
                }

                // Close old subscription
                await supabaseAdmin
                    .from('user_subscriptions')
                    .update({ status: 'expired', auto_renew: false })
                    .eq('id', sub.id);

                // Create new subscription
                const newStartDate = new Date();
                const newEndDate = new Date();
                if (isYearly) {
                    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
                } else {
                    newEndDate.setMonth(newEndDate.getMonth() + 1);
                }

                const { data: newSub } = await supabaseAdmin
                    .from('user_subscriptions')
                    .insert({
                        user_id: sub.user_id,
                        plan_id: nextPlan.id,
                        status: 'active',
                        start_date: newStartDate.toISOString(),
                        end_date: newEndDate.toISOString(),
                        remaining_credits: nextPlan.included_credits,
                        remaining_listings: nextPlan.included_standard_listings,
                        auto_renew: true
                    })
                    .select()
                    .single();

                // Grant credits
                await supabaseAdmin.from('credits_transactions').insert({
                    user_id: sub.user_id,
                    amount: nextPlan.included_credits,
                    transaction_type: 'subscription_grant',
                    credits_type: 'subscription',
                    description: `续费 ${nextPlan.name} - 赠送积分`,
                    subscription_id: newSub.id
                });

                results.succeeded++;
                results.details.push({ id: sub.id, status: 'renewed', new_sub_id: newSub.id });

            } catch (e) {
                console.error(`Failed to process sub ${sub.id}:`, e);
                results.failed++;
                results.details.push({ id: sub.id, status: 'failed', error: e.message });
            }
        }

        res.json({ success: true, message: '续费处理完成', results });

    } catch (error) {
        console.error('Process renewals error:', error);
        res.status(500).json({ success: false, message: '处理失败', error: error.message });
    }
});

// ============================================================
// GET /api/user/subscription/history - Get subscription history
// ============================================================
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabaseAdmin
            .from('user_subscriptions')
            .select(`
                *,
                subscription_plans (
                    name,
                    tier,
                    price_monthly,
                    price_yearly
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ success: false, message: '获取历史失败', error: error.message });
    }
});

// ============================================================
// Admin Routes
// ============================================================

// GET /api/user/subscription/admin/all - List all subscriptions (Admin)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from('active_user_subscriptions')
            .select('*', { count: 'exact' });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count
            }
        });
    } catch (error) {
        console.error('Get all subscriptions error:', error);
        res.status(500).json({ success: false, message: '获取订阅列表失败', error: error.message });
    }
});

// PUT /api/user/subscription/admin/:id - Update subscription (Admin)
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remaining_credits, remaining_listings, end_date } = req.body;

        const updates = {};
        if (status !== undefined) updates.status = status;
        if (remaining_credits !== undefined) updates.remaining_credits = remaining_credits;
        if (remaining_listings !== undefined) updates.remaining_listings = remaining_listings;
        if (end_date !== undefined) updates.end_date = end_date;

        const { data, error } = await supabaseAdmin
            .from('user_subscriptions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, message: '订阅不存在' });
        }

        res.json({ success: true, message: '订阅更新成功', data });
    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({ success: false, message: '更新订阅失败', error: error.message });
    }
});

export default router;
