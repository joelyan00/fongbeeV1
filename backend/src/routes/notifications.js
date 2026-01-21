import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// 发送通知的工具函数 (可被其他模块调用)
// ============================================
export async function sendNotification(userId, type, title, content, options = {}) {
    if (!isSupabaseConfigured()) {
        console.log('[Notification] Supabase not configured, skipping');
        return null;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                type: type,
                title: title,
                content: content,
                related_order_id: options.orderId || null,
                related_provider_id: options.providerId || null,
                extra_data: options.extraData || {},
                target_role: options.targetRole || 'user' // Default to user
            })
            .select()
            .single();

        if (error) {
            console.error('[Notification] Insert error:', error);
            return null;
        }

        console.log('[Notification] Sent to user', userId, '(', options.targetRole || 'user', '):', title);
        return data;
    } catch (e) {
        console.error('[Notification] Error:', e);
        return null;
    }
}

// ============================================
// GET /api/notifications - 获取用户通知列表
// ============================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, unread_only = false, role } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        if (!isSupabaseConfigured()) {
            return res.json({
                success: true,
                notifications: [],
                unread_count: 0,
                total: 0
            });
        }

        // Build query
        let query = supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (unread_only === 'true') {
            query = query.eq('is_read', false);
        }

        // Filter by role if provided
        if (role) {
            query = query.eq('target_role', role);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        // Get unread count
        const { count: unreadCount } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        res.json({
            success: true,
            notifications: data || [],
            unread_count: unreadCount || 0,
            total: count || 0,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, error: '获取通知失败' });
    }
});

// ============================================
// GET /api/notifications/count - 获取未读数量 (保持兼容)
// ============================================
router.get('/count', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        if (!isSupabaseConfigured()) {
            return res.json({ count: 0 });
        }

        const { count } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        res.json({ count: count || 0 });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: '获取未读数量失败' });
    }
});

// ============================================
// POST /api/notifications/:id/read - 标记单条已读
// ============================================
router.post('/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!isSupabaseConfigured()) {
            return res.json({ success: true });
        }

        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, error: '操作失败' });
    }
});

// ============================================
// POST /api/notifications/read-all - 全部标记已读
// ============================================
router.post('/read-all', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        if (!isSupabaseConfigured()) {
            return res.json({ success: true });
        }

        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;

        res.json({ success: true, message: '已全部标记为已读' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, error: '操作失败' });
    }
});

// ============================================
// DELETE /api/notifications/:id - 删除通知
// ============================================
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!isSupabaseConfigured()) {
            return res.json({ success: true });
        }

        const { error } = await supabaseAdmin
            .from('notifications')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ success: false, error: '删除失败' });
    }
});

export default router;
