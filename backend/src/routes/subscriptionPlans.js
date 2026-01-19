/**
 * Subscription Plans Routes
 * Manages subscription tier configurations
 */
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============================================================
// GET /api/subscription-plans - List all active plans
// ============================================================
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ success: false, message: '获取套餐失败', error: error.message });
    }
});

// ============================================================
// GET /api/subscription-plans/:id - Get plan by ID
// ============================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('subscription_plans')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, message: '套餐不存在' });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get plan error:', error);
        res.status(500).json({ success: false, message: '获取套餐失败', error: error.message });
    }
});

// ============================================================
// POST /api/subscription-plans - Create plan (Admin only)
// ============================================================
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            name,
            tier,
            price_monthly,
            price_yearly,
            included_credits,
            included_standard_listings,
            description,
            features,
            sort_order
        } = req.body;

        if (!name || !tier || !price_monthly) {
            return res.status(400).json({ success: false, message: '缺少必填字段' });
        }

        if (price_monthly < 0 || (price_yearly && price_yearly < 0)) {
            return res.status(400).json({ success: false, message: '价格不能为负数' });
        }

        const { data, error } = await supabaseAdmin
            .from('subscription_plans')
            .insert({
                name,
                tier,
                price_monthly,
                price_yearly,
                included_credits: included_credits || 0,
                included_standard_listings: included_standard_listings || 0,
                description,
                features,
                sort_order: sort_order || 0
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, message: '套餐创建成功', data });
    } catch (error) {
        console.error('Create plan error:', error);
        res.status(500).json({ success: false, message: '创建套餐失败', error: error.message });
    }
});

// ============================================================
// PUT /api/subscription-plans/:id - Update plan (Admin only)
// ============================================================
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            tier,
            price_monthly,
            price_yearly,
            included_credits,
            included_standard_listings,
            description,
            features,
            is_active,
            sort_order
        } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (tier !== undefined) updates.tier = tier;
        if (price_monthly !== undefined) {
            if (price_monthly < 0) {
                return res.status(400).json({ success: false, message: '价格不能为负数' });
            }
            updates.price_monthly = price_monthly;
        }
        if (price_yearly !== undefined) updates.price_yearly = price_yearly;
        if (included_credits !== undefined) updates.included_credits = included_credits;
        if (included_standard_listings !== undefined) updates.included_standard_listings = included_standard_listings;
        if (description !== undefined) updates.description = description;
        if (features !== undefined) updates.features = features;
        if (is_active !== undefined) updates.is_active = is_active;
        if (sort_order !== undefined) updates.sort_order = sort_order;

        const { data, error } = await supabaseAdmin
            .from('subscription_plans')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, message: '套餐不存在' });
        }

        res.json({ success: true, message: '套餐更新成功', data });
    } catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({ success: false, message: '更新套餐失败', error: error.message });
    }
});

// ============================================================
// DELETE /api/subscription-plans/:id - Delete plan (Admin only)
// ============================================================
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if any active subscriptions use this plan
        const { data: activeSubscriptions } = await supabaseAdmin
            .from('user_subscriptions')
            .select('id')
            .eq('plan_id', id)
            .eq('status', 'active')
            .limit(1);

        if (activeSubscriptions && activeSubscriptions.length > 0) {
            return res.status(400).json({
                success: false,
                message: '该套餐有活跃订阅，无法删除'
            });
        }

        // Soft delete
        const { data, error } = await supabaseAdmin
            .from('subscription_plans')
            .update({ is_active: false })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, message: '套餐不存在' });
        }

        res.json({ success: true, message: '套餐已删除' });
    } catch (error) {
        console.error('Delete plan error:', error);
        res.status(500).json({ success: false, message: '删除套餐失败', error: error.message });
    }
});

export default router;
