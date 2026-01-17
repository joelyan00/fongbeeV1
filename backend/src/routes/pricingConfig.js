import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/pricing-config - Get all pricing configurations
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        if (!isSupabaseConfigured()) {
            return res.json({ configs: [] });
        }

        const { category } = req.query;

        let query = supabaseAdmin
            .from('system_pricing_config')
            .select('*')
            .order('category', { ascending: true })
            .order('config_key', { ascending: true });

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Group by category for easier frontend consumption
        const grouped = {};
        (data || []).forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });

        res.json({ configs: data, grouped });
    } catch (error) {
        console.error('Get pricing config error:', error);
        res.status(500).json({ error: 'Failed to fetch pricing configuration' });
    }
});

// PUT /api/admin/pricing-config/:key - Update a single config
router.put('/:key', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;

        if (value === undefined) {
            return res.status(400).json({ error: 'Value is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('system_pricing_config')
            .update({
                config_value: String(value),
                description: description,
                updated_at: new Date().toISOString()
            })
            .eq('config_key', key)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Configuration updated', config: data });
    } catch (error) {
        console.error('Update pricing config error:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

// PUT /api/admin/pricing-config - Batch update multiple configs
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { configs } = req.body; // Array of { config_key, config_value }

        if (!Array.isArray(configs)) {
            return res.status(400).json({ error: 'configs must be an array' });
        }

        const results = [];
        for (const config of configs) {
            const { data, error } = await supabaseAdmin
                .from('system_pricing_config')
                .update({
                    config_value: String(config.config_value),
                    updated_at: new Date().toISOString()
                })
                .eq('config_key', config.config_key)
                .select()
                .single();

            if (!error) {
                results.push(data);
            }
        }

        res.json({ message: 'Configurations updated', configs: results });
    } catch (error) {
        console.error('Batch update pricing config error:', error);
        res.status(500).json({ error: 'Failed to update configurations' });
    }
});

// Helper: Get a single config value (for internal use)
export const getConfigValue = async (key, defaultValue = null) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('system_pricing_config')
            .select('config_value, config_type')
            .eq('config_key', key)
            .single();

        if (error || !data) return defaultValue;

        // Parse based on type
        if (data.config_type === 'number') {
            return parseFloat(data.config_value);
        } else if (data.config_type === 'boolean') {
            return data.config_value === 'true';
        }
        return data.config_value;
    } catch {
        return defaultValue;
    }
};

// Helper: Get multiple config values at once
export const getConfigValues = async (keys) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('system_pricing_config')
            .select('config_key, config_value, config_type')
            .in('config_key', keys);

        if (error || !data) return {};

        const result = {};
        data.forEach(item => {
            if (item.config_type === 'number') {
                result[item.config_key] = parseFloat(item.config_value);
            } else if (item.config_type === 'boolean') {
                result[item.config_key] = item.config_value === 'true';
            } else {
                result[item.config_key] = item.config_value;
            }
        });
        return result;
    } catch {
        return {};
    }
};

export default router;
