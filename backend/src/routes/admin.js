import express from 'express';
import os from 'os';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getStripe } from '../services/stripeService.js';
import { sendSalesInvitation } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';

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



// Helper to get local IP
const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// POST /invite-sales
router.post('/invite-sales', authenticateToken, requireAdmin, async (req, res) => {
    const { contact } = req.body; // email or phone
    if (!contact) return res.status(400).json({ error: 'Contact info required' });

    // In a real system, we might generate a unique token and store it in 'invitations' table.
    // For MVP, we'll use a generic invite parameter.
    // The frontend Register page will look for ?role_invite=sales

    // We can sign a token to ensure it's valid if we want security, 
    // but user requirement is just "hide checks unless invited".

    // Basic implementation: Return the link.
    // If backend knows frontend URL:
    // Determine URL
    let frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0] : null;

    if (!frontendUrl) {
        const ip = getLocalIp();
        frontendUrl = `http://${ip}:5173`;
    }

    // We can create a simple token "sales_invite_TIMESTAMP"
    const inviteLink = `${frontendUrl}/register?role_invite=sales&contact=${encodeURIComponent(contact)}`;

    try {
        if (contact.includes('@')) {
            await sendSalesInvitation(contact, inviteLink);
        } else {
            // Assume phone
            const message = `【优服佳】诚邀您成为销售合伙人！注册链接：${inviteLink}`;
            await sendSMS(contact, message);
        }

        res.json({
            message: contact.includes('@') ? 'Invitation sent via Email' : 'Invitation sent via SMS',
            link: inviteLink
        });
    } catch (e) {
        console.error('Invite send error:', e);
        // Return link anyway so admin can copy it
        res.status(500).json({ error: 'Failed to send message, but link generated', link: inviteLink });
    }
});

// ============ Sales Partner Management ============

// GET /sales-partners
router.get('/sales-partners', authenticateToken, requireAdmin, async (req, res) => {
    try {
        if (!isSupabaseConfigured()) {
            return res.json({ partners: [] });
        }

        // 1. Get List of Sales Users (No Join)
        const { data: salesUsers, error } = await supabaseAdmin
            .from('users')
            .select('id, email, name, phone, created_at')
            .eq('role', 'sales')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!salesUsers || salesUsers.length === 0) {
            return res.json({ partners: [] });
        }

        // 2. Fetch Profiles Separately
        const userIds = salesUsers.map(u => u.id);
        const { data: profiles } = await supabaseAdmin
            .from('sales_profiles')
            .select('*')
            .in('user_id', userIds);

        const profilesMap = {};
        (profiles || []).forEach(p => profilesMap[p.user_id] = p);

        // 3. Assemble Result
        const result = [];
        for (const user of salesUsers) {
            // Get provider count
            const { count } = await supabaseAdmin
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('referrer_id', user.id)
                .eq('role', 'provider');

            result.push({
                ...user,
                profile: profilesMap[user.id] || {}, // Use mapped profile
                provider_count: count || 0
            });
        }

        res.json({ partners: result });
    } catch (e) {
        console.error('Fetch sales partners error:', e);
        res.status(500).json({ error: e.message });
    }
});

// GET /sales-partners/:id
router.get('/sales-partners/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!isSupabaseConfigured()) {
            return res.status(404).json({ error: 'Database not connected' });
        }

        // 1. Basic Info
        // 1. Basic Info (Explicit Fetch)
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, name, phone, created_at, role')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Auto-generate profile if missing (Legacy support)
        // Fetch Profile Separately
        const { data: profile } = await supabaseAdmin
            .from('sales_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        // Attach profile
        user.sales_profiles = profile ? [profile] : [];

        // Auto-generate profile if strictly missing
        if (!profile) {
            try {
                const code = Math.random().toString(36).substring(2, 10).toUpperCase();
                const { data: newProfile, error: createError } = await supabaseAdmin
                    .from('sales_profiles')
                    .insert({ user_id: user.id, referral_code: code })
                    .select()
                    .single();

                if (!createError && newProfile) {
                    user.sales_profiles = [newProfile];
                }
            } catch (err) {
                console.error('Failed to auto-create sales profile:', err);
            }
        }

        // 2. Get Invited Providers
        const { data: providers, error: pError } = await supabaseAdmin
            .from('users')
            .select('id, name, email, phone, created_at, provider_profiles(service_city, business_scope)')
            .eq('referrer_id', id)
            .eq('role', 'provider');

        if (pError) throw pError;

        // 3. Get Revenue Stats per Provider
        const { data: logs } = await supabaseAdmin
            .from('commission_logs')
            .select('provider_id, commission_amount, order_amount')
            .eq('sales_id', id);

        // Map logs to providers
        const providersWithStats = providers ? providers.map(p => {
            const providerLogs = logs?.filter(l => l.provider_id === p.id) || [];
            const contribution = providerLogs.reduce((sum, l) => sum + (Number(l.commission_amount) || 0), 0);
            const totalRevenue = providerLogs.reduce((sum, l) => sum + (Number(l.order_amount) || 0), 0);

            return {
                ...p,
                profile: p.provider_profiles?.[0] || {},
                stats: {
                    contribution: contribution,
                    total_sales: totalRevenue,
                    order_count: providerLogs.length
                }
            };
        }) : [];

        res.json({
            partner: {
                ...user,
                profile: user.sales_profiles?.[0] || {},
            },
            providers: providersWithStats
        });

    } catch (e) {
        console.error('Fetch sales detail error:', e);
        res.status(500).json({ error: e.message });
    }
});

export default router;
