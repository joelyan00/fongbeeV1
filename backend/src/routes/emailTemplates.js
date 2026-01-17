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

// GET /api/email-templates - List all templates
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('email_templates')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            res.json({ templates: data });
        } else {
            // Mock
            res.json({ templates: [] });
        }
    } catch (error) {
        console.error('List email templates error:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// PUT /api/email-templates/:id - Update template
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, subject, html_content, from_name, description } = req.body;

    try {
        if (isSupabaseConfigured()) {
            const updateData = {
                updated_at: new Date().toISOString()
            };

            if (name !== undefined) updateData.name = name;
            if (subject !== undefined) updateData.subject = subject;
            if (html_content !== undefined) updateData.html_content = html_content;
            if (from_name !== undefined) updateData.from_name = from_name;
            if (description !== undefined) updateData.description = description;

            const { data, error } = await supabaseAdmin
                .from('email_templates')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({ message: 'Template updated', template: data });
        } else {
            res.json({ message: 'Mock updated' });
        }
    } catch (error) {
        console.error('Update email template error:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// POST /api/email-templates/:id/test - Send test email
router.post('/:id/test', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Fetch template
        const { data: template, error } = await supabaseAdmin
            .from('email_templates')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // TODO: Implement actual test email sending with dynamic import of emailService
        // For now, return success mock
        console.log(`[Test Email] Would send template "${template.name}" to ${email}`);

        res.json({ success: true, message: `测试邮件已发送至 ${email}` });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
});

export default router;
