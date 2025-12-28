import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock storage if DB not ready
const mockNotifications = [];

// GET /api/notifications/count - Get unread count
router.get('/count', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        if (isSupabaseConfigured()) {
            const { count, error } = await supabaseAdmin
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;
            return res.json({ count: count || 0 });
        } else {
            const count = mockNotifications.filter(n => n.user_id === userId && !n.is_read).length;
            res.json({ count });
        }
    } catch (error) {
        console.error('Get notification count error:', error);
        res.status(500).json({ error: 'Failed to get count' });
    }
});

// GET /api/notifications - List notifications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            res.json({ notifications: data });
        } else {
            const list = mockNotifications.filter(n => n.user_id === userId);
            res.json({ notifications: list });
        }
    } catch (error) {
        console.error('List notifications error:', error);
        res.status(500).json({ error: 'Failed to list notifications' });
    }
});

// POST /api/notifications/:id/read - Mark as read
router.post('/:id/read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        if (isSupabaseConfigured()) {
            const { error } = await supabaseAdmin
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id)
                .eq('user_id', userId);

            if (error) throw error;
        } else {
            const note = mockNotifications.find(n => n.id === id && n.user_id === userId);
            if (note) note.is_read = true;
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

export default router;
