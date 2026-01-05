/**
 * Orders V2 Routes - New Payment System
 * Handles: Authorization Hold, Regret Period, Verification Code, Milestones
 */
import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
    createAuthorizationHold,
    createImmediatePayment,
    capturePayment,
    cancelPaymentIntent,
    createRefund,
    calculateSplit,
    isStripeConfigured,
    transferToProvider
} from '../services/stripeService.js';

const router = express.Router();

// Order status transitions
const ORDER_TRANSITIONS = {
    created: ['auth_hold', 'cancelled'],
    auth_hold: ['cancelled', 'captured', 'cancelled_by_provider'],
    cancelled: [],
    cancelled_by_provider: [],
    cancelled_forfeit: [],
    captured: ['in_progress', 'cancelled_forfeit'],
    in_progress: ['pending_verification'],
    pending_verification: ['verified', 'rework'],
    rework: ['in_progress'],
    verified: ['rated'],
    rated: ['completed'],
    completed: []
};

// Generate order number
const generateOrderNo = () => {
    const prefix = 'ORD';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}${date}${random}`;
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validate status transition
const canTransition = (currentStatus, newStatus) => {
    const allowed = ORDER_TRANSITIONS[currentStatus] || [];
    return allowed.includes(newStatus);
};

// ============================================================
// GET /api/orders-v2 - List orders
// ============================================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (!isSupabaseConfigured()) {
            return res.json({ success: true, orders: [] });
        }

        const userId = req.user.id;
        const { role, status, page = 1, limit = 20 } = req.query;

        let query = supabaseAdmin
            .from('orders')
            .select(`
                *,
                milestones:order_milestones(*)
            `, { count: 'exact' })
            .order('created_at', { ascending: false });

        // Filter by role
        if (role === 'provider') {
            query = query.eq('provider_id', userId);
        } else if (req.user.role !== 'admin') {
            query = query.eq('user_id', userId);
        }

        // Filter by status
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query = query.range(offset, offset + parseInt(limit) - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            success: true,
            orders: data || [],
            total: count,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: '获取订单列表失败',
            error: error.message
        });
    }
});

// ============================================================
// GET /api/orders-v2/:id - Get order detail
// ============================================================
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                milestones:order_milestones(*),
                contracts:order_contracts(*),
                verifications:service_verifications(*),
                ratings:order_ratings(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Check access
        if (order.user_id !== userId && order.provider_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: '无权访问此订单' });
        }

        res.json({ success: true, order });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: '获取订单详情失败' });
    }
});

// ============================================================
// POST /api/orders-v2 - Create order with payment intent
// ============================================================
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            serviceType,
            providerId,
            serviceListingId,
            submissionId,
            totalAmount,
            depositAmount,
            depositRate = 30,
            currency = 'CAD',
            regretPeriodHours = 24
        } = req.body;

        // Validation
        if (!serviceType || !providerId || !totalAmount) {
            return res.status(400).json({ success: false, message: '缺少必填字段' });
        }

        const orderNo = generateOrderNo();
        const deposit = depositAmount || (totalAmount * depositRate / 100);
        const hasRegretPeriod = serviceType !== 'complex_custom';

        // Create order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                order_no: orderNo,
                service_type: serviceType,
                user_id: userId,
                provider_id: providerId,
                service_listing_id: serviceListingId,
                submission_id: submissionId,
                total_amount: totalAmount,
                deposit_amount: deposit,
                deposit_rate: depositRate,
                currency,
                status: 'created',
                regret_period_hours: hasRegretPeriod ? regretPeriodHours : 0
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create payment intent
        let paymentResult = null;
        if (isStripeConfigured()) {
            if (hasRegretPeriod) {
                // Pre-authorization
                paymentResult = await createAuthorizationHold({
                    amount: deposit,
                    currency,
                    metadata: { orderId: order.id, orderNo, type: 'deposit' }
                });
            } else {
                // Immediate capture (complex_custom)
                paymentResult = await createImmediatePayment({
                    amount: deposit,
                    currency,
                    metadata: { orderId: order.id, orderNo, type: 'deposit' }
                });
            }

            await supabaseAdmin
                .from('orders')
                .update({ stripe_payment_intent_id: paymentResult.paymentIntentId })
                .eq('id', order.id);
        }

        res.json({
            success: true,
            message: '订单创建成功',
            order: { ...order, stripe_payment_intent_id: paymentResult?.paymentIntentId },
            payment: paymentResult
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: '创建订单失败', error: error.message });
    }
});

// ============================================================
// PATCH /api/orders-v2/:id/cancel - Cancel order
// ============================================================
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason, exemptRating } = req.body;

        const { data: order, error: getError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (getError) throw getError;

        const isUser = order.user_id === userId;
        const isProvider = order.provider_id === userId;

        if (!isUser && !isProvider && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: '无权取消此订单' });
        }

        // Determine new status and actions
        let newStatus = 'cancelled';
        let shouldForfeit = false;
        let shouldPenalizeProvider = false;

        if (isProvider) {
            newStatus = 'cancelled_by_provider';
            shouldPenalizeProvider = !exemptRating;
        } else if (order.status === 'captured') {
            newStatus = 'cancelled_forfeit';
            shouldForfeit = true;
        }

        if (!canTransition(order.status, newStatus)) {
            return res.status(400).json({ success: false, message: `无法取消此订单` });
        }

        // Handle Stripe
        if (order.stripe_payment_intent_id && isStripeConfigured()) {
            if (order.stripe_capture_status === 'uncaptured') {
                await cancelPaymentIntent(order.stripe_payment_intent_id);
            }
            // Note: Forfeited amount split handling would go here
        }

        // Update order
        const { data: updated, error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
                status: newStatus,
                cancelled_at: new Date().toISOString(),
                cancel_reason: reason,
                cancelled_by: userId,
                provider_rating_exempt: isProvider && exemptRating,
                stripe_capture_status: order.stripe_capture_status === 'uncaptured' ? 'refunded' : order.stripe_capture_status
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        // TODO: Provider rating penalty logic

        res.json({
            success: true,
            message: shouldForfeit ? '订单已取消，定金已没收' : '订单已取消',
            order: updated
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: '取消订单失败' });
    }
});

// ============================================================
// PATCH /api/orders-v2/:id/start - Provider starts service
// ============================================================
router.patch('/:id/start', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { photoUrl } = req.body;

        const { data: order, error: getError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (getError) throw getError;

        if (order.provider_id !== userId) {
            return res.status(403).json({ success: false, message: '只有服务商可以开始服务' });
        }

        if (order.status !== 'captured') {
            return res.status(400).json({ success: false, message: '只有已付定金的订单可以开始服务' });
        }

        // Generate code
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        // Create verification record
        await supabaseAdmin.from('service_verifications').insert({
            order_id: id,
            type: 'start_service',
            photo_url: photoUrl,
            verification_code: code,
            code_sent_at: new Date().toISOString(),
            code_expires_at: expiresAt.toISOString(),
            result: 'pending'
        });

        // Update order
        await supabaseAdmin.from('orders').update({ status: 'in_progress' }).eq('id', id);

        // TODO: Send SMS with code to user

        res.json({
            success: true,
            message: '服务已开始，验证码已发送给用户',
            expiresAt: expiresAt.toISOString()
        });

    } catch (error) {
        console.error('Start service error:', error);
        res.status(500).json({ success: false, message: '开始服务失败' });
    }
});

// ============================================================
// POST /api/orders-v2/:id/verify-code - Provider enters code
// ============================================================
router.post('/:id/verify-code', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { code } = req.body;

        // Get latest verification
        const { data: verification, error: getError } = await supabaseAdmin
            .from('service_verifications')
            .select('*')
            .eq('order_id', id)
            .eq('type', 'start_service')
            .is('code_verified_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (getError || !verification) {
            return res.status(404).json({ success: false, message: '未找到待验证记录' });
        }

        // Check expiry
        if (new Date() > new Date(verification.code_expires_at)) {
            return res.status(400).json({ success: false, message: '验证码已过期' });
        }

        // Check attempts
        if (verification.attempts >= 3) {
            return res.status(400).json({ success: false, message: '尝试次数过多' });
        }

        // Verify
        if (verification.verification_code !== code) {
            await supabaseAdmin
                .from('service_verifications')
                .update({ attempts: verification.attempts + 1 })
                .eq('id', verification.id);
            return res.status(400).json({
                success: false,
                message: '验证码错误',
                attemptsRemaining: 2 - verification.attempts
            });
        }

        // Success
        await supabaseAdmin.from('service_verifications').update({
            code_verified_at: new Date().toISOString(),
            result: 'approved'
        }).eq('id', verification.id);

        // TODO: Transfer deposit to provider

        res.json({ success: true, message: '验证成功，定金已解锁' });

    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ success: false, message: '验证失败' });
    }
});

// ============================================================
// POST /api/orders-v2/:id/request-acceptance - Request verification
// ============================================================
router.post('/:id/request-acceptance', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { photoUrl } = req.body;

        const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', id).single();

        if (order.provider_id !== req.user.id) {
            return res.status(403).json({ success: false, message: '只有服务商可以申请验收' });
        }

        // Create verification record
        await supabaseAdmin.from('service_verifications').insert({
            order_id: id,
            type: 'request_acceptance',
            photo_url: photoUrl,
            result: 'pending'
        });

        await supabaseAdmin.from('orders').update({ status: 'pending_verification' }).eq('id', id);

        // TODO: Send notification to user

        res.json({ success: true, message: '验收请求已发送' });

    } catch (error) {
        console.error('Request acceptance error:', error);
        res.status(500).json({ success: false, message: '申请验收失败' });
    }
});

// ============================================================
// PATCH /api/orders-v2/:id/accept - User accepts verification
// ============================================================
router.patch('/:id/accept', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { bypass } = req.body;

        const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', id).single();

        if (order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: '只有用户可以验收' });
        }

        // Update verification
        await supabaseAdmin
            .from('service_verifications')
            .update({ result: 'approved', code_verified_at: new Date().toISOString() })
            .eq('order_id', id)
            .eq('type', 'request_acceptance')
            .is('result', 'pending');

        await supabaseAdmin.from('orders').update({ status: 'verified' }).eq('id', id);

        res.json({ success: true, message: '验收通过' });

    } catch (error) {
        console.error('Accept error:', error);
        res.status(500).json({ success: false, message: '验收失败' });
    }
});

// ============================================================
// PATCH /api/orders-v2/:id/rework - User requests rework
// ============================================================
router.patch('/:id/rework', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', id).single();

        if (order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: '只有用户可以要求返工' });
        }

        await supabaseAdmin
            .from('service_verifications')
            .update({ result: 'rework_required', remark: reason })
            .eq('order_id', id)
            .eq('type', 'request_acceptance')
            .is('result', 'pending');

        await supabaseAdmin.from('orders').update({ status: 'rework' }).eq('id', id);

        res.json({ success: true, message: '返工请求已发送' });

    } catch (error) {
        console.error('Rework error:', error);
        res.status(500).json({ success: false, message: '请求返工失败' });
    }
});

// ============================================================
// POST /api/orders-v2/:id/rate - Rate order
// ============================================================
router.post('/:id/rate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, photos } = req.body;

        const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', id).single();

        if (order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: '只有用户可以评价' });
        }

        if (order.status !== 'verified') {
            return res.status(400).json({ success: false, message: '只能对已验收的订单评价' });
        }

        await supabaseAdmin.from('order_ratings').insert({
            order_id: id,
            user_id: req.user.id,
            rating,
            comment,
            photos
        });

        await supabaseAdmin.from('orders').update({ status: 'rated' }).eq('id', id);

        res.json({ success: true, message: '评价成功' });

    } catch (error) {
        console.error('Rate error:', error);
        res.status(500).json({ success: false, message: '评价失败' });
    }
});

export default router;
