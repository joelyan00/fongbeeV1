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
