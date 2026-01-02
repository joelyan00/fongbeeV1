import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/invoices - Get user invoices
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Invoices are based on orders (submissions)
        if (isSupabaseConfigured()) {
            const { data } = await supabaseAdmin
                .from('submissions')
                .select('*')
                .eq('user_id', userId)
                // Assuming invoices are available for orders in progress or completed
                .in('status', ['service_started', 'completed'])
                .order('created_at', { ascending: false });

            // Transform to invoice shape
            const invoices = (data || []).map(order => ({
                id: order.id,
                invoice_no: `INV-${order._order_no || order.id.slice(0, 8)}`,
                order_id: order.id,
                amount: order.total_price || order.deposit_price || 0,
                status: '已开票',
                issued_at: order.created_at, // Approximately
                service_name: order.service_category || '未命名服务'
            }));

            res.json({ invoices });
        } else {
            // Mock
            res.json({
                invoices: [
                    { id: '1', invoice_no: 'INV-2023001', amount: 120.00, status: '已开票', issued_at: new Date().toISOString(), service_name: 'Mock Service' }
                ]
            });
        }
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ error: '获取发票列表失败' });
    }
});

export default router;
