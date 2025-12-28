import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get Active Banners
router.get('/active', async (req, res) => {
    try {
        if (!isSupabaseConfigured()) {
            // Fallback mock data if no DB configured
            return res.json([
                {
                    id: 1,
                    title: 'Fongbee 优服佳',
                    image_url: '',
                    link_url: '#',
                    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    badge: '品质服务',
                    prefix: 'Fongbee',
                    highlight: '优服佳',
                    suffix: '',
                    cta: '了解更多'
                }
            ]);
        }

        const now = new Date().toISOString();
        const { data, error } = await supabaseAdmin
            .from('banners')
            .select('*')
            .eq('is_active', true)
            .lte('start_date', now)
            .gte('end_date', now)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        // Return database banners, or fallback if empty
        if (data && data.length > 0) {
            res.json(data);
        } else {
            // Fallback if no active banners in DB
            res.json([{
                id: 'fallback',
                title: 'Fongbee 优服佳',
                image_url: '',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                badge: '品质服务',
                prefix: 'Fongbee',
                highlight: '优服佳',
                suffix: '',
                cta: '了解更多'
            }]);
        }
    } catch (e) {
        console.error('Fetch active banners error:', e);
        res.status(500).json({ error: e.message });
    }
});

// Admin: Get All Banners
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        if (!isSupabaseConfigured()) return res.json([]);

        const { data, error } = await supabaseAdmin
            .from('banners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin: Create Banner
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, image_url, link_url, start_date, end_date, is_active, sort_order, target_cities } = req.body;

        const { data, error } = await supabaseAdmin
            .from('banners')
            .insert({ title, image_url, link_url, start_date, end_date, is_active, sort_order, target_cities })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin: Update Banner
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('banners')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin: Delete Banner
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from('banners')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Deleted successfully' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
