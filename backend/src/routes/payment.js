import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    createSetupIntent,
    listPaymentMethods,
    createCustomer,
    getStripe,
    setDefaultPaymentMethod
} from '../services/stripeService.js';

import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { mockUsers } from './auth.js';

const router = express.Router();

// Helper to get or create Stripe Customer ID for a user
const getOrCreateStripeCustomerId = async (user) => {
    let stripeCustomerId = user.stripe_customer_id;

    // Check DB if configured
    if (!stripeCustomerId && isSupabaseConfigured()) {
        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();
        stripeCustomerId = dbUser?.stripe_customer_id;
    }
    // Check Mock storage if not found yet
    if (!stripeCustomerId) {
        const mockUser = mockUsers.find(u => u.id === user.id);
        if (mockUser) stripeCustomerId = mockUser.stripe_customer_id;
    }

    if (!stripeCustomerId) {
        // Create new customer in Stripe
        try {
            const customer = await createCustomer(user.email, user.name);
            stripeCustomerId = customer.id;

            // Save back to DB OR Mock Storage
            if (isSupabaseConfigured()) {
                await supabaseAdmin
                    .from('users')
                    .update({ stripe_customer_id: stripeCustomerId })
                    .eq('id', user.id);
            } else {
                // Save to mock storage
                const mockUser = mockUsers.find(u => u.id === user.id);
                if (mockUser) {
                    mockUser.stripe_customer_id = stripeCustomerId;
                    console.log(`[Mock] Assigned Stripe Customer ${stripeCustomerId} to user ${user.id}`);
                }
            }

            // Also update the current req.user object so subsequent logic in this req works
            user.stripe_customer_id = stripeCustomerId;

        } catch (e) {
            console.error('Failed to create Stripe customer:', e);
            throw e;
        }
    }

    return stripeCustomerId;
};

// GET /api/payment/methods - List saved cards
router.get('/methods', authenticateToken, async (req, res) => {
    try {
        const stripeCustomerId = await getOrCreateStripeCustomerId(req.user);
        console.log(`[GET /methods] User: ${req.user.email}, CustomerID: ${stripeCustomerId}`);

        const methods = await listPaymentMethods(stripeCustomerId);
        console.log(`[GET /methods] Found ${methods.length} cards`);

        // Transform for frontend
        const formattedMethods = methods.map(pm => ({
            id: pm.id,
            brand: pm.card.brand,
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
            icon: pm.card.brand === 'visa' ? '/static/visa.png' : '/static/mastercard.png',
            is_default: pm.is_default
        }));

        res.json({ methods: formattedMethods });
    } catch (error) {
        console.error('List methods error:', error);
        res.status(500).json({ error: '获取支付方式失败' });
    }
});

// POST /api/payment/setup-intent - Create intent to add new card
router.post('/setup-intent', authenticateToken, async (req, res) => {
    try {
        const stripeCustomerId = await getOrCreateStripeCustomerId(req.user);
        console.log(`[POST /setup-intent] User: ${req.user.email}, CustomerID: ${stripeCustomerId}`);

        const setupIntent = await createSetupIntent(stripeCustomerId);

        res.json({
            clientSecret: setupIntent.client_secret,
            customerId: stripeCustomerId
        });
    } catch (error) {
        console.error('Setup intent error:', error);
        res.status(500).json({ error: '初始化支付组件失败' });
    }
});

// POST /api/payment/set-default
router.post('/set-default', authenticateToken, async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        if (!paymentMethodId) return res.status(400).json({ error: 'Missing paymentMethodId' });

        const stripeCustomerId = await getOrCreateStripeCustomerId(req.user);
        await setDefaultPaymentMethod(stripeCustomerId, paymentMethodId);

        res.json({ success: true });
    } catch (error) {
        console.error('Set default error:', error);
        res.status(500).json({ error: '设置默认卡失败' });
    }
});

export default router;
