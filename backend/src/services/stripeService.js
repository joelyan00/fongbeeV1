import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

let stripe;

if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16', // Use latest stable version or lock to this
    });
} else {
    console.warn('⚠️ Stripe Secret Key not configured. Stripe features will default to mock/error.');
}

export const getStripe = () => stripe;

// Create a SetupIntent (for adding a new payment method without charging immediately)
export const createSetupIntent = async (customerId) => {
    if (!stripe) throw new Error('Stripe not configured');

    return await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
    });
};



// Create a Customer (if using Supabase auth usually we map user.id to stripe_customer_id)
export const createCustomer = async (email, name) => {
    if (!stripe) throw new Error('Stripe not configured');

    return await stripe.customers.create({
        email,
        name,
    });
};

// Create a PaymentIntent (Charge money)
export const createPaymentIntent = async ({ amount, currency = 'cad', customerId, paymentMethodId, description }) => {
    if (!stripe) throw new Error('Stripe not configured');

    return await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        payment_method: paymentMethodId,
        description,
        confirm: true, // Attempt to charge immediately
        off_session: true, // Allow charging saved card without user re-auth if possible
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never' // Simplified for this demo
        }
    });
};

export const setDefaultPaymentMethod = async (customerId, paymentMethodId) => {
    if (!stripe) throw new Error('Stripe not configured');
    await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId }
    });
};

export const listPaymentMethods = async (customerId) => {
    if (!stripe) return [];

    try {
        const customer = await stripe.customers.retrieve(customerId);
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });

        const defaultMethodId = customer.invoice_settings?.default_payment_method || customer.default_source;

        return paymentMethods.data.map(pm => ({
            ...pm,
            is_default: pm.id === defaultMethodId
        }));
    } catch (e) {
        console.error('List Payment Methods Error:', e);
        return [];
    }
};

// ============================================================
// NEW: Payment System Functions (Authorization, Capture, Refund)
// ============================================================

/**
 * Create a Payment Intent with manual capture (pre-authorization)
 * Used for standard/simple_custom services with regret period
 */
export const createAuthorizationHold = async ({
    amount,
    currency = 'cad',
    customerId,
    metadata = {}
}) => {
    if (!stripe) throw new Error('Stripe not configured');

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        capture_method: 'manual', // Pre-authorization only
        customer: customerId || undefined,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'
        },
        metadata: {
            ...metadata,
            type: 'authorization_hold'
        }
    });

    return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status
    };
};

/**
 * Create a Payment Intent with immediate capture
 * Used for complex_custom deposit (no regret period)
 */
export const createImmediatePayment = async ({
    amount,
    currency = 'cad',
    customerId,
    metadata = {}
}) => {
    if (!stripe) throw new Error('Stripe not configured');

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        customer: customerId || undefined,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'
        },
        metadata: {
            ...metadata,
            type: 'immediate_payment'
        }
    });

    return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status
    };
};

/**
 * Capture a pre-authorized payment (after regret period)
 */
export const capturePayment = async (paymentIntentId) => {
    if (!stripe) throw new Error('Stripe not configured');

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amountCaptured: paymentIntent.amount_received / 100
    };
};

/**
 * Cancel a pre-authorized payment (release hold)
 */
export const cancelPaymentIntent = async (paymentIntentId) => {
    if (!stripe) throw new Error('Stripe not configured');

    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
    };
};

/**
 * Create a refund (full or partial)
 */
export const createRefund = async ({
    paymentIntentId,
    amount = null,
    reason = 'requested_by_customer'
}) => {
    if (!stripe) throw new Error('Stripe not configured');

    const refundParams = {
        payment_intent: paymentIntentId,
        reason
    };

    if (amount) {
        refundParams.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundParams);

    return {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100
    };
};

/**
 * Transfer funds to connected account (provider payout)
 */
export const transferToProvider = async ({
    amount,
    currency = 'cad',
    destinationAccountId,
    metadata = {}
}) => {
    if (!stripe) throw new Error('Stripe not configured');

    const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        destination: destinationAccountId,
        metadata
    });

    return {
        transferId: transfer.id,
        amount: transfer.amount / 100
    };
};

/**
 * Split funds between provider and platform
 */
export const calculateSplit = (amount, providerShare = 70) => {
    const providerAmount = (amount * providerShare) / 100;
    const platformAmount = amount - providerAmount;

    return {
        providerAmount: Math.round(providerAmount * 100) / 100,
        platformAmount: Math.round(platformAmount * 100) / 100
    };
};

/**
 * Verify Stripe webhook signature
 */
export const verifyWebhookSignature = (payload, signature, webhookSecret) => {
    if (!stripe) throw new Error('Stripe not configured');

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = () => !!stripe;

