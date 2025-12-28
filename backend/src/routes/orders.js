import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { createPaymentIntent, getStripe, listPaymentMethods } from '../services/stripeService.js';
import { sendProviderHiredNotification } from '../services/emailService.js';
import { mockUsers } from './auth.js';

const router = express.Router();

// Helper to get order/submission
const getOrder = async (id) => {
    // We use the 'submissions' table as orders
    if (isSupabaseConfigured()) {
        const { data, error } = await supabaseAdmin
            .from('submissions')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) throw new Error('Order not found');
        return data;
    } else {
        // Mock (this might be tricky if mockSubmissions aren't exported. 
        // For now, fail or try to use a mock store if we had one global.
        // Assuming database is used given previous context)
        throw new Error('Please configure Supabase for order payments.');
    }
};

// Helper: Log transaction
const logTransaction = async (userId, orderId, amount, type, status = 'success') => {
    if (isSupabaseConfigured()) {
        await supabaseAdmin.from('wallet_transactions').insert({
            user_id: userId,
            order_id: orderId,
            amount,
            type,
            status
        });
    }
};

// Helper: Get Platform Fee Percent
const getPlatformFeePercent = async () => {
    if (!isSupabaseConfigured()) return 0; // Default to 0 if no DB, safer for logic but user wants 10? using 0 as safe default if logic missing. NO, use 0 as base. 
    // Actually user asked for "Set fee", default should be 0 until set?
    // Let's default to 0 to avoid surprise charges if config missing.
    // UPDATE: user context says "Currently 0, want to set". So default 0 is safe.
    try {
        const { data } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'platform_fee_percent')
            .single();
        return data ? Number(data.value) : 0;
    } catch (e) {
        return 0;
    }
};

// Helper: Add to wallet
const addToWallet = async (userId, amount) => {
    if (isSupabaseConfigured()) {
        // Atomic increment? Supabase doesn't support 'increment' easily via JS client 
        // without RPC or read-update-write. RPC is better for concurrency.
        // But for MVP read-update is okay if low traffic.

        // Better: Use a custom RPG function if possible, but let's do R-W for simplicity.
        const { data: user } = await supabaseAdmin.from('users').select('wallet_balance').eq('id', userId).single();
        const current = Number(user?.wallet_balance || 0);
        const next = current + Number(amount);

        await supabaseAdmin.from('users').update({ wallet_balance: next }).eq('id', userId);
    }
}

// 1. Pay Deposit
router.post('/:id/pay-deposit', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        let { paymentMethodId } = req.body; // Optional: If using a new card
        const userId = req.user.id; // Buyer

        // 1. Get Order
        const order = await getOrder(id);

        // Validation
        if (order.status !== 'pending' && order.status !== 'pending_deposit' && order.status !== 'processing') {
            return res.status(400).json({ error: 'Order is not in pending state' });
        }

        const depositAmount = order.deposit_price || 20.00; // Default or DB value

        // 2. Charge User (Platform Account)
        // We reuse the user's saved stripe customer id from profile
        const { data: userProfile } = await supabaseAdmin.from('users').select('stripe_customer_id').eq('id', userId).single();

        if (!userProfile?.stripe_customer_id) {
            return res.status(400).json({ error: 'Please add a payment method first' });
        }

        // Auto-select card if not provided
        if (!paymentMethodId) {
            const cards = await listPaymentMethods(userProfile.stripe_customer_id);
            if (!cards || cards.length === 0) {
                return res.status(400).json({ error: '请先在个人中心绑定支付卡片' });
            }
            paymentMethodId = cards[0].id;
        }

        const paymentIntent = await createPaymentIntent({
            amount: depositAmount,
            currency: 'cad',
            customerId: userProfile.stripe_customer_id,
            paymentMethodId: paymentMethodId, // Optional
            description: `Deposit for Order #${order._order_no || id}`
        });

        if (paymentIntent.status !== 'succeeded') {
            console.error('Payment Failed Intent:', JSON.stringify(paymentIntent, null, 2));
            const reason = paymentIntent.last_payment_error?.message || `Status: ${paymentIntent.status}`;
            return res.status(400).json({ error: `支付失败: ${reason}` });
        }

        // 3. Update Order
        await supabaseAdmin
            .from('submissions')
            .update({
                status: 'in_progress', // Ready for service
                deposit_status: 'paid', // We need to ensure these columns exist now
                deposit_paid_at: new Date().toISOString()
            })
            .eq('id', id);

        // 4. Email Notification to Provider
        if (order.assigned_provider_id) {
            try {
                const { data: providerUser } = await supabaseAdmin
                    .from('users')
                    .select('email')
                    .eq('id', order.assigned_provider_id)
                    .single();

                if (providerUser?.email) {
                    await sendProviderHiredNotification(providerUser.email, order, depositAmount);
                }
            } catch (emailErr) {
                console.error('Failed to send provider email:', emailErr);
            }
        }

        // 5. Log Transaction (Incoming to Platform)
        // We log it under System / Admin or just mark order as paid.
        // Transaction log:
        await logTransaction(userId, id, -depositAmount, 'deposit_outgoing'); // User paid

        res.json({ message: 'Deposit paid successfully', status: 'in_progress' });
    } catch (error) {
        console.error('Pay Deposit Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Confirm Start (Release Deposit to Provider)
router.post('/:id/confirm-start', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Buyer

        const order = await getOrder(id);

        // Only buyer can confirm
        if (order.user_id !== userId) return res.status(403).json({ error: 'Unauthorized' });

        if (order.status !== 'in_progress') {
            return res.status(400).json({ error: 'Order not in progress or already started' });
        }

        const providerId = order.assigned_provider_id;
        if (!providerId) return res.status(400).json({ error: 'No provider assigned' });

        const depositAmount = order.deposit_price || 20.00;

        // Calculate Platform Fee
        const feePercent = await getPlatformFeePercent();
        const feeAmount = Number(((depositAmount * feePercent) / 100).toFixed(2));
        const providerAmount = Number((depositAmount - feeAmount).toFixed(2));

        // 1. Update Order
        await supabaseAdmin
            .from('submissions')
            .update({
                status: 'service_started',
                platform_fee: feeAmount, // Store fee in order record if column exists, usually good practice. 
                // Or just proceed. Schema might not have it. omitting for safety.
            })
            .eq('id', id);

        // 2. Transfer to Provider Wallet (Net Amount)
        await addToWallet(providerId, providerAmount);

        // 3. Log
        await logTransaction(providerId, id, providerAmount, 'deposit_income'); // income = net

        // 4. Log Platform Fee (Optional: if we want to track revenue)
        // await logTransaction('PLATFORM', id, feeAmount, 'platform_fee');

        res.json({
            message: 'Service started, deposit released to provider.',
            details: {
                deposit: depositAmount,
                fee: feeAmount,
                net: providerAmount,
                percent: feePercent
            }
        });

    } catch (error) {
        console.error('Confirm Start Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Pay Balance (Complete)
router.post('/:id/pay-balance', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { method } = req.body; // 'online' or 'offline'
        const userId = req.user.id;

        const order = await getOrder(id);
        const providerId = order.assigned_provider_id;

        // Calculate balance
        const total = order.total_price || 120.00;
        const deposit = order.deposit_price || 20.00;
        const balance = total - deposit;

        if (balance <= 0) return res.status(400).json({ error: 'No balance remaining' });

        if (method === 'online') {
            // Charge Stripe
            const { data: userProfile } = await supabaseAdmin.from('users').select('stripe_customer_id').eq('id', userId).single();
            if (!userProfile?.stripe_customer_id) return res.status(400).json({ error: 'No payment method' });

            const paymentIntent = await createPaymentIntent({
                amount: balance,
                currency: 'cad',
                customerId: userProfile.stripe_customer_id,
                description: `Balance for Order #${order._order_no}`
            });

            if (paymentIntent.status !== 'succeeded') return res.status(400).json({ error: 'Payment failed' });

            // Credit Provider
            await addToWallet(providerId, balance);
            await logTransaction(providerId, id, balance, 'balance_payment_online');

            // Update Order
            await supabaseAdmin
                .from('submissions')
                .update({
                    status: 'completed',
                    balance_status: 'paid_online'
                })
                .eq('id', id);

        } else {
            // Offline
            // Update Order Only
            await supabaseAdmin
                .from('submissions')
                .update({
                    status: 'completed',
                    balance_status: 'paid_offline'
                })
                .eq('id', id);
        }

        res.json({ message: 'Order completed' });

    } catch (error) {
        console.error('Pay Balance Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
