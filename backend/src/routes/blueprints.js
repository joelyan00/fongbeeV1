import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============ GET all blueprints ============
router.get('/', async (req, res) => {
    try {
        const { category, status } = req.query;

        if (isSupabaseConfigured()) {
            let query = supabaseAdmin
                .from('service_blueprints')
                .select('*')
                .order('sort_order', { ascending: true });

            if (category) query = query.eq('category', category);
            if (status) query = query.eq('status', status);

            const { data, error } = await query;
            if (error) throw error;

            return res.json({ success: true, blueprints: data });
        }

        // Fallback mock data
        return res.json({
            success: true,
            blueprints: []
        });
    } catch (error) {
        console.error('Get blueprints error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blueprints' });
    }
});

// ============ GET public blueprints (for service publishing) ============
router.get('/public', async (req, res) => {
    try {
        const { category } = req.query;

        if (isSupabaseConfigured()) {
            let query = supabaseAdmin
                .from('service_blueprints')
                .select('id, name, description, category, pre_filled_content, sop_content, faq_content, images, pricing_guide')
                .eq('status', 'published')
                .order('sort_order', { ascending: true });

            if (category) query = query.eq('category', category);

            const { data, error } = await query;
            if (error) throw error;

            return res.json({ success: true, blueprints: data });
        }

        return res.json({ success: true, blueprints: [] });
    } catch (error) {
        console.error('Get public blueprints error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blueprints' });
    }
});

// ============ GET single blueprint by ID ============
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('service_blueprints')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ success: false, message: 'Blueprint not found' });
                }
                throw error;
            }

            return res.json({ success: true, blueprint: data });
        }

        return res.status(404).json({ success: false, message: 'Blueprint not found' });
    } catch (error) {
        console.error('Get blueprint error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blueprint' });
    }
});

// ============ Clone blueprint (for providers) ============
router.post('/:id/clone', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!isSupabaseConfigured()) {
            return res.status(500).json({ success: false, message: 'Database not configured' });
        }

        // Get the blueprint
        const { data: blueprint, error: fetchError } = await supabaseAdmin
            .from('service_blueprints')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !blueprint) {
            return res.status(404).json({ success: false, message: 'Blueprint not found' });
        }

        // Create a cloned draft with pre-filled content
        const clonedData = {
            source_blueprint_id: id,
            pre_filled_content: blueprint.pre_filled_content,
            sop_content: blueprint.sop_content,
            faq_content: blueprint.faq_content,
            pricing_guide: blueprint.pricing_guide,
            images: blueprint.images,
            category: blueprint.category,
            cloned_at: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Blueprint cloned successfully',
            clonedData,
            blueprint: {
                name: blueprint.name,
                description: blueprint.description
            }
        });
    } catch (error) {
        console.error('Clone blueprint error:', error);
        res.status(500).json({ success: false, message: 'Failed to clone blueprint' });
    }
});

// ============ Admin: Create blueprint ============
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            template_id,
            pre_filled_content,
            sop_content,
            faq_content,
            pricing_guide,
            images,
            status,
            is_featured,
            sort_order
        } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        if (!isSupabaseConfigured()) {
            return res.status(500).json({ success: false, message: 'Database not configured' });
        }

        const { data, error } = await supabaseAdmin
            .from('service_blueprints')
            .insert({
                name,
                description: description || null,
                category: category || null,
                template_id: template_id || null,
                pre_filled_content: pre_filled_content || {},
                sop_content: sop_content || null,
                faq_content: faq_content || [],
                pricing_guide: pricing_guide || {},
                images: images || [],
                status: status || 'draft',
                is_featured: is_featured || false,
                sort_order: sort_order || 0,
                created_by: req.user.userId
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, blueprint: data });
    } catch (error) {
        console.error('Create blueprint error:', error);
        res.status(500).json({ success: false, message: 'Failed to create blueprint' });
    }
});

// ============ Admin: Update blueprint ============
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!isSupabaseConfigured()) {
            return res.status(500).json({ success: false, message: 'Database not configured' });
        }

        // Remove id from updates if present
        delete updates.id;
        delete updates.created_at;
        delete updates.created_by;

        const { data, error } = await supabaseAdmin
            .from('service_blueprints')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, message: 'Blueprint not found' });
            }
            throw error;
        }

        res.json({ success: true, blueprint: data });
    } catch (error) {
        console.error('Update blueprint error:', error);
        res.status(500).json({ success: false, message: 'Failed to update blueprint' });
    }
});

// ============ Admin: Delete blueprint ============
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!isSupabaseConfigured()) {
            return res.status(500).json({ success: false, message: 'Database not configured' });
        }

        const { error } = await supabaseAdmin
            .from('service_blueprints')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Blueprint deleted successfully' });
    } catch (error) {
        console.error('Delete blueprint error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete blueprint' });
    }
});

export default router;
