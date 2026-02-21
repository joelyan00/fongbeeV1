import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// In-memory mock storage for form templates
const mockTemplates = [
    {
        id: 'moving',
        name: '搬家服务',
        description: '标准搬家服务表单，包含出发地、目的地、物品描述等信息收集',
        type: 'custom',
        status: 'published',
        color: '#10b981',
        steps: [
            {
                title: '基本信息',
                description: '确定搬家的时间和地点',
                fields: [
                    { key: 'move_date', label: '搬家日期', type: 'date', required: true, placeholder: '请选择预计搬家日期' },
                    { key: 'from_address', label: '出发地地址', type: 'address', required: true, placeholder: '请输入详细地址' },
                    { key: 'to_address', label: '目的地地址', type: 'address', required: true, placeholder: '请输入详细地址' }
                ]
            },
            {
                title: '详细需求',
                fields: [
                    {
                        key: 'from_floor', label: '出发地楼层', type: 'select', required: true,
                        options: [
                            { label: 'House/Townhouse (地面)', value: '0' },
                            { label: 'Condo/Apartment (有电梯)', value: 'lift' },
                            { label: '2楼 (无电梯)', value: '2' },
                            { label: '3楼 (无电梯)', value: '3' }
                        ]
                    },
                    {
                        key: 'to_floor', label: '目的地楼层', type: 'select', required: true,
                        options: [
                            { label: 'House/Townhouse (地面)', value: '0' },
                            { label: 'Condo/Apartment (有电梯)', value: 'lift' },
                            { label: '2楼 (无电梯)', value: '2' },
                            { label: '3楼 (无电梯)', value: '3' }
                        ]
                    }
                ]
            }
        ],
        created_at: '2024-12-15T00:00:00Z',
        updated_at: '2024-12-15T00:00:00Z'
    },
    {
        id: 'pickup',
        name: '接机服务',
        description: '专业接机服务，支持航班动态跟踪',
        type: 'custom',
        status: 'published',
        color: '#3b82f6',
        steps: [
            {
                title: '航班信息',
                description: '请填写准确的航班详情，以便安排司机',
                fields: [
                    { key: 'flight_no', label: '航班号', type: 'text', required: true, placeholder: '例如：AC025' },
                    { key: 'arrival_date', label: '到达日期', type: 'date', required: true },
                    { key: 'arrival_time', label: '预计到达时间', type: 'text', required: true, placeholder: '例如：14:30' },
                    { key: 'airport', label: '到达机场', type: 'text', required: true, placeholder: '例如：温哥华国际机场 (YVR)' }
                ]
            },
            {
                title: '行程详情',
                description: '请详细描述您的人数及行李情况',
                fields: [
                    { key: 'destination', label: '目的地地址', type: 'address', required: true, placeholder: '请输入要把您送到哪里' },
                    { key: 'passengers', label: '乘客人数', type: 'text', required: true, placeholder: '例如：2位大人，1位小孩' },
                    { key: 'luggage', label: '行李件数', type: 'text', required: true, placeholder: '例如：3件大行李箱，2个手提包' },
                    {
                        key: 'car_type', label: '期望车型', type: 'select', required: true,
                        options: [
                            { label: '经济轿车 (5座)', value: 'economy' },
                            { label: '舒适SUV (5座)', value: 'suv' },
                            { label: '豪华商务 (7座)', value: 'van' },
                            { label: '大型小巴 (12座+)', value: 'bus' }
                        ]
                    }
                ]
            },
            {
                title: '联系方式',
                fields: [
                    { key: 'contact_name', label: '联系人姓名', type: 'text', required: true },
                    { key: 'contact_phone', label: '联系电话', type: 'number', required: true, placeholder: '请输入手机号' },
                    { key: 'remark', label: '特殊备注', type: 'textarea', required: false, placeholder: '是否有特殊需求（如需儿童座椅等）' }
                ]
            }
        ],
        created_at: '2025-12-18T00:00:00Z',
        updated_at: '2025-12-18T00:00:00Z'
    }
];

// GET /api/form-templates - 获取表单模板列表
router.get('/', async (req, res) => {
    try {
        const { type, status, includeSteps, category } = req.query;

        if (isSupabaseConfigured()) {
            let query = supabaseAdmin.from('form_templates').select('*');

            if (type) query = query.eq('type', type);
            if (status) query = query.eq('status', status);
            if (category) query = query.eq('category', category);

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;

            res.json({ templates: data });
        } else {
            // Mock mode
            let templates = [...mockTemplates];

            if (type) templates = templates.filter(t => t.type === type);
            if (status) templates = templates.filter(t => t.status === status);
            if (category) templates = templates.filter(t => t.category === category);

            // Remove steps if not needed (for list view)
            if (includeSteps !== 'true') {
                templates = templates.map(t => ({
                    ...t,
                    fieldsCount: t.steps.reduce((sum, s) => sum + s.fields.length, 0),
                    stepsCount: t.steps.length,
                    steps: undefined
                }));
            }

            res.json({ templates });
        }
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: '获取表单模板失败' });
    }
});

// GET /api/form-templates/published - 获取已发布的表单 (前端用户使用)
// 规则: 表单已发布 AND (非复杂定制类型 OR 关联的合同模板也已发布)
router.get('/published', async (req, res) => {
    try {
        const { type, category } = req.query;

        if (isSupabaseConfigured()) {
            // Join with contract_templates to check contract publish status for complex forms
            let query = supabaseAdmin
                .from('form_templates')
                .select('*, contract_templates(id, status)')
                .eq('status', 'published');

            if (type) query = query.eq('type', type);
            if (category) query = query.eq('category', category);

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;

            // For complex forms: only return if linked contract is also published
            const filtered = (data || []).filter(t => {
                if (t.type === 'complex') {
                    // Must have a linked contract that is published
                    return t.contract_template_id && t.contract_templates?.status === 'published';
                }
                return true; // other form types don't require a contract
            });

            res.json({ templates: filtered });
        } else {
            let templates = mockTemplates.filter(t => t.status === 'published');
            if (type) templates = templates.filter(t => t.type === type);
            if (category) templates = templates.filter(t => t.category === category);
            res.json({ templates });
        }
    } catch (error) {
        console.error('Get published templates error:', error);
        res.status(500).json({ error: '获取表单模板失败' });
    }
});


// GET /api/form-templates/:id - 获取单个表单模板详情
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('form_templates')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) return res.status(404).json({ error: '表单模板不存在' });

            res.json({ template: data });
        } else {
            const template = mockTemplates.find(t => t.id === id);
            if (!template) return res.status(404).json({ error: '表单模板不存在' });
            res.json({ template });
        }
    } catch (error) {
        console.error('Get template error:', error);
        res.status(500).json({ error: '获取表单模板失败' });
    }
});

// POST /api/form-templates - 创建表单模板 (管理员)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, type, steps, color, category, quote_credit_cost } = req.body;

        if (!name || !type || !steps) {
            return res.status(400).json({ error: '名称、类型和步骤为必填项' });
        }

        const newTemplate = {
            id: uuidv4(),
            name,
            description: description || '',
            type,
            status: 'draft',
            color: color || '#10b981',
            color: color || '#10b981',
            category: category || null,
            contract_template_id: req.body.contract_template_id || null, // Add contract association
            quote_credit_cost: quote_credit_cost || 0,
            steps,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('form_templates')
                .insert(newTemplate)
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ message: '创建成功', template: data });
        } else {
            mockTemplates.push(newTemplate);
            console.log('📝 New template created (mock):', newTemplate.name);
            res.status(201).json({ message: '创建成功', template: newTemplate });
        }
    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({ error: '创建表单模板失败' });
    }
});

// PUT /api/form-templates/:id - 更新表单模板 (管理员)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, type, steps, color, status, category, quote_credit_cost, contract_template_id, is_popular } = req.body;

        const updates = {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(type && { type }),
            ...(steps && { steps }),
            ...(color && { color }),
            ...(status && { status }),
            ...(category !== undefined && { category }),
            ...(contract_template_id !== undefined && { contract_template_id: contract_template_id || null }),
            ...(quote_credit_cost !== undefined && { quote_credit_cost }),
            ...(is_popular !== undefined && { is_popular }),
            updated_at: new Date().toISOString()
        };

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('form_templates')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({ message: '更新成功', template: data });
        } else {
            const index = mockTemplates.findIndex(t => t.id === id);
            if (index === -1) return res.status(404).json({ error: '表单模板不存在' });

            mockTemplates[index] = { ...mockTemplates[index], ...updates };
            console.log('📝 Template updated (mock):', mockTemplates[index].name);
            res.json({ message: '更新成功', template: mockTemplates[index] });
        }
    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({ error: '更新表单模板失败' });
    }
});

// PATCH /api/form-templates/:id/publish - 发布表单模板 (管理员)
router.patch('/:id/publish', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('form_templates')
                .update({ status: 'published', updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({ message: '发布成功', template: data });
        } else {
            const template = mockTemplates.find(t => t.id === id);
            if (!template) return res.status(404).json({ error: '表单模板不存在' });

            template.status = 'published';
            template.updated_at = new Date().toISOString();
            console.log('📢 Template published (mock):', template.name);
            res.json({ message: '发布成功', template });
        }
    } catch (error) {
        console.error('Publish template error:', error);
        res.status(500).json({ error: '发布表单模板失败' });
    }
});

// DELETE /api/form-templates/:id - 删除表单模板 (管理员)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured()) {
            const { error } = await supabaseAdmin
                .from('form_templates')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.json({ message: '删除成功' });
        } else {
            const index = mockTemplates.findIndex(t => t.id === id);
            if (index === -1) return res.status(404).json({ error: '表单模板不存在' });

            const deleted = mockTemplates.splice(index, 1);
            console.log('🗑️ Template deleted (mock):', deleted[0].name);
            res.json({ message: '删除成功' });
        }
    } catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({ error: '删除表单模板失败' });
    }
});

// Export for submissions route
export { mockTemplates };
export default router;
