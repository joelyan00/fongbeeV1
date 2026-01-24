import { supabaseAdmin } from '../config/supabase.js';
import { getConfigValue } from '../routes/pricingConfig.js';
import { createImmediatePayment } from './stripeService.js';

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
        .from('provider_profiles')
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
        console.warn(`Category ${categoryId} not found, fetching default from config`);
        const fallbackCost = await getQuoteDefaultCost();
        return fallbackCost;
    }

    return data.quote_credits_cost;
}

/**
 * Get default quote cost from config
 */
export async function getQuoteDefaultCost() {
    const { data, error } = await supabaseAdmin
        .from('system_pricing_config')
        .select('config_value')
        .eq('config_key', 'credits_per_quote')
        .single();

    if (error || !data) {
        return 20; // Hardcoded fallback
    }

    return parseInt(data.config_value);
}



/**
 * Get standard service listing cost from pricing config
 */
export async function getListingCreditCost() {
    const { data, error } = await supabaseAdmin
        .from('system_pricing_config')
        .select('config_value')
        .eq('config_key', 'credits_per_service_listing')
        .single();

    if (error || !data) {
        console.warn('Listing cost not found in system_pricing_config, using default');
        return 10; // Match default in SQL
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
            transaction_type: 'quote',
            credits_type: source === 'subscription' ? 'subscription' : 'purchased',
            description: `报价消耗积分${serviceCategoryId ? ` (类别: ${serviceCategoryId})` : ''}`,
            service_category_id: serviceCategoryId,
            subscription_id: source === 'subscription' ? subscription?.id : null,
            reference_id: orderId,
            reference_type: 'order'
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
                transaction_type: 'listing',
                credits_type: source === 'purchased' ? 'purchased' : 'subscription',
                description: '上架标准服务消耗积分',
                subscription_id: source.startsWith('subscription') ? subscription?.id : null,
                reference_id: serviceId,
                reference_type: 'service'
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

    const balanceAfter = balance - amount;

    // Check for auto-recharge
    checkAndTriggerAutoRecharge(userId, balanceAfter);

    return true;
}

/**
 * Automatically recharge credits if enabled and balance is low
 */
export async function checkAndTriggerAutoRecharge(userId, currentBalance) {
    try {
        const { data: profile } = await supabaseAdmin
            .from('provider_profiles')
            .select('auto_recharge_enabled, auto_recharge_amount, auto_recharge_threshold')
            .eq('user_id', userId)
            .single();

        if (profile &&
            profile.auto_recharge_enabled &&
            profile.auto_recharge_amount > 0 &&
            currentBalance <= (profile.auto_recharge_threshold || 0)) {

            console.log(`[AutoRecharge] Triggering for user ${userId}. Balance: ${currentBalance}, Threshold: ${profile.auto_recharge_threshold}`);

            // Execute recharge
            await rechargeCredits(userId, profile.auto_recharge_amount).catch(err => {
                console.error('[AutoRecharge] Payment execution failed:', err.message);
            });
        }
    } catch (e) {
        console.error('[AutoRecharge] Check failed:', e);
    }
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

    // Fetch dynamic pricing configs
    const creditsPerCad = await getConfigValue('credits_per_cad', 100);
    const creditsPerListing = await getConfigValue('credits_per_service_listing', 10);
    const creditsPerQuote = await getConfigValue('credits_per_quote', 5);

    return {
        total: purchased + subscriptionCredits,
        purchased,
        subscription: subscriptionCredits,
        listings: subscriptionListings,
        subscriptionInfo: subscription,
        config: {
            credits_per_cad: creditsPerCad,
            credits_per_service_listing: creditsPerListing,
            credits_per_quote: creditsPerQuote
        }
    };
}

/**
 * Grant signup bonus credits to a new provider
 * @param {string} userId - User ID
 */
export async function grantSignupBonus(userId) {
    try {
        const isEnabled = await getConfigValue('enable_provider_signup_bonus', false);
        if (!isEnabled) return { success: false, message: 'Signup bonus is disabled' };

        const bonusAmount = await getConfigValue('provider_signup_bonus_amount', 0);
        if (bonusAmount <= 0) return { success: false, message: 'Bonus amount is zero' };

        // 1. Double check if already granted
        const { data: existingBonus } = await supabaseAdmin
            .from('credits_transactions')
            .select('id')
            .eq('user_id', userId)
            .eq('transaction_type', 'signup_bonus')
            .limit(1);

        if (existingBonus && existingBonus.length > 0) {
            return { success: false, message: 'Bonus already granted' };
        }

        // 2. Grant credits
        // Get current balance
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single();

        const newTotal = (user?.credits || 0) + bonusAmount;

        // Update user credits
        const { error: userUpdateError } = await supabaseAdmin
            .from('users')
            .update({ credits: newTotal })
            .eq('id', userId);

        if (userUpdateError) throw userUpdateError;

        // 3. Record transaction
        const { error: txError } = await supabaseAdmin
            .from('credits_transactions')
            .insert({
                user_id: userId,
                amount: bonusAmount,
                balance_after: newTotal,
                transaction_type: 'signup_bonus',
                credits_type: 'purchased',
                description: '新服务商入驻奖励积分'
            });

        if (txError) throw txError;

        return { success: true, amount: bonusAmount };
    } catch (error) {
        console.error('Grant signup bonus error:', error);
        return { success: false, message: error.message };
    }
}

export async function rechargeCredits(userId, amount, paymentMethodId = null) {
    try {
        // 1. Get user profile and stripe customer ID from users table
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('stripe_customer_id, email')
            .eq('id', userId)
            .single();

        if (userError || !user?.stripe_customer_id) {
            logTrace('Failed to find stripe_customer_id', userError);
            console.error('[Recharge] No stripe_customer_id for user:', userId);
            throw new Error('未找到有效的 Stripe 客户信息，请先绑定支付卡。');
        }


        // 2. Perform payment via Stripe
        console.log('[Recharge] Starting payment for user:', userId, 'amount:', amount);
        // Fetch credits per CAD from config
        const creditsPerCad = await getConfigValue('credits_per_cad', 100);

        if (!creditsPerCad || creditsPerCad <= 0) {
            throw new Error('系统配置错误：积分换算比例无效。');
        }

        const cadAmount = amount / creditsPerCad;

        if (isNaN(cadAmount) || cadAmount <= 0) {
            throw new Error('无效的支付金额。');
        }

        const paymentResult = await createImmediatePayment({
            amount: cadAmount,
            currency: 'cad',
            customerId: user.stripe_customer_id,
            paymentMethodId: paymentMethodId,
            metadata: {
                userId,
                type: 'credit_recharge',
                amount_credits: amount
            }
        });

        console.log('[Recharge] Payment result status:', paymentResult.status);

        if (paymentResult.status !== 'succeeded' && paymentResult.status !== 'processing') {
            throw new Error(`支付失败: ${paymentResult.status}`);
        }

        // 3. Update balance and record transaction
        // Calculate new balance
        const { data: transactions } = await supabaseAdmin
            .from('credits_transactions')
            .select('amount')
            .eq('user_id', userId);
        const currentBalance = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
        const balanceAfter = currentBalance + amount;

        const { error: txError } = await supabaseAdmin.from('credits_transactions').insert({
            user_id: userId,
            amount: amount,
            balance_after: balanceAfter,
            transaction_type: 'purchase',
            credits_type: 'purchased',
            description: `购买积分 (Stripe: ${paymentResult.paymentIntentId || 'auto'})`
        });

        if (txError) {
            throw txError;
        }

        // 4. Also update users.credits field for UI components that read from it
        const { error: updateError } = await supabaseAdmin.rpc('increment_user_credits', {
            p_user_id: userId,
            p_amount: amount
        });

        if (updateError) {
            // Fallback: direct update if RPC doesn't exist
            // First get current credits
            const { data: currentUser } = await supabaseAdmin
                .from('users')
                .select('credits')
                .eq('id', userId)
                .single();

            const newCredits = (currentUser?.credits || 0) + amount;
            await supabaseAdmin
                .from('users')
                .update({ credits: newCredits })
                .eq('id', userId);
        }

        return {
            success: true,
            paymentIntentId: paymentResult.paymentIntentId,
            status: paymentResult.status
        };

    } catch (error) {
        console.error('Recharge credits error:', error);
        throw error;
    }
}

/**
 * Get user's credit transaction history
 * @param {string} userId - User ID
 * @param {Object} params - { limit, offset }
 */
export async function getUserCreditTransactions(userId, params = {}) {
    const { limit = 50, offset = 0 } = params;

    const { data, error, count } = await supabaseAdmin
        .from('credits_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;

    return { transactions: data, total: count };
}

export default {
    consumeQuoteCredits,
    consumeListingQuota,
    getUserCreditsBalance,
    getActiveSubscription,
    getProviderInfo,
    getServiceCategoryQuoteCost,
    getListingCreditCost,
    grantSignupBonus,
    rechargeCredits,
    checkAndTriggerAutoRecharge
};
