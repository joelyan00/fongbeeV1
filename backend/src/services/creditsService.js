/**
 * Credits Service
 * Handles credits consumption logic for subscription and credits users
 */
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get user's active subscription
 */
export async function getActiveSubscription(userId) {
    const { data, error } = await supabaseAdmin
        .from('active_user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }

    return data;
}

/**
 * Get provider's user type and subscription info
 */
export async function getProviderInfo(providerId) {
    const { data: provider, error } = await supabaseAdmin
        .from('providers')
        .select('user_id, user_type, active_subscription_id')
        .eq('id', providerId)
        .single();

    if (error) throw error;

    let subscription = null;
    if (provider.user_type === 'subscription' && provider.active_subscription_id) {
        subscription = await getActiveSubscription(provider.user_id);
    }

    return { provider, subscription };
}

/**
 * Get service category quote cost
 */
export async function getServiceCategoryQuoteCost(categoryId) {
    if (!categoryId) {
        // Default cost if no category specified
        return 20;
    }

    const { data, error } = await supabaseAdmin
        .from('custom_service_categories')
        .select('quote_credits_cost')
        .eq('id', categoryId)
        .eq('is_active', true)
        .single();

    if (error || !data) {
        console.warn(`Category ${categoryId} not found, using default cost`);
        return 20;
    }

    return data.quote_credits_cost;
}

/**
 * Get standard service listing cost from pricing config
 */
export async function getListingCreditCost() {
    const { data, error } = await supabaseAdmin
        .from('pricing_config')
        .select('config_value')
        .eq('config_key', 'credits_per_service_listing')
        .single();

    if (error || !data) {
        console.warn('Listing cost not found in config, using default');
        return 100; // Default cost
    }

    return parseInt(data.config_value);
}

/**
 * Consume credits for quote (supports service category)
 * @param {string} providerId - Provider ID
 * @param {string} serviceCategoryId - Service category ID (optional)
 * @param {string} orderId - Order ID for transaction record
 * @returns {Object} - { success, message, creditsUsed, source }
 */
export async function consumeQuoteCredits(providerId, serviceCategoryId = null, orderId = null) {
    try {
        // Get provider info and subscription
        const { provider, subscription } = await getProviderInfo(providerId);

        // Get quote cost for this category
        const requiredCredits = await getServiceCategoryQuoteCost(serviceCategoryId);

        let creditsUsed = 0;
        let source = 'purchased'; // 'subscription' or 'purchased'

        if (provider.user_type === 'subscription' && subscription) {
            // Subscription user: try to use subscription credits first
            if (subscription.remaining_credits >= requiredCredits) {
                // Use subscription credits
                const { error } = await supabaseAdmin
                    .from('user_subscriptions')
                    .update({
                        remaining_credits: subscription.remaining_credits - requiredCredits
                    })
                    .eq('id', subscription.id);

                if (error) throw error;

                creditsUsed = requiredCredits;
                source = 'subscription';
            } else {
                // Subscription credits insufficient, use purchased credits
                await consumePurchasedCredits(provider.user_id, requiredCredits);
                creditsUsed = requiredCredits;
                source = 'purchased';
            }
        } else {
            // Credits user: use purchased credits
            await consumePurchasedCredits(provider.user_id, requiredCredits);
            creditsUsed = requiredCredits;
            source = 'purchased';
        }

        // Record transaction
        await supabaseAdmin.from('credits_transactions').insert({
            user_id: provider.user_id,
            amount: -creditsUsed,
            type: 'debit',
            description: `报价消耗积分${serviceCategoryId ? ` (类别: ${serviceCategoryId})` : ''}`,
            transaction_type: 'quote',
            service_category_id: serviceCategoryId,
            subscription_id: source === 'subscription' ? subscription?.id : null,
            related_order_id: orderId
        });

        return {
            success: true,
            message: `成功消耗 ${creditsUsed} 积分`,
            creditsUsed,
            source
        };

    } catch (error) {
        console.error('Consume quote credits error:', error);
        throw error;
    }
}

/**
 * Consume credits/quota for standard service listing
 * @param {string} providerId - Provider ID
 * @param {string} serviceId - Service ID for transaction record
 * @returns {Object} - { success, message, consumed, source }
 */
export async function consumeListingQuota(providerId, serviceId = null) {
    try {
        // Get provider info and subscription
        const { provider, subscription } = await getProviderInfo(providerId);

        let consumed = { credits: 0, listings: 0 };
        let source = 'purchased';

        if (provider.user_type === 'subscription' && subscription) {
            // Subscription user: try to use listing quota first
            if (subscription.remaining_listings > 0) {
                // Use listing quota
                const { error } = await supabaseAdmin
                    .from('user_subscriptions')
                    .update({
                        remaining_listings: subscription.remaining_listings - 1
                    })
                    .eq('id', subscription.id);

                if (error) throw error;

                consumed.listings = 1;
                source = 'subscription_quota';
            } else {
                // Listing quota exhausted, use credits
                const listingCost = await getListingCreditCost();

                if (subscription.remaining_credits >= listingCost) {
                    // Use subscription credits
                    const { error } = await supabaseAdmin
                        .from('user_subscriptions')
                        .update({
                            remaining_credits: subscription.remaining_credits - listingCost
                        })
                        .eq('id', subscription.id);

                    if (error) throw error;

                    consumed.credits = listingCost;
                    source = 'subscription_credits';
                } else {
                    // Use purchased credits
                    await consumePurchasedCredits(provider.user_id, listingCost);
                    consumed.credits = listingCost;
                    source = 'purchased';
                }
            }
        } else {
            // Credits user: use purchased credits
            const listingCost = await getListingCreditCost();
            await consumePurchasedCredits(provider.user_id, listingCost);
            consumed.credits = listingCost;
            source = 'purchased';
        }

        // Record transaction
        if (consumed.credits > 0) {
            await supabaseAdmin.from('credits_transactions').insert({
                user_id: provider.user_id,
                amount: -consumed.credits,
                type: 'debit',
                description: '上架标准服务消耗积分',
                transaction_type: 'listing',
                subscription_id: source.startsWith('subscription') ? subscription?.id : null,
                related_service_id: serviceId
            });
        }

        return {
            success: true,
            message: consumed.listings > 0
                ? '成功消耗 1 次上架配额'
                : `成功消耗 ${consumed.credits} 积分`,
            consumed,
            source
        };

    } catch (error) {
        console.error('Consume listing quota error:', error);
        throw error;
    }
}

/**
 * Consume purchased credits (from credits balance)
 * @param {string} userId - User ID
 * @param {number} amount - Amount to consume
 */
async function consumePurchasedCredits(userId, amount) {
    // Get current balance
    const { data: balanceData } = await supabaseAdmin
        .from('credits_transactions')
        .select('amount')
        .eq('user_id', userId);

    const balance = balanceData?.reduce((sum, t) => sum + t.amount, 0) || 0;

    if (balance < amount) {
        throw new Error(`积分不足。当前余额: ${balance}，需要: ${amount}`);
    }

    // Credits are sufficient, will be recorded in transaction by caller
    return true;
}

/**
 * Get user's total credits balance (purchased + subscription)
 * @param {string} userId - User ID
 * @returns {Object} - { total, purchased, subscription }
 */
export async function getUserCreditsBalance(userId) {
    // Get purchased credits
    const { data: transactions } = await supabaseAdmin
        .from('credits_transactions')
        .select('amount')
        .eq('user_id', userId);

    const purchased = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

    // Get subscription credits
    const subscription = await getActiveSubscription(userId);
    const subscriptionCredits = subscription?.remaining_credits || 0;
    const subscriptionListings = subscription?.remaining_listings || 0;

    return {
        total: purchased + subscriptionCredits,
        purchased,
        subscription: subscriptionCredits,
        listings: subscriptionListings,
        subscriptionInfo: subscription
    };
}

export default {
    consumeQuoteCredits,
    consumeListingQuota,
    getUserCreditsBalance,
    getActiveSubscription,
    getProviderInfo,
    getServiceCategoryQuoteCost,
    getListingCreditCost
};
