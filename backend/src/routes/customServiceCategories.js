/**
 * Custom Service Categories Routes
 * Manages configurable quote credit costs per service category
 */
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============================================================
// GET /api/custom-service-categories - List all categories
// ============================================================
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('custom_service_categories')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: '获取类别失败', error: error.message });
    }
});

// ============================================================
// GET /api/custom-service-categories/:id - Get category by ID
// ============================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('custom_service_categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, message: '类别不存在' });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ success: false, message: '获取类别失败', error: error.message });
    }
});

// ============================================================
// POST /api/custom-service-categories - Create category (Admin only)
// ============================================================
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, quote_credits_cost } = req.body;

        if (!name || !quote_credits_cost) {
            return res.status(400).json({ success: false, message: '缺少必填字段' });
        }

        if (quote_credits_cost < 0) {
            return res.status(400).json({ success: false, message: '积分消耗不能为负数' });
        }

        const { data, error } = await supabaseAdmin
            .from('custom_service_categories')
            .insert({
                name,
                description,
                quote_credits_cost
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, message: '类别创建成功', data });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, message: '创建类别失败', error: error.message });
    }
});

// ============================================================
// PUT /api/custom-service-categories/:id - Update category (Admin only)
// ============================================================
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, quote_credits_cost, is_active } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (quote_credits_cost !== undefined) {
            if (quote_credits_cost < 0) {
                return res.status(400).json({ success: false, message: '积分消耗不能为负数' });
            }
            updates.quote_credits_cost = quote_credits_cost;
        }
        if (is_active !== undefined) updates.is_active = is_active;

        const { data, error } = await supabaseAdmin
            .from('custom_service_categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, message: '类别不存在' });
        }

        res.json({ success: true, message: '类别更新成功', data });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, message: '更新类别失败', error: error.message });
    }
});

// ============================================================
// DELETE /api/custom-service-categories/:id - Delete category (Admin only)
// ============================================================
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete by setting is_active to false
        const { data, error } = await supabaseAdmin
            .from('custom_service_categories')
            .update({ is_active: false })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, message: '类别不存在' });
        }

        res.json({ success: true, message: '类别已删除' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, message: '删除类别失败', error: error.message });
    }
});

export default router;
