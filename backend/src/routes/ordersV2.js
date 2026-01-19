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
import {
    validateCreateOrder,
    validateCancelOrder,
    validateVerifyCode,
    validateRating,
    validateIdParam
} from '../middleware/orderValidation.js';
import { sendVerificationSMS, sendSMS, sendTemplateSMS } from '../services/smsService.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// JWT secret for provider access tokens (use env or fallback)
const PROVIDER_TOKEN_SECRET = process.env.JWT_SECRET || 'fongbee-provider-token-secret';

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
                milestones:order_milestones(*),
                verifications:order_verifications(*)
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

        const { data: orders, error, count } = await query;

        if (error) throw error;

        // Enrich orders with service details
        const enrichedOrders = await Promise.all((orders || []).map(async (order) => {
            let serviceTitle = null;
            let serviceImage = null;

            // Try to get from provider_services (standard services)
            if (order.service_listing_id) {
                const { data: service } = await supabaseAdmin
                    .from('provider_services')
                    .select('title, images')
                    .eq('id', order.service_listing_id)
                    .single();
                if (service) {
                    serviceTitle = service.title;
                    serviceImage = service.images?.[0];
                }
            }

            // If no title found and has submission_id, try submissions
            if (!serviceTitle && order.submission_id) {
                const { data: submission } = await supabaseAdmin
                    .from('submissions')
                    .select('form_data')
                    .eq('id', order.submission_id)
                    .single();
                if (submission?.form_data) {
                    serviceTitle = submission.form_data.service_name ||
                        submission.form_data.title ||
                        submission.form_data.category_name;
                }
            }

            // Fallback to service_type mapping
            if (!serviceTitle) {
                const typeMap = {
                    'standard': '标准服务',
                    'simple_custom': '简单定制服务',
                    'complex_custom': '复杂定制服务'
                };
                serviceTitle = typeMap[order.service_type] || order.service_type;
            }

            return {
                ...order,
                service_title: serviceTitle,
                service_image: serviceImage
            };
        }));

        res.json({
            success: true,
            orders: enrichedOrders,
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
                verifications:order_verifications(*),
                ratings:order_ratings(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Check access
        if (order.user_id !== userId && order.provider_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: '无权访问此订单' });
        }

        // Enrich with service details
        let serviceTitle = null;
        let serviceImage = null;
        let serviceDescription = null;
        let formData = order.form_data || {};

        // Fetch submission if exists to get form_data and potentially service info
        let submission = null;
        if (order.submission_id) {
            const { data: sub } = await supabaseAdmin
                .from('submissions')
                .select('form_data')
                .eq('id', order.submission_id)
                .single();
            submission = sub;
            if (submission?.form_data && Object.keys(formData).length === 0) {
                formData = submission.form_data;
            }
        }

        // Try to get from provider_services (standard services)
        if (order.service_listing_id) {
            const { data: service } = await supabaseAdmin
                .from('provider_services')
                .select('title, images, description')
                .eq('id', order.service_listing_id)
                .single();
            if (service) {
                serviceTitle = service.title;
                serviceImage = service.images?.[0];
                serviceDescription = service.description;
            }
        }

        // If no title found and has submission_id, try submissions
        if (!serviceTitle && submission?.form_data) {
            serviceTitle = submission.form_data.service_name ||
                submission.form_data.title ||
                submission.form_data.category_name;
            serviceDescription = submission.form_data.description || submission.form_data.items_desc;
        }

        // Fallback to service_type mapping
        if (!serviceTitle) {
            const typeMap = {
                'standard': '标准服务',
                'simple_custom': '简单定制服务',
                'complex_custom': '复杂定制服务'
            };
            serviceTitle = typeMap[order.service_type] || order.service_type;
        }

        // Enrich with User (Client) and Provider Info
        const { data: providerUser } = await supabaseAdmin
            .from('users')
            .select('id, name, avatar_url, phone')
            .eq('id', order.provider_id)
            .single();

        const { data: clientUser } = await supabaseAdmin
            .from('users')
            .select('id, name, avatar_url, phone, email')
            .eq('id', order.user_id)
            .single();

        const enrichedOrder = {
            ...order,
            form_data: formData,
            service_title: serviceTitle,
            service_image: serviceImage,
            service_description: serviceDescription,
            provider: providerUser ? {
                ...providerUser,
                // Add dummy rating if needed or fetch from profile
            } : null,
            client: clientUser ? {
                ...clientUser
            } : null
        };

        res.json({ success: true, order: enrichedOrder });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: '获取订单详情失败' });
    }
});

// ============================================================
// POST /api/orders-v2 - Create order with payment intent
// ============================================================
router.post('/', authenticateToken, validateCreateOrder, async (req, res) => {
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
            regretPeriodHours = 24,
            idempotencyKey  // Client-provided idempotency key
        } = req.body;

        // Validation
        if (!serviceType || !providerId || !totalAmount) {
            return res.status(400).json({ success: false, message: '缺少必填字段' });
        }

        // Create order with idempotency key
        const orderNo = generateOrderNo();
        const deposit = depositAmount || (totalAmount * depositRate / 100);
        const hasRegretPeriod = serviceType !== 'complex_custom';
        const uniqueKey = idempotencyKey || `${userId}-${Date.now()}`;

        // Check for existing order with same idempotency key
        if (idempotencyKey) {
            const { data: existing } = await supabaseAdmin
                .from('orders')
                .select('id, order_no')
                .eq('idempotency_key', idempotencyKey)
                .single();

            if (existing) {
                return res.json({
                    success: true,
                    message: '订单已存在 (幂等性)',
                    order: existing,
                    idempotent: true
                });
            }
        }

        // Fetch service details for snapshot
        let snapshotTitle = serviceType === 'standard' ? '标准服务' : (serviceType === 'complex_custom' ? '复杂定制服务' : '定制服务');
        let snapshotDescription = '';

        if (serviceListingId) {
            const { data: svc } = await supabaseAdmin
                .from('provider_services')
                .select('title, description')
                .eq('id', serviceListingId)
                .single();
            if (svc) {
                snapshotTitle = svc.title;
                snapshotDescription = svc.description;
            }
        } else if (submissionId) {
            const { data: sub } = await supabaseAdmin
                .from('submissions')
                .select('form_data')
                .eq('id', submissionId)
                .single();
            if (sub?.form_data) {
                snapshotTitle = sub.form_data.service_name || sub.form_data.title || snapshotTitle;
                snapshotDescription = sub.form_data.description || sub.form_data.items_desc || '';
            }
        }

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
                regret_period_hours: hasRegretPeriod ? regretPeriodHours : 0,
                idempotency_key: uniqueKey,
                version: 1,
                user_note: req.body.userNote, // Save user note from request
                service_title: snapshotTitle,
                service_description: snapshotDescription
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create payment intent
        let paymentResult = null;
        let newStatus = 'created';
        let captureStatus = null;

        if (isStripeConfigured()) {
            if (hasRegretPeriod) {
                // Pre-authorization
                paymentResult = await createAuthorizationHold({
                    amount: deposit,
                    currency,
                    metadata: { orderId: order.id, orderNo, type: 'deposit' }
                });
                newStatus = 'auth_hold'; // 已预授权，待上门
                captureStatus = 'uncaptured';
            } else {
                // Immediate capture (complex_custom)
                paymentResult = await createImmediatePayment({
                    amount: deposit,
                    currency,
                    metadata: { orderId: order.id, orderNo, type: 'deposit' }
                });
                newStatus = 'captured'; // 复杂定制服务，直接扣款
                captureStatus = 'captured';
            }

            await supabaseAdmin
                .from('orders')
                .update({
                    stripe_payment_intent_id: paymentResult.paymentIntentId,
                    status: newStatus,
                    stripe_capture_status: captureStatus
                })
                .eq('id', order.id);
        }

        // ========== NOTIFY PROVIDER VIA SMS ==========
        try {
            // Get provider phone
            const { data: provider } = await supabaseAdmin
                .from('users')
                .select('phone, name')
                .eq('id', providerId)
                .single();

            if (provider?.phone) {
                // Generate provider access token (48h expiry)
                const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
                const providerToken = jwt.sign(
                    { orderId: order.id, providerId, type: 'provider_access' },
                    PROVIDER_TOKEN_SECRET,
                    { expiresIn: '48h' }
                );

                // Save token to order
                await supabaseAdmin
                    .from('orders')
                    .update({
                        provider_access_token: providerToken,
                        provider_token_expires_at: tokenExpiry.toISOString(),
                        provider_response_status: 'pending'
                    })
                    .eq('id', order.id);

                // Get service name for SMS
                let serviceName = '服务';
                if (serviceListingId) {
                    const { data: svc } = await supabaseAdmin
                        .from('provider_services')
                        .select('title')
                        .eq('id', serviceListingId)
                        .single();
                    if (svc?.title) serviceName = svc.title;
                }

                // Build short link (production URL) - use order_no for shorter URL
                // UniApp H5 uses hash-based routing, so we need /#/pages/...
                const baseUrl = process.env.H5_BASE_URL || 'https://fongbee-v1-h5.vercel.app';
                const shortLink = `${baseUrl}/#/pages/pr?orderNo=${order.order_no}`;

                // Send SMS using database template
                await sendTemplateSMS(
                    provider.phone,
                    'new_assigned_order',
                    {
                        serviceName: serviceName,
                        totalAmount: totalAmount,
                        link: shortLink
                    }
                );
                console.log(`[Order SMS] Sent new order notification to provider ${provider.phone}`);
            }
        } catch (smsErr) {
            console.error('[Order SMS] Failed to notify provider:', smsErr);
            // Don't fail order creation if SMS fails
        }
        // ========== END NOTIFY PROVIDER ==========

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
router.patch('/:id/cancel', authenticateToken, validateCancelOrder, async (req, res) => {
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
// Legacy start route removed - replaced by start-service-v2 below

// ============================================================
// POST /api/orders-v2/:id/verify-code - Provider enters code
// ============================================================
router.post('/:id/verify-code', authenticateToken, validateVerifyCode, async (req, res) => {
    try {
        const { id } = req.params;
        const { code } = req.body;

        // Get latest verification
        const { data: verification, error: getError } = await supabaseAdmin
            .from('order_verifications')
            .select('*')
            .eq('order_id', id)
            .eq('submitted_by', 'provider')
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
                .from('order_verifications')
                .update({ attempts: verification.attempts + 1 })
                .eq('id', verification.id);
            return res.status(400).json({
                success: false,
                message: '验证码错误',
                attemptsRemaining: 2 - (verification.attempts || 0)
            });
        }

        // Success
        await supabaseAdmin.from('order_verifications').update({
            code_verified_at: new Date().toISOString(),
            status: 'approved'
        }).eq('id', verification.id);

        // TODO: Transfer deposit to provider

        res.json({ success: true, message: '验证成功，定金已解锁' });

    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ success: false, message: '验证失败' });
    }
});

// ============================================================
// Legacy routes removed - replaced by submit-completion and accept-service flow

// ============================================================
// POST /api/orders-v2/:id/start-service-v2 - Provider starts service with photo/description
// ============================================================
router.post('/:id/start-service-v2', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { photos, description } = req.body;

        // Description is now optional to support "Direct Start"
        const finalDescription = description ? description.trim() : '';

        // Get order
        const { data: order, error: getError } = await supabaseAdmin
            .from('orders')
            .select('*, users!orders_user_id_fkey(phone, name)')
            .eq('id', id)
            .single();

        if (getError || !order) {
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        if (!['auth_hold', 'captured'].includes(order.status)) {
            return res.status(400).json({ success: false, message: `当前状态不能开始服务: ${order.status}` });
        }

        // Set deadline to 2 hours from now
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 2);

        // Optional: Create verification record
        if (finalDescription || (photos && photos.length > 0)) {
            const { error: insError } = await supabaseAdmin.from('order_verifications').insert({
                order_id: id,
                type: 'service_start',
                submitted_by: 'provider',
                photos: photos || [],
                description: finalDescription || '已直接开始服务'
            });
            if (insError) {
                console.error('[Verify_Start] Insert failed:', insError);
                // Non-blocking for now, but logged
            }
        }

        // Update order status to in_progress immediately (Optimistic)
        await supabaseAdmin.from('orders').update({
            status: 'in_progress',
            verification_deadline: deadline.toISOString(),
            deposit_transferred_at: null // Explicitly null until 2h or confirmed
        }).eq('id', id);

        // Send SMS to user
        const userPhone = order.users?.phone || '+14164559844'; // Test number fallback
        const baseUrl = process.env.H5_BASE_URL || process.env.FRONTEND_URL || 'https://fongbee-v1.vercel.app';
        const link = `${baseUrl}/#/pages/order/service-confirm?id=${id}`;

        try {
            const { sendSMS } = await import('../services/smsService.js');
            const message = (description || (photos && photos.length > 0))
                ? `【优服佳】您的订单服务已开始，服务商已上传现场照片，请在2小时内确认，逾期定金将自动放行：${link}`
                : `【优服佳】您的服务商已到达现场并开始工作。如果您有异议请在2小时内点击处理，逾期定金将自动放行：${link}`;
            await sendSMS(userPhone, message);
        } catch (smsError) {
            console.error('SMS send failed:', smsError);
        }

        res.json({ success: true, message: '服务已开始' });

    } catch (error) {
        console.error('Start service v2 error:', error);
        res.status(500).json({ success: false, message: '开始服务失败', error: error.message });
    }
});

// ============================================================
// POST /api/orders-v2/:id/confirm-start - User confirms service start
// ============================================================
router.post('/:id/confirm-start', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Get order 
        const { data: order, error: getError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (getError || !order) {
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        if (order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: '只有订单用户可以确认' });
        }

        if (!['in_progress', 'pending_start_confirmation', 'captured', 'auth_hold'].includes(order.status)) {
            return res.status(400).json({ success: false, message: '订单状态不正确' });
        }

        if (order.status === 'in_progress' && order.deposit_transferred_at) {
            return res.status(400).json({ success: false, message: '定金已由系统或您手动划转，无需再次确认' });
        }

        // Check deadline
        if (order.verification_deadline && new Date() > new Date(order.verification_deadline)) {
            return res.status(400).json({ success: false, message: '确认已超时，请联系服务商重新提交' });
        }

        // Get commission settings
        const { data: settings } = await supabaseAdmin.from('system_settings').select('key, value');
        const settingsMap = Object.fromEntries((settings || []).map(s => [s.key, parseFloat(s.value)]));

        const hasSalesPartner = !!order.providers?.referred_by;
        const platformRate = hasSalesPartner
            ? (settingsMap.platform_commission_with_partner || 5) / 100
            : (settingsMap.platform_commission_no_partner || 10) / 100;
        const partnerRate = hasSalesPartner ? (settingsMap.sales_partner_commission || 5) / 100 : 0;

        const depositAmount = order.deposit_amount;
        const platformFee = Math.round(depositAmount * platformRate * 100) / 100;
        const partnerFee = Math.round(depositAmount * partnerRate * 100) / 100;
        const providerAmount = depositAmount - platformFee - partnerFee;

        // Transfer deposit to provider's Stripe account
        if (order.stripe_payment_intent_id && order.providers?.stripe_account_id) {
            try {
                const { capturePayment, transferToConnectedAccount } = await import('../services/stripe.js');

                // Capture the pre-authorization
                if (order.stripe_capture_status === 'uncaptured') {
                    await capturePayment(order.stripe_payment_intent_id, depositAmount);
                }

                // Transfer to provider
                await transferToConnectedAccount(
                    order.providers.stripe_account_id,
                    Math.round(providerAmount * 100), // Convert to cents
                    order.currency || 'cad',
                    `Order ${order.order_no} deposit`
                );
            } catch (stripeError) {
                console.error('Stripe transfer error:', stripeError);
                // Continue even if transfer fails - can retry later
            }
        }

        // Update order
        await supabaseAdmin.from('orders').update({
            deposit_transferred_at: new Date().toISOString(),
            stripe_capture_status: 'captured'
        }).eq('id', id);

        // Send SMS to provider
        const { data: providerUser } = await supabaseAdmin
            .from('users')
            .select('phone')
            .eq('id', order.providers?.user_id)
            .single();

        const providerPhone = providerUser?.phone || '+14164559844';
        try {
            const { sendSMS } = await import('../services/smsService.js');
            await sendSMS(providerPhone, `【优服佳】您的订单 ${order.order_no} 定金 $${providerAmount.toFixed(2)} 已到账，请继续完成服务。`);
        } catch (smsError) {
            console.error('SMS send failed:', smsError);
        }

        res.json({
            success: true,
            message: '已确认服务开始，定金已划转',
            transfer: { platformFee, partnerFee, providerAmount }
        });

    } catch (error) {
        console.error('Confirm start error:', error);
        res.status(500).json({ success: false, message: '确认失败', error: error.message });
    }
});

// ============================================================
// POST /api/orders-v2/:id/refuse-start - User refuses service start request
// ============================================================
router.post('/:id/refuse-start', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ success: false, message: '需填写拒绝理由' });
        }

        // Support both UUID id and order_no
        let query = supabaseAdmin
            .from('orders')
            .select('*');

        // Check if id is UUID format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (isUUID) {
            query = query.eq('id', id);
        } else {
            query = query.eq('order_no', id);
        }

        const { data: order, error } = await query.single();

        if (error || !order) {
            console.error('[refuse-start] Order not found:', id, error);
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        if (order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: '只有订单用户可以执行此操作' });
        }

        // Allow refusal only if not already paid out and status is appropriate
        // (Either in_progress within 2h window, or pending_start_confirmation)
        if (order.deposit_transferred_at) {
            return res.status(400).json({ success: false, message: '定金已划转，无法拒绝，请联系客服处理' });
        }

        if (!['in_progress', 'pending_start_confirmation'].includes(order.status)) {
            return res.status(400).json({ success: false, message: '订单当前状态无需确认/拒绝' });
        }

        // Check 2h window if in_progress
        if (order.status === 'in_progress' && order.verification_deadline) {
            if (new Date() > new Date(order.verification_deadline)) {
                return res.status(400).json({ success: false, message: '已超过2小时异议期，定金已由系统安排划转' });
            }
        }

        // Create verification record for refusal
        await supabaseAdmin.from('order_verifications').insert({
            order_id: id,
            type: 'service_start',
            submitted_by: 'user',
            description: `拒绝开工: ${reason.trim()}`
        });

        // Roll back status to captured and save refusal reason
        await supabaseAdmin.from('orders').update({
            status: 'captured',
            verification_deadline: null,
            cancel_reason: reason.trim()
        }).eq('id', order.id);

        // Notify provider
        const { data: providerUser } = await supabaseAdmin
            .from('users')
            .select('phone')
            .eq('id', order.provider_id)
            .single();

        const providerPhone = providerUser?.phone || '+14164559844';
        try {
            const { sendSMS } = await import('../services/smsService.js');
            await sendSMS(providerPhone, `【优服佳】您的订单 ${order.order_no} 用户的开工申请已被拒绝。原因：${reason}。请沟通后重新提交。`);
        } catch (smsError) {
            console.error('SMS send failed:', smsError);
        }

        res.json({ success: true, message: '反馈已提交，订单已退回待执行状态' });

    } catch (error) {
        console.error('Refuse start error:', error);
        res.status(500).json({ success: false, message: '操作失败', error: error.message });
    }
});

// ============================================================
// POST /api/orders-v2/:id/submit-completion - Provider submits service completion
// ============================================================
router.post('/:id/submit-completion', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { photos, description } = req.body;

        // Description is optional for direct completion or will be filled with a default message
        const finalDescription = (description && description.trim().length > 0)
            ? description.trim()
            : '服务商已确认完工。';

        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('*, users!orders_user_id_fkey(phone)')
            .eq('id', id)
            .single();

        if (!order) {
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        if (!['in_progress', 'rework'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `订单当前状态为 ${order.status}，无法提交验收。请确保订单处于“服务中”或“需返工”状态。`
            });
        }

        // Get auto-complete hours setting
        const { data: settings } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'auto_complete_hours')
            .single();

        const autoCompleteHours = parseInt(settings?.value) || 48;
        const deadline = new Date(Date.now() + autoCompleteHours * 60 * 60 * 1000);

        // Create verification record
        const isRework = order.status === 'rework';
        await supabaseAdmin.from('order_verifications').insert({
            order_id: id,
            type: isRework ? 'rework_completion' : 'completion',
            submitted_by: 'provider',
            photos: photos || [],
            description: finalDescription
        });

        // Update order
        await supabaseAdmin.from('orders').update({
            status: 'pending_verification',
            verification_deadline: deadline.toISOString()
        }).eq('id', id);

        // Send SMS to user
        const userPhone = order.users?.phone || '+14164559844';
        const baseUrl = process.env.H5_BASE_URL || process.env.FRONTEND_URL || 'https://fongbee-v1.vercel.app';
        const link = `${baseUrl}/#/pages/order/verification-confirm?id=${id}`;

        try {
            const { sendSMS } = await import('../services/smsService.js');
            await sendSMS(userPhone, `【优服佳】您的订单服务已完成，服务商已上传完工照片，请验收：${link}（${autoCompleteHours}小时内未响应将自动确认）`);
        } catch (smsError) {
            console.error('SMS send failed:', smsError);
        }

        res.json({ success: true, message: '验收请求已发送', deadline: deadline.toISOString() });

    } catch (error) {
        console.error('Submit completion error:', error);
        res.status(500).json({ success: false, message: '提交验收失败', error: error.message });
    }
});

// ============================================================
// POST /api/orders-v2/:id/accept-service - User accepts service
// ============================================================
router.post('/:id/accept-service', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (!order) {
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        if (order.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '账户角色不匹配：您当前登录的账户不是该订单的下单用户，无法进行验收。如果您有多个账号，请切换至下单账号。'
            });
        }

        if (order.status !== 'pending_verification') {
            return res.status(400).json({ success: false, message: '订单状态不正确' });
        }

        await supabaseAdmin.from('orders').update({ status: 'verified' }).eq('id', id);

        res.json({ success: true, message: '验收成功，请对服务进行评价' });

    } catch (error) {
        console.error('Accept service error:', error);
        res.status(500).json({ success: false, message: '验收失败', error: error.message });
    }
});

// ============================================================
// POST /api/orders-v2/:id/request-rework - User requests rework
// ============================================================
router.post('/:id/request-rework-v2', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { photos, description } = req.body;

        if (!description || description.trim().length === 0) {
            return res.status(400).json({ success: false, message: '请描述需要返工的问题' });
        }

        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !order) {
            console.error('Order fetch error:', error);
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        if (order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: '只有订单用户可以请求返工' });
        }

        // Allow 'verified' status too if user wants to rework after accidental verification? 
        // Typically only pending_verification. 
        if (order.status !== 'pending_verification') {
            // Optional: Allow rework if status is 'verified' but within short window? 
            // For now keep strict.
            return res.status(400).json({ success: false, message: '当前状态不能请求返工' });
        }

        // Create rework request record
        await supabaseAdmin.from('order_verifications').insert({
            order_id: id,
            type: 'rework_request',
            submitted_by: 'user',
            photos: photos || [],
            description: description.trim()
        });

        // Update order
        await supabaseAdmin.from('orders').update({
            status: 'rework',
            rework_count: (order.rework_count || 0) + 1
        }).eq('id', id);

        // Send SMS to provider
        const { data: providerUser } = await supabaseAdmin
            .from('users')
            .select('phone')
            .eq('id', order.provider_id) // Use provider_id directly
            .single();

        const providerPhone = providerUser?.phone || '+14164559844';
        const link = `${process.env.H5_BASE_URL || 'http://localhost:5173'}/#/pages/provider/order-detail?id=${id}`;

        try {
            const { sendSMS } = await import('../services/smsService.js');
            await sendSMS(providerPhone, `【优服佳】您的订单 ${order.order_no} 用户反馈问题需要返工，请查看：${link}`);
        } catch (smsError) {
            console.error('SMS send failed:', smsError);
        }

        res.json({ success: true, message: '返工请求已发送给服务商' });

    } catch (error) {
        console.error('Request rework error:', error);
        res.status(500).json({ success: false, message: '请求返工失败', error: error.message });
    }
});

// ============================================================
// POST /api/orders-v2/:id/submit-review - User submits review with multiple dimensions
// ============================================================
router.post('/:id/submit-review', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            rating_professionalism,
            rating_attitude,
            rating_punctuality,
            rating_overall,
            comment,
            photos
        } = req.body;

        // Validate ratings
        const ratings = [rating_professionalism, rating_attitude, rating_punctuality, rating_overall];
        if (!ratings.every(r => r >= 1 && r <= 5)) {
            return res.status(400).json({ success: false, message: '评分必须在1-5之间' });
        }

        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (!order) {
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        if (order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: '只有订单用户可以评价' });
        }

        if (order.status !== 'verified') {
            return res.status(400).json({ success: false, message: '请先验收订单' });
        }

        // Create review
        const { error: revError } = await supabaseAdmin.from('order_reviews').insert({
            order_id: id,
            user_id: req.user.id,
            provider_id: order.provider_id,
            rating_professionalism,
            rating_attitude,
            rating_punctuality,
            rating_overall,
            comment: comment || null,
            photos: photos || []
        });

        if (revError) {
            console.error('[Submit_Review] Insert failed:', revError);
            return res.status(400).json({ success: false, message: '提交评价失败：数据库错误', details: revError.message });
        }

        // Update order status
        await supabaseAdmin.from('orders').update({ status: 'completed' }).eq('id', id);

        // --- Award Reward Points ---
        let rewardedPoints = 0;
        try {
            const { data: profile } = await supabaseAdmin
                .from('provider_profiles')
                .select('review_reward_points')
                .eq('user_id', order.provider_id)
                .single();

            if (profile && profile.review_reward_points > 0) {
                rewardedPoints = profile.review_reward_points;

                // Add credits to user
                const { data: userData } = await supabaseAdmin
                    .from('users')
                    .select('credits')
                    .eq('id', req.user.id)
                    .single();

                const newCredits = (userData?.credits || 0) + rewardedPoints;

                await supabaseAdmin
                    .from('users')
                    .update({ credits: newCredits })
                    .eq('id', req.user.id);

                // Log transaction
                await supabaseAdmin
                    .from('credit_transactions')
                    .insert({
                        user_id: req.user.id,
                        amount: rewardedPoints,
                        type: 'review_reward',
                        description: `评价订单 ${id.slice(0, 8)} 获得奖励`,
                        created_by: order.provider_id
                    });
            }
        } catch (rewardError) {
            console.error('Failed to award points:', rewardError);
            // Non-blocking, review still successful
        }

        // Update provider average rating
        const { data: allReviews } = await supabaseAdmin
            .from('order_reviews')
            .select('rating_overall')
            .eq('provider_id', order.provider_id);

        if (allReviews && allReviews.length > 0) {
            const avgRating = allReviews.reduce((sum, r) => sum + r.rating_overall, 0) / allReviews.length;
            await supabaseAdmin.from('providers').update({
                rating: Math.round(avgRating * 10) / 10,
                reviews_count: allReviews.length
            }).eq('id', order.provider_id);
        }

        res.json({
            success: true,
            message: rewardedPoints > 0
                ? `评价成功，获得供应商奖励 ${rewardedPoints} 积分！`
                : '评价成功，感谢您的反馈！',
            rewardedPoints
        });

    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ success: false, message: '评价失败', error: error.message });
    }
});

// ============================================================
// GET /api/orders-v2/:id/verifications - Get all verification records
// ============================================================
router.get('/:id/verifications', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check access first
        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('user_id, provider_id')
            .eq('id', id)
            .single();

        if (!order) {
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        if (order.user_id !== userId && order.provider_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: '无权访问此订单验收记录' });
        }

        const { data: verifications, error } = await supabaseAdmin
            .from('order_verifications')
            .select('*')
            .eq('order_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json({ success: true, verifications: verifications || [] });

    } catch (error) {
        console.error('Get verifications error:', error);
        res.status(500).json({ success: false, message: '获取验收记录失败' });
    }
});

// ============================================================
// Internal: Helper function for executing payout
// ============================================================
async function executeDepositPayout(orderId) {
    try {
        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('*, providers!orders_provider_id_fkey(stripe_account_id, user_id, referred_by)')
            .eq('id', orderId)
            .single();

        if (!order || order.deposit_transferred_at) return;

        // Get commission settings
        const { data: settings } = await supabaseAdmin.from('system_settings').select('key, value');
        const settingsMap = Object.fromEntries((settings || []).map(s => [s.key, parseFloat(s.value)]));

        const hasSalesPartner = !!order.providers?.referred_by;
        const platformRate = hasSalesPartner
            ? (settingsMap.platform_commission_with_partner || 5) / 100
            : (settingsMap.platform_commission_no_partner || 10) / 100;
        const partnerRate = hasSalesPartner ? (settingsMap.sales_partner_commission || 5) / 100 : 0;

        const depositAmount = order.deposit_amount;
        const platformFee = Math.round(depositAmount * platformRate * 100) / 100;
        const partnerFee = Math.round(depositAmount * partnerRate * 100) / 100;
        const providerAmount = depositAmount - platformFee - partnerFee;

        // Transfer deposit
        if (order.stripe_payment_intent_id && order.providers?.stripe_account_id) {
            const { capturePayment, transferToConnectedAccount } = await import('../services/stripe.js');

            if (order.stripe_capture_status === 'uncaptured') {
                await capturePayment(order.stripe_payment_intent_id, depositAmount);
            }

            await transferToConnectedAccount(
                order.providers.stripe_account_id,
                providerAmount,
                order.currency || 'CAD',
                `Deposit for order ${order.order_no}`
            );

            // Update database
            await supabaseAdmin.from('orders').update({
                deposit_transferred_at: new Date().toISOString(),
                stripe_capture_status: 'captured'
            }).eq('id', orderId);

            console.log(`[Auto-Payout] Released deposit for order ${order.order_no}`);
        }
    } catch (error) {
        console.error(`[Auto-Payout] Failed for order ${orderId}:`, error);
    }
}

// Background loop for automatic payouts (runs every 5 minutes)
if (process.env.NODE_ENV !== 'test') {
    setInterval(async () => {
        try {
            const { data: expiredOrders } = await supabaseAdmin
                .from('orders')
                .select('id')
                .eq('status', 'in_progress')
                .lt('verification_deadline', new Date().toISOString())
                .is('deposit_transferred_at', null);

            if (expiredOrders && expiredOrders.length > 0) {
                console.log(`[Auto-Payout] Found ${expiredOrders.length} orders for release`);
                for (const o of expiredOrders) {
                    await executeDepositPayout(o.id);
                }
            }
        } catch (err) {
            console.error('[Auto-Payout Loop Error]:', err);
        }
    }, 5 * 60 * 1000); // 5 minutes
}

// ============================================================
// GET /api/orders-v2/:id/provider-view - View order with token (no login required)
// ============================================================
router.get('/:id/provider-view', async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.query;

        if (!token) {
            return res.status(401).json({ success: false, message: '缺少访问令牌' });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, PROVIDER_TOKEN_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({ success: false, message: '链接已过期，请登录后查看', expired: true });
        }

        if (decoded.orderId !== id || decoded.type !== 'provider_access') {
            return res.status(403).json({ success: false, message: '无效的访问令牌' });
        }

        // Fetch order details
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                users!orders_user_id_fkey(id, name, phone)
            `)
            .eq('id', id)
            .single();

        if (error || !order) {
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        // Verify provider match
        if (order.provider_id !== decoded.providerId) {
            return res.status(403).json({ success: false, message: '您无权查看此订单' });
        }

        // Get service details
        let serviceName = null;
        let serviceImage = null;
        if (order.service_listing_id) {
            const { data: svc } = await supabaseAdmin
                .from('provider_services')
                .select('name, images')
                .eq('id', order.service_listing_id)
                .single();
            if (svc) {
                serviceName = svc.name;
                serviceImage = svc.images?.[0] || null;
            }
        }

        // Mask user phone for privacy (show only last 4 digits until accepted)
        const maskedPhone = order.provider_response_status === 'accepted'
            ? order.users?.phone
            : (order.users?.phone ? `***${order.users.phone.slice(-4)}` : null);

        res.json({
            success: true,
            order: {
                id: order.id,
                order_no: order.order_no,
                status: order.status,
                service_type: order.service_type,
                total_amount: order.total_amount,
                deposit_amount: order.deposit_amount,
                currency: order.currency,
                created_at: order.created_at,
                provider_response_status: order.provider_response_status,
                proposed_service_time: order.proposed_service_time,
                provider_message: order.provider_message,
                user_note: order.user_note, // Fix: Add user_note for provider
                service_name: serviceName,
                service_image: serviceImage,
                user: {
                    name: order.users?.name || '用户',
                    phone: maskedPhone
                }
            }
        });

    } catch (error) {
        console.error('Provider view error:', error);
        res.status(500).json({ success: false, message: '获取订单失败' });
    }
});

// ============================================================
// GET /api/orders-v2/:id/messages - Get message history
// ============================================================
router.get('/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.query; // May use token for provider access or session for user

        let userId = null;
        if (!token) {
            // User session auth
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).json({ success: false, message: '未授权' });
            // Simplified for this context, assume middleware handles user session usually
            // But here we need to verify who is requesting
        }

        const { data: messages, error } = await supabaseAdmin
            .from('order_messages')
            .select(`
                *,
                users!order_messages_sender_id_fkey(name, avatar_url, role)
            `)
            .eq('order_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json({ success: true, messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: '获取消息失败' });
    }
});

// ============================================================
// POST /api/orders-v2/:id/messages - Send a message
// ============================================================
router.post('/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { token, content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: '消息内容不能为空' });
        }

        // Identify sender
        let senderId = null;
        let isProvider = false;

        // Check Authorization header first (logged in user)
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const authToken = authHeader.substring(7);
            try {
                const jwtSecret = process.env.JWT_SECRET || 'fongbee-auth-secret';
                const decoded = jwt.verify(authToken, jwtSecret);
                senderId = decoded.id || decoded.userId;
                isProvider = decoded.role === 'provider';
            } catch (e) {
                // Token invalid, continue to check provider token
            }
        }

        // Check provider access token if no auth header
        if (!senderId && token) {
            try {
                const decoded = jwt.verify(token, PROVIDER_TOKEN_SECRET);
                senderId = decoded.providerId;
                isProvider = true;
            } catch (e) {
                return res.status(401).json({ success: false, message: '令牌无效或已过期' });
            }
        }

        // Fetch order to get recipient info
        const { data: order, error: orderErr } = await supabaseAdmin
            .from('orders')
            .select('*, users!orders_user_id_fkey(phone)')
            .eq('id', id)
            .single();

        if (orderErr || !order) return res.status(404).json({ success: false, message: '订单不存在' });

        // Verify sender is authorized for this order
        if (!senderId) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        // Check if sender is either the user or provider for this order
        if (senderId !== order.user_id && senderId !== order.provider_id) {
            return res.status(403).json({ success: false, message: '无权发送消息' });
        }

        // Determine if sender is provider based on order relationship
        isProvider = (senderId === order.provider_id);

        // Insert message
        const { data: msg, error: msgErr } = await supabaseAdmin
            .from('order_messages')
            .insert({
                order_id: id,
                sender_id: senderId,
                content: content.trim()
            })
            .select()
            .single();

        if (msgErr) throw msgErr;

        // Determine recipient ID
        const recipientId = isProvider ? order.user_id : order.provider_id;

        // Check if recipient is online (active in last 5 minutes)
        let isRecipientOnline = false;
        try {
            const { data: recipient, error: rErr } = await supabaseAdmin
                .from('users')
                .select('last_active_at, phone')
                .eq('id', recipientId)
                .single();

            if (!rErr && recipient?.last_active_at) {
                const lastActive = new Date(recipient.last_active_at).getTime();
                const now = new Date().getTime();
                // If active in last 2 minutes, consider online
                if (now - lastActive < 2 * 60 * 1000) {
                    isRecipientOnline = true;
                    console.log(`[Order Chat] Recipient ${recipientId} is online, skipping SMS.`);
                }
            }
        } catch (err) {
            console.error('Failed to check recipient online status:', err);
        }

        // Notify recipient via SMS ONLY if they are offline
        let recipientPhone = null;
        let notificationContent = '';

        // Build chat link
        const baseUrl = process.env.H5_BASE_URL || 'https://fongbee-v1-h5.vercel.app';
        const chatLink = `${baseUrl}/#/pages/order/order-chat?id=${id}&orderNo=${order.order_no}`;

        if (!isRecipientOnline) {
            if (isProvider) {
                // Recipient is User - provider sends, user receives
                recipientPhone = order.users?.phone;
                notificationContent = `【优服佳】服务商给您发送了新消息：${content.substring(0, 20)}${content.length > 20 ? '...' : ''}。点击查看：${chatLink}`;
            } else {
                // Recipient is Provider - user sends, provider receives
                const { data: pProfile } = await supabaseAdmin
                    .from('users')
                    .select('phone, name')
                    .eq('id', order.provider_id)
                    .single();
                recipientPhone = pProfile?.phone;

                // Get customer name for the SMS
                const { data: customer } = await supabaseAdmin
                    .from('users')
                    .select('name')
                    .eq('id', order.user_id)
                    .single();
                const customerName = customer?.name || '客户';

                notificationContent = `【优服佳】客户${customerName}回复了消息：${content.substring(0, 15)}${content.length > 15 ? '...' : ''}。请登录后查看：${chatLink}`;
            }

            if (recipientPhone) {
                try {
                    await sendSMS(recipientPhone, notificationContent);
                    console.log(`[Order Chat] SMS sent to ${recipientPhone}`);
                } catch (smsErr) {
                    console.error('Failed to notify via SMS:', smsErr);
                }
            }
        }

        // Always push a site-internal notification regardless of online status
        try {
            await supabaseAdmin.from('notifications').insert({
                user_id: recipientId,
                title: isProvider ? '收到服务商消息' : '收到客户消息',
                content: `您有关于订单 ${order.order_no} 的新消息：${content.substring(0, 50)}`,
                type: 'chat',
                link: `/pages/order/order-chat?id=${id}&orderNo=${order.order_no}`
            });
        } catch (noteErr) {
            console.error('Failed to create internal notification:', noteErr);
        }

        res.json({ success: true, message: msg });
    } catch (error) {
    }
});

// ============================================================
// POST /api/orders-v2/:id/provider-response - Provider responds to order
// ============================================================
router.post('/:id/provider-response', async (req, res) => {
    try {
        const { id } = req.params;
        const { token, action, message, proposedTime, rejectReason } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: '缺少访问令牌' });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, PROVIDER_TOKEN_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({ success: false, message: '链接已过期，请登录后操作', expired: true });
        }

        if (decoded.orderId !== id || decoded.type !== 'provider_access') {
            return res.status(403).json({ success: false, message: '无效的访问令牌' });
        }

        // Fetch order
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('*, users!orders_user_id_fkey(phone, name)')
            .eq('id', id)
            .single();

        if (error || !order) {
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        if (order.provider_id !== decoded.providerId) {
            return res.status(403).json({ success: false, message: '您无权操作此订单' });
        }

        // Handle different actions
        const updateData = { provider_responded_at: new Date().toISOString() };
        let userNotification = null;

        switch (action) {
            case 'accept':
                updateData.provider_response_status = 'accepted';
                if (proposedTime) {
                    updateData.proposed_service_time = proposedTime;
                }
                userNotification = `【优服佳】您的订单已被服务商接受！${proposedTime ? `服务时间：${new Date(proposedTime).toLocaleString('zh-CN')}。` : ''}服务商将尽快联系您。`;
                break;

            case 'reject':
                updateData.provider_response_status = 'rejected';
                updateData.provider_message = rejectReason || '服务商暂时无法接单';
                // Auto-cancel order and refund
                updateData.status = 'cancelled_by_provider';
                userNotification = `【优服佳】很抱歉，服务商无法接受您的订单。${rejectReason ? `原因：${rejectReason}。` : ''}定金将在3-5个工作日内退还。`;
                break;

            case 'message':
                updateData.provider_response_status = 'negotiating';
                updateData.provider_message = message;
                userNotification = `【优服佳】服务商给您留言：${message}。请登录查看详情并回复。`;
                break;

            case 'propose_time':
                updateData.provider_response_status = 'negotiating';
                updateData.proposed_service_time = proposedTime;
                if (message) updateData.provider_message = message;
                userNotification = `【优服佳】服务商建议服务时间为 ${new Date(proposedTime).toLocaleString('zh-CN')}，请登录确认或协商。`;
                break;

            default:
                return res.status(400).json({ success: false, message: '无效的操作类型' });
        }

        // Update order
        await supabaseAdmin
            .from('orders')
            .update(updateData)
            .eq('id', id);

        // Send notification to user
        if (userNotification && order.users?.phone) {
            try {
                await sendSMS(order.users.phone, userNotification);
                console.log(`[Provider Response] Notified user ${order.users.phone}`);
            } catch (smsErr) {
                console.error('[Provider Response] Failed to notify user:', smsErr);
            }
        }

        res.json({
            success: true,
            message: action === 'accept' ? '已接受订单' :
                action === 'reject' ? '已拒绝订单' : '已发送给用户'
        });

    } catch (error) {
        console.error('Provider response error:', error);
        res.status(500).json({ success: false, message: '操作失败' });
    }
});

// ============================================================
// GET /api/orders-v2/by-no/:orderNo - Get order by order_no (for short link redirect)
// ============================================================
router.get('/by-no/:orderNo', async (req, res) => {
    try {
        const { orderNo } = req.params;

        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('id, order_no, provider_access_token')
            .eq('order_no', orderNo)
            .single();

        if (error || !order) {
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Get order by no error:', error);
        res.status(500).json({ success: false, message: '获取订单失败' });
    }
});

// ============================================================
// POST /api/orders-v2/reviews/:id/reply - Provider replies to evaluation
// ============================================================
router.post('/reviews/:id/reply', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { replyContent } = req.body;
        const userId = req.user.id; // Provider's user ID

        if (!replyContent || !replyContent.trim()) {
            return res.status(400).json({ success: false, message: '回复内容不能为空' });
        }

        // Fetch the review to verify ownership
        const { data: review, error: fetchErr } = await supabaseAdmin
            .from('order_reviews')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchErr || !review) {
            return res.status(404).json({ success: false, message: '评价不存在' });
        }

        if (review.provider_id !== userId) {
            return res.status(403).json({ success: false, message: '无权回复此评价' });
        }

        // Update with reply
        const { data, error } = await supabaseAdmin
            .from('order_reviews')
            .update({
                reply_content: replyContent.trim(),
                reply_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, message: '回复成功', review: data });

    } catch (error) {
        console.error('Reply to review error:', error);
        res.status(500).json({ success: false, message: '回复失败' });
    }
});

export default router;
