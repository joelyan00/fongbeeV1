import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get Active Cities
router.get('/active', async (req, res) => {
    try {
        if (!isSupabaseConfigured()) {
            return res.json([
                { id: '1', name: '多伦多', code: 'toronto' },
                { id: '2', name: '温哥华', code: 'vancouver' }
            ]);
        }

        const { data, error } = await supabaseAdmin
            .from('cities')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (e) {
        console.error('Fetch cities error (using fallback):', e.message);
        res.json([
            { id: '1', name: '多伦多', code: 'toronto', is_active: true },
            { id: '2', name: '温哥华', code: 'vancouver', is_active: true },
            { id: '3', name: '万锦', code: 'markham', is_active: true }
        ]);
    }
});

// Admin: Get All Cities
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('cities')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin: Create City
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, code, sort_order, is_active } = req.body;
        const { data, error } = await supabaseAdmin
            .from('cities')
            .insert({ name, code, sort_order, is_active })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin: Update City
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { data, error } = await supabaseAdmin
            .from('cities')
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

// Admin: Delete City
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from('cities')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Deleted successfully' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
