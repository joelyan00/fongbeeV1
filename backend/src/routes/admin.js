import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getStripe } from '../services/stripeService.js';

const router = express.Router();

// GET /finance/summary
router.get('/finance/summary', authenticateToken, requireAdmin, async (req, res) => {
    try {
        let stripeBalance = 0;
        let escrowBalance = 0;
        let platformRevenue = 0;

        // 1. Stripe Balance
        const stripe = getStripe();
        if (stripe) {
            try {
                const bal = await stripe.balance.retrieve();
                stripeBalance = ((bal.available[0]?.amount || 0) + (bal.pending[0]?.amount || 0)) / 100;
            } catch (e) {
                console.error('Stripe balance error', e.message);
            }
        }

        if (isSupabaseConfigured()) {
            // 2. Escrow (Provider Wallets)
            const { data: providers } = await supabaseAdmin
                .from('users')
                .select('wallet_balance')
                .eq('role', 'provider');

            if (providers) {
                escrowBalance += providers.reduce((sum, p) => sum + (Number(p.wallet_balance) || 0), 0);
            }

            // 3. Held Deposits (Orders paid but not released to provider)
            // 'in_progress' means user paid deposit, provider hasn't 'confirm-start' yet.
            const { data: held } = await supabaseAdmin
                .from('submissions')
                .select('deposit_price')
                .eq('deposit_status', 'paid')
                .eq('status', 'in_progress');

            if (held) {
                escrowBalance += held.reduce((sum, s) => sum + (Number(s.deposit_price) || 0), 0);
            }

            // 4. Platform Revenue
            // For now, we mock this as we don't have a specific `platform_ledger` table.
            // In a real app, you would query `transactions` where type = 'credit_sale_revenue'.
            platformRevenue = 1500.00;
        }

        res.json({
            stripe_balance: stripeBalance,
            escrow_balance: escrowBalance,
            platform_revenue: platformRevenue
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// POST /finance/bank-account (Mock)
router.post('/finance/bank-account', authenticateToken, requireAdmin, (req, res) => {
    // In production, this would use Stripe Connect Payout API or store bank details secure encrypted.
    res.json({ message: 'Bank account configuration updated' });
});

// System Settings
router.get('/system/settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        if (!isSupabaseConfigured()) return res.json({ platform_fee_percent: 10 });

        const { data, error } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'platform_fee_percent')
            .single();

        if (error || !data) {
            return res.json({ platform_fee_percent: 10 });
        }

        res.json({ platform_fee_percent: Number(data.value) });
    } catch (e) {
        console.error('Fetch settings error:', e);
        // Default to 10 if error (e.g. table missing)
        res.json({ platform_fee_percent: 10 });
    }
});

router.post('/system/settings', authenticateToken, requireAdmin, async (req, res) => {
    const { platform_fee_percent } = req.body;
    try {
        if (!isSupabaseConfigured()) return res.json({ message: 'Saved (Mock)' });

        // Upsert
        const { error } = await supabaseAdmin
            .from('system_settings')
            .upsert({
                key: 'platform_fee_percent',
                value: String(platform_fee_percent),
                description: 'Service fee percentage'
            });

        if (error) {
            console.error('Update settings error:', error);
            // If table missing, we can't persist.
            return res.status(500).json({ error: 'Failed to save settings. Please ensure database migration is run.' });
        }

        res.json({ message: 'Settings updated' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
