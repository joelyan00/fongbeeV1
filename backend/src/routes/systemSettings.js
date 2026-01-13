/**
 * System Settings Routes
 * Get and update platform configuration settings from database
 */
import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/system-settings - Get all system settings
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (!isSupabaseConfigured()) {
            return res.json({ success: true, settings: {} });
        }

        const { data, error } = await supabaseAdmin
            .from('system_settings')
            .select('key, value');

        if (error) throw error;

        // Convert array to object
        const settings = {};
        (data || []).forEach(item => {
            settings[item.key] = item.value;
        });

        res.json({ success: true, settings });

    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: '获取设置失败', error: error.message });
    }
});

// POST /api/system-settings - Update system settings
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (!isSupabaseConfigured()) {
            return res.status(500).json({ success: false, message: 'Database not configured' });
        }

        const { settings } = req.body;

        if (!Array.isArray(settings)) {
            return res.status(400).json({ success: false, message: 'Settings must be an array' });
        }

        for (const setting of settings) {
            if (!setting.key || setting.value === undefined) continue;

            const { error } = await supabaseAdmin
                .from('system_settings')
                .upsert({
                    key: setting.key,
                    value: String(setting.value),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });

            if (error) {
                console.error(`Failed to update ${setting.key}:`, error);
            }
        }

        res.json({ success: true, message: '设置保存成功' });

    } catch (error) {
        console.error('Save settings error:', error);
        res.status(500).json({ success: false, message: '保存设置失败', error: error.message });
    }
});

export default router;
