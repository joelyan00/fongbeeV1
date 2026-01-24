import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

let mockCategories = [
    { id: '1', name: '搬家服务', icon: 'truck', sort_order: 10, is_active: true },
    { id: '2', name: '接机服务', icon: 'plane', sort_order: 20, is_active: true },
    { id: '3', name: '家庭清洁', icon: 'home', sort_order: 30, is_active: true },
    { id: '4', name: '税务理财', icon: 'dollar-sign', sort_order: 60, is_active: true }
];

// GET /api/categories
// Query params:
// - activeOnly: 'false' to include disabled categories (default: true for frontend)
// - all: 'true' for admin to get all categories including disabled
// - service_type: 'standard' or 'custom' to filter by visibility
router.get('/', async (req, res) => {
    try {
        const { all, activeOnly, service_type } = req.query;
        // Default: only return active categories unless explicitly requested otherwise
        const showAll = all === 'true' || activeOnly === 'false';

        if (isSupabaseConfigured()) {
            let query = supabaseAdmin
                .from('service_categories')
                .select('*')
                .order('sort_order', { ascending: true })
                .order('name', { ascending: true }); // Secondary sort

            // Filter to active only unless admin requests all
            if (!showAll) {
                query = query.eq('is_active', true);
            }

            // Filter by service type visibility
            if (service_type === 'standard') {
                query = query.eq('standard_enabled', true);
            } else if (service_type === 'custom') {
                query = query.eq('custom_enabled', true);
            }

            const { data, error } = await query;

            if (error) throw error;
            res.json({ categories: data });
        } else {
            let result = mockCategories.sort((a, b) => a.sort_order - b.sort_order);
            if (!showAll) {
                result = result.filter(c => c.is_active);
            }
            res.json({ categories: result });
        }
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: '获取分类失败' });
    }
});

// POST /api/categories (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, icon, sort_order, description, parent_id, quote_credit_cost } = req.body;
        if (!name) return res.status(400).json({ error: '分类名称为必填项' });

        const newCategory = {
            id: uuidv4(),
            name,
            icon: icon || 'grid',
            sort_order: sort_order || 0,
            description: description || '',
            parent_id: parent_id || null, // 支持子分类
            quote_credit_cost: quote_credit_cost || 0,
            is_active: true,
            created_at: new Date().toISOString()
        };

        if (isSupabaseConfigured()) {
            // Remove UUID for insert (let DB gen it) or keep it if standard
            delete newCategory.id;

            const { data, error } = await supabaseAdmin
                .from('service_categories')
                .insert(newCategory)
                .select()
                .single();

            if (error) {
                if (error.code === '23505') return res.status(400).json({ error: '分类名称已存在' });
                throw error;
            }
            res.status(201).json({ message: '创建成功', category: data });
        } else {
            mockCategories.push(newCategory);
            res.status(201).json({ message: '创建成功', category: newCategory });
        }
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: '创建分类失败' });
    }
});

// PUT /api/categories/:id (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, sort_order, description, is_active, parent_id, standard_enabled, custom_enabled, quote_credit_cost } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (icon !== undefined) updates.icon = icon;
        if (sort_order !== undefined) updates.sort_order = sort_order;
        if (description !== undefined) updates.description = description;
        if (is_active !== undefined) updates.is_active = is_active;
        if (parent_id !== undefined) updates.parent_id = parent_id;
        if (standard_enabled !== undefined) updates.standard_enabled = standard_enabled;
        if (custom_enabled !== undefined) updates.custom_enabled = custom_enabled;
        if (quote_credit_cost !== undefined) updates.quote_credit_cost = quote_credit_cost;
        updates.updated_at = new Date().toISOString();

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('service_categories')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({ message: '更新成功', category: data });
        } else {
            const idx = mockCategories.findIndex(c => c.id === id);
            if (idx === -1) return res.status(404).json({ error: '分类不存在' });

            mockCategories[idx] = { ...mockCategories[idx], ...updates };
            res.json({ message: '更新成功', category: mockCategories[idx] });
        }
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: '更新分类失败' });
    }
});

// DELETE /api/categories/:id (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured()) {
            const { error } = await supabaseAdmin
                .from('service_categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.json({ message: '删除成功' });
        } else {
            const idx = mockCategories.findIndex(c => c.id === id);
            if (idx === -1) return res.status(404).json({ error: '分类不存在' });
            mockCategories.splice(idx, 1);
            res.json({ message: '删除成功' });
        }
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: '删除分类失败' });
    }
});

export default router;
