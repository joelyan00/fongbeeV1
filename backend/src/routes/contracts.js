const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all contract templates
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('contract_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            templates: data
        });
    } catch (error) {
        console.error('Get contract templates error:', error);
        res.status(500).json({
            success: false,
            message: '获取合同模板失败',
            error: error.message
        });
    }
});

// Get single template
router.get('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('contract_templates')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        res.json({
            success: true,
            template: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取合同模板详情失败',
            error: error.message
        });
    }
});

// Create template
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { name, content, status } = req.body;

        const { data, error } = await supabaseAdmin
            .from('contract_templates')
            .insert({
                name,
                content,
                status: status || 'draft'
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            template: data,
            message: '合同模板创建成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '创建合同模板失败',
            error: error.message
        });
    }
});

// Update template
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { name, content, status } = req.body;

        const { data, error } = await supabaseAdmin
            .from('contract_templates')
            .update({
                name,
                content,
                status
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            template: data,
            message: '合同模板更新成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新合同模板失败',
            error: error.message
        });
    }
});

// Delete template
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        // Check usage before delete
        const { count, error: countError } = await supabaseAdmin
            .from('form_templates')
            .select('*', { count: 'exact', head: true })
            .eq('contract_template_id', req.params.id);

        if (countError) throw countError;

        if (count > 0) {
            return res.status(400).json({
                success: false,
                message: '该合同模板已被表单使用，无法删除'
            });
        }

        const { error } = await supabaseAdmin
            .from('contract_templates')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({
            success: true,
            message: '合同模板删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除合同模板失败',
            error: error.message
        });
    }
});

module.exports = router;
