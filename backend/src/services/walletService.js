import { supabaseAdmin } from '../config/supabase.js';

/**
 * Create a wallet for a provider
 * @param {string} providerId - User ID of the provider
 */
export const createWallet = async (providerId) => {
    try {
        if (!supabaseAdmin) return null;

        const { data, error } = await supabaseAdmin
            .from('provider_wallets')
            .insert([{ provider_id: providerId, balance: 0, status: 'active' }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating wallet:', error);
        // Ignore if already exists (Unique violation)
        if (error.code === '23505') return null;
        throw error;
    }
};

/**
 * Get wallet balance
 * @param {string} providerId 
 */
export const getWallet = async (providerId) => {
    if (!supabaseAdmin) return null;

    const { data, error } = await supabaseAdmin
        .from('provider_wallets')
        .select('*')
        .eq('provider_id', providerId)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Credit funds to wallet (Deposit release, etc.)
 * @param {string} providerId 
 * @param {number} amount 
 * @param {string} type 
 * @param {string} orderId 
 * @param {string} description 
 */
export const creditWallet = async (providerId, amount, type, orderId, description) => {
    if (!supabaseAdmin) throw new Error('Supabase not configured');

    // 1. Get Wallet ID (Create if not exists - auto-provisioning)
    let wallet = await getWallet(providerId);
    if (!wallet) {
        wallet = await createWallet(providerId);
    }
    if (!wallet) throw new Error('Wallet not found');

    // 2. Insert Transaction
    // Trigger on DB will auto-update balance
    const { data, error } = await supabaseAdmin
        .from('wallet_transactions')
        .insert([{
            wallet_id: wallet.id,
            amount: Math.abs(amount), // Ensure positive
            type,
            order_id: orderId,
            description
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Debit funds from wallet (Penalty, etc.)
 * @param {string} providerId 
 * @param {number} amount 
 * @param {string} type 
 * @param {string} orderId 
 * @param {string} description 
 */
export const debitWallet = async (providerId, amount, type, orderId, description) => {
    if (!supabaseAdmin) throw new Error('Supabase not configured');

    // 1. Get Wallet ID
    const wallet = await getWallet(providerId);
    if (!wallet) throw new Error('Wallet not found for debit');

    // 2. Insert Transaction
    // Trigger on DB will auto-update balance
    const { data, error } = await supabaseAdmin
        .from('wallet_transactions')
        .insert([{
            wallet_id: wallet.id,
            amount: -Math.abs(amount), // Ensure negative
            type,
            order_id: orderId,
            description
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};
