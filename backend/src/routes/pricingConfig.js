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

        // Sync with subscription_plans table
        await syncSubscriptionPlanConfig(key, value);

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

                // Synchronize with subscription_plans table if it's a subscription-related key
                await syncSubscriptionPlanConfig(config.config_key, config.config_value);
            }
        }

        res.json({ message: 'Configurations updated', configs: results });
    } catch (error) {
        console.error('Batch update pricing config error:', error);
        res.status(500).json({ error: 'Failed to update configurations' });
    }
});

// Helper to sync specific config keys to subscription_plans table
async function syncSubscriptionPlanConfig(key, value) {
    try {
        const parts = key.split('_');
        if (parts[0] !== 'sub') return;

        let tier = '';
        let targetName = '';
        if (key.includes('basic')) {
            tier = 'basic';
            targetName = '初级会员';
        } else if (key.includes('premium')) {
            tier = 'professional';
            targetName = '高级会员';
        } else if (key.includes('vip')) {
            tier = 'premium';
            targetName = 'VIP会员';
        }

        if (!tier) return;

        const updates = {};
        if (key.endsWith('monthly_price')) {
            const val = parseFloat(value);
            if (!isNaN(val)) updates.price_monthly = val;
        } else if (key.endsWith('yearly_price')) {
            const val = parseFloat(value);
            if (!isNaN(val)) updates.price_yearly = val;
        } else if (key.endsWith('monthly_credits')) {
            const val = parseInt(value);
            if (!isNaN(val)) updates.included_credits = val;
        } else if (key.endsWith('listing_quota')) {
            const val = parseInt(value);
            if (!isNaN(val)) updates.included_standard_listings = val;
        }

        // Always include name to sync it as well
        if (targetName) updates.name = targetName;

        if (Object.keys(updates).length > 0) {
            console.log(`[Sync] Attempting to update tier ${tier} (${key}) with:`, JSON.stringify(updates));
            const { data, error } = await supabaseAdmin
                .from('subscription_plans')
                .update(updates)
                .eq('tier', tier)
                .select();

            if (error) {
                console.error(`[Sync] Error updating tier ${tier}:`, error);
            } else {
                console.log(`[Sync] Successfully updated tier ${tier}. Rows affected: ${data?.length || 0}`);
            }
        }
    } catch (err) {
        console.error('Sync to subscription_plans failed:', err);
    }
}

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
