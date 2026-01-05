/**
 * Stripe Webhook Handler
 * Processes Stripe payment events for order status updates
 */
import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { verifyWebhookSignature, isStripeConfigured } from '../services/stripeService.js';

const router = express.Router();

// Webhook endpoint - must use raw body for signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    let event;

    try {
        event = verifyWebhookSignature(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Signature verification failed' });
    }

    console.log(`📥 Stripe webhook received: ${event.type}`);

    try {
        switch (event.type) {
            case 'payment_intent.amount_capturable_updated':
                // Pre-authorization successful
                await handleAuthorizationHold(event.data.object);
                break;

            case 'payment_intent.succeeded':
                // Payment captured successfully
                await handlePaymentSucceeded(event.data.object);
                break;

            case 'payment_intent.canceled':
                // Payment cancelled (hold released)
                await handlePaymentCancelled(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                // Payment failed
                await handlePaymentFailed(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });

    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler error' });
    }
});

/**
 * Handle authorization hold (pre-auth successful)
 * Updates order status to 'auth_hold' and sets cancel deadline
 */
async function handleAuthorizationHold(paymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    console.log(`💳 Authorization hold successful for order ${orderId}`);

    // Get order to calculate cancel deadline
    const { data: order } = await supabaseAdmin
        .from('orders')
        .select('regret_period_hours')
        .eq('id', orderId)
        .single();

    const regretHours = order?.regret_period_hours || 24;
    const cancelDeadline = new Date(Date.now() + regretHours * 60 * 60 * 1000);

    await supabaseAdmin
        .from('orders')
        .update({
            status: 'auth_hold',
            stripe_capture_status: 'uncaptured',
            cancel_deadline: cancelDeadline.toISOString()
        })
        .eq('id', orderId);

    // TODO: Send notification to user about successful hold and cancel deadline
    // TODO: Send notification to provider about new order
}

/**
 * Handle payment succeeded (captured)
 */
async function handlePaymentSucceeded(paymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    console.log(`✅ Payment captured for order ${orderId}`);

    await supabaseAdmin
        .from('orders')
        .update({
            status: 'captured',
            stripe_capture_status: 'captured'
        })
        .eq('id', orderId)
        .eq('stripe_capture_status', 'uncaptured'); // Only update if not already captured

    // TODO: Send notification to provider that deposit is secured
}

/**
 * Handle payment cancelled (hold released)
 */
async function handlePaymentCancelled(paymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    console.log(`❌ Payment cancelled for order ${orderId}`);

    // Order status is already updated by the cancel endpoint
    // Just log for audit purposes
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(paymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    console.log(`⚠️ Payment failed for order ${orderId}`);

    // Update order status
    await supabaseAdmin
        .from('orders')
        .update({
            status: 'cancelled',
            cancel_reason: 'Payment failed'
        })
        .eq('id', orderId);

    // TODO: Notify user about payment failure
}

export default router;
