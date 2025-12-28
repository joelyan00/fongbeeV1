import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware: Admin Only
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permission denied' });
    }
    next();
};

// GET /api/sms-templates - List all templates
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('sms_templates')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            res.json({ templates: data });
        } else {
            // Mock
            res.json({ templates: [] });
        }
    } catch (error) {
        console.error('List SMS templates error:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// PUT /api/sms-templates/:id - Update template
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { content, description } = req.body;

    try {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('sms_templates')
                .update({
                    content,
                    description,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({ message: 'Template updated', template: data });
        } else {
            res.json({ message: 'Mock updated' });
        }
    } catch (error) {
        console.error('Update SMS template error:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

export default router;
