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

    // Check if user already exists
    if (isSupabaseConfigured()) {
        let query = supabaseAdmin.from('users').select('id');
        if (contact.includes('@')) {
            query = query.eq('email', contact);
        } else {
            query = query.eq('phone', contact);
        }
        const { data: existingUser } = await query.maybeSingle();

        if (existingUser) {
            return res.status(400).json({ error: '该用户已注册，无法重复邀请' });
        }
    }

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

        // 3. Assemble Result (Optimized with Parallel Execution)
        const result = await Promise.all(salesUsers.map(async (user) => {
            // Get provider count
            const { count } = await supabaseAdmin
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('referrer_id', user.id)
                .eq('role', 'provider');

            return {
                ...user,
                profile: profilesMap[user.id] || {}, // Use mapped profile
                provider_count: count || 0
            };
        }));

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

// ============ Standard Service Listing Applications ============

// GET /submissions/listing-applications - Get provider service listing applications
router.get('/submissions/listing-applications', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, size = 20, type } = req.query;
        const offset = (page - 1) * size;

        if (!isSupabaseConfigured()) {
            return res.json({ submissions: [], total: 0 });
        }

        // Fetch from provider_services table (new PC form submissions)
        const { data: providerServices, error: psError, count: psCount } = await supabaseAdmin
            .from('provider_services')
            .select(`
                *,
                provider:users!provider_services_provider_id_fkey (id, name, email)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + size - 1);

        if (psError) {
            console.error('Fetch provider_services error:', psError);
            // Table might not exist yet, fallback to empty
        }

        // Transform provider_services to match expected format
        const fromProviderServices = (providerServices || []).map(ps => ({
            id: ps.id,
            created_at: ps.created_at,
            listing_status: ps.status, // Map status to listing_status
            category: ps.category,
            template_name: ps.title, // Use title as template_name
            form_data: {
                type: 'standard_service_listing',
                title: ps.title,
                description: ps.description,
                unit: ps.price_unit,
                price: ps.price,
                service_mode: ps.service_mode,
                deposit_ratio: ps.deposit_ratio
            },
            user: ps.provider,
            provider: { company_name: ps.provider?.name },
            source: 'provider_services' // Mark source for approval logic
        }));

        // Also fetch from submissions table (legacy / H5 form submissions)
        let legacySubmissions = [];
        try {
            const { data: legacyData, error: legacyError } = await supabaseAdmin
                .from('submissions')
                .select(`
                    *,
                    users!submissions_provider_id_fkey (id, name, email),
                    provider_profiles!inner (company_name)
                `)
                .eq('submission_type', 'provider_listing')
                .order('created_at', { ascending: false })
                .range(offset, offset + size - 1);

            if (!legacyError && legacyData) {
                legacySubmissions = legacyData.map(s => ({
                    ...s,
                    user: s.users,
                    provider: s.provider_profiles,
                    source: 'submissions'
                }));
            }
        } catch (e) {
            console.error('Legacy submissions fetch error:', e);
        }

        // Combine and sort by created_at
        const allSubmissions = [...fromProviderServices, ...legacySubmissions]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, size);

        const total = (psCount || 0) + legacySubmissions.length;

        res.json({ submissions: allSubmissions, total });
    } catch (e) {
        console.error('Fetch listing applications error:', e);
        res.status(500).json({ error: e.message });
    }
});

// POST /submissions/:id/approve-listing - Approve a provider listing
router.post('/submissions/:id/approve-listing', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { source } = req.body; // 'provider_services' or 'submissions'

        if (!isSupabaseConfigured()) {
            return res.status(400).json({ error: 'Database not configured' });
        }

        // Try provider_services first if source indicates or by default
        if (source === 'provider_services' || !source) {
            const { error: psError, count } = await supabaseAdmin
                .from('provider_services')
                .update({
                    status: 'approved',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select('id', { count: 'exact', head: true });

            if (!psError && count > 0) {
                return res.json({ message: '已通过审批' });
            }
        }

        // Fallback to submissions table
        const { error } = await supabaseAdmin
            .from('submissions')
            .update({
                listing_status: 'approved',
                reviewed_by: req.user.id,
                reviewed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        res.json({ message: '已通过审批' });
    } catch (e) {
        console.error('Approve listing error:', e);
        res.status(500).json({ error: e.message });
    }
});

// POST /submissions/:id/reject-listing - Reject a provider listing
router.post('/submissions/:id/reject-listing', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, source } = req.body;

        if (!isSupabaseConfigured()) {
            return res.status(400).json({ error: 'Database not configured' });
        }

        // Try provider_services first if source indicates or by default
        if (source === 'provider_services' || !source) {
            const { error: psError, count } = await supabaseAdmin
                .from('provider_services')
                .update({
                    status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select('id', { count: 'exact', head: true });

            if (!psError && count > 0) {
                return res.json({ message: '已拒绝' });
            }
        }

        // Fallback to submissions table
        const { error } = await supabaseAdmin
            .from('submissions')
            .update({
                listing_status: 'rejected',
                rejection_reason: reason || '',
                reviewed_by: req.user.id,
                reviewed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        res.json({ message: '已拒绝' });
    } catch (e) {
        console.error('Reject listing error:', e);
        res.status(500).json({ error: e.message });
    }
});

// GET /submissions/standard-orders - Get standard service orders
router.get('/submissions/standard-orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, size = 20, status, keyword } = req.query;
        const offset = (page - 1) * size;

        if (!isSupabaseConfigured()) {
            return res.json({ orders: [], total: 0 });
        }

        let query = supabaseAdmin
            .from('submissions')
            .select(`
                *,
                users!submissions_user_id_fkey (id, name, email, phone),
                provider:users!submissions_assigned_provider_id_fkey (id, name, email)
            `, { count: 'exact' })
            .neq('submission_type', 'provider_listing') // Regular orders, not listings
            .order('created_at', { ascending: false })
            .range(offset, offset + size - 1);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Fetch orders error, trying fallback:', error);
            // Fallback without joins
            let fallbackQuery = supabaseAdmin
                .from('submissions')
                .select('*', { count: 'exact' })
                .neq('submission_type', 'provider_listing')
                .order('created_at', { ascending: false })
                .range(offset, offset + size - 1);

            if (status) {
                fallbackQuery = fallbackQuery.eq('status', status);
            }

            const { data: fallbackData, error: fallbackError, count: fallbackCount } = await fallbackQuery;
            if (fallbackError) throw fallbackError;

            return res.json({ orders: fallbackData || [], total: fallbackCount || 0 });
        }

        // Transform
        const orders = (data || []).map(s => ({
            ...s,
            user: s.users,
            service_name: s.form_data?.service_name || s.service_category || '未知服务'
        }));

        res.json({ orders, total: count || 0 });
    } catch (e) {
        console.error('Fetch standard orders error:', e);
        res.status(500).json({ error: e.message });
    }
});

export default router;

