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

        const { data, error } = await supabaseAdmin
            .from('active_user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (!data) {
            return res.json({
                success: true,
                data: null,
                message: '无活跃订阅'
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ success: false, message: '获取订阅失败', error: error.message });
    }
});

// ============================================================
// POST /api/user/subscription/subscribe - Subscribe to a plan
// ============================================================
router.post('/subscribe', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { plan_id, billing_cycle } = req.body; // billing_cycle: 'monthly' or 'yearly'

        if (!plan_id || !billing_cycle) {
            return res.status(400).json({ success: false, message: '缺少必填字段' });
        }

        // Get plan details
        const { data: plan, error: planError } = await supabaseAdmin
            .from('subscription_plans')
            .select('*')
            .eq('id', plan_id)
            .eq('is_active', true)
            .single();

        if (planError || !plan) {
            return res.status(404).json({ success: false, message: '套餐不存在' });
        }

        // Check for existing active subscription
        const { data: existingSub } = await supabaseAdmin
            .from('user_subscriptions')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .gte('end_date', new Date().toISOString())
            .single();

        if (existingSub) {
            return res.status(400).json({ success: false, message: '您已有活跃订阅' });
        }

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        if (billing_cycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Create subscription
        const { data: subscription, error: subError } = await supabaseAdmin
            .from('user_subscriptions')
            .insert({
                user_id: userId,
                plan_id,
                status: 'pending', // Will be activated after payment
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                remaining_credits: plan.included_credits,
                remaining_listings: plan.included_standard_listings
            })
            .select()
            .single();

        if (subError) throw subError;

        // TODO: Integrate with payment gateway (Stripe/Alipay/WeChat)
        // For now, return subscription details for payment processing

        res.json({
            success: true,
            message: '订阅创建成功，请完成支付',
            data: {
                subscription,
                amount: billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly,
                billing_cycle
            }
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ success: false, message: '订阅失败', error: error.message });
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
