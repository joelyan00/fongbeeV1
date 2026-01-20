import express from 'express';
import os from 'os';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendProviderInvitation, sendUserInvitation } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';

const router = express.Router();

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
};

// GET /api/sales/profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        if (!isSupabaseConfigured()) {
            return res.json({
                profile: {
                    user_id: userId,
                    referral_code: 'MOCKCODE',
                    commission_rate: 0.10,
                    total_earnings: 1250.00,
                    current_balance: 250.00,
                    status: 'active',
                    bonus_enabled: false // Mock data
                }
            });
        }

        const { data: profile, error } = await supabaseAdmin
            .from('sales_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: 'Sales profile not found' });
            throw error;
        }

        res.json({ profile });
    } catch (error) {
        console.error('Get sales profile error:', error);
        res.status(500).json({ error: 'Failed to fetch sales profile' });
    }
});

// PUT /api/sales/settings
// Update sales profile settings (e.g., bonus strategy)
router.put('/settings', authenticateToken, async (req, res) => {
    try {
        const { bonus_enabled } = req.body;
        const userId = req.user.id;

        if (!isSupabaseConfigured()) {
            // Mock success
            return res.json({ success: true, message: 'Settings updated' });
        }

        const { error } = await supabaseAdmin
            .from('sales_profiles')
            .update({ bonus_enabled })
            .eq('user_id', userId);

        if (error) throw error;

        res.json({ success: true, message: '推广策略已更新' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: '更新失败' });
    }
});

// GET /api/sales/commissions
// Get commission logs
router.get('/commissions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // In real backend, we'd query sales_profiles to get sales_id (or store user_id in logs directly?)
        // The schema logs has `sales_id`. Is that user_id or sales_profile.id?
        // Let's assume sales_id in commission_logs refers to users(id) based on FK definition: sales_id UUID REFERENCES users(id).

        if (!isSupabaseConfigured()) {
            // Mock
            return res.json({
                logs: [
                    { id: '1', order_amount: 100, commission_amount: 10, status: 'paid', created_at: new Date().toISOString() },
                    { id: '2', order_amount: 200, commission_amount: 20, status: 'pending', created_at: new Date().toISOString() }
                ]
            });
        }

        const { data: logs, error } = await supabaseAdmin
            .from('commission_logs')
            .select('*')
            .eq('sales_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ logs });

    } catch (error) {
        console.error('Get commissions error:', error);
        res.status(500).json({ error: 'Failed to fetch commissions' });
    }
});

// POST /api/sales/invite
// Send email/sms to invite provider or user with referral code
router.post('/invite', authenticateToken, async (req, res) => {
    try {
        const { contact, role } = req.body; // role: 'provider' | 'user'
        const userId = req.user.id;
        const userName = req.user.name;

        if (!contact) return res.status(400).json({ error: '请提供联系方式（邮箱或电话）' });

        // Check if user already exists
        if (isSupabaseConfigured()) {
            let query = supabaseAdmin.from('users').select('id, referrer_id');
            if (contact.includes('@')) {
                query = query.eq('email', contact);
            } else {
                query = query.eq('phone', contact);
            }
            const { data: existingUser } = await query.maybeSingle();

            if (existingUser) {
                if (existingUser.referrer_id) {
                    return res.status(400).json({ error: '该用户已注册并绑定了销售合伙人，无法重复邀请' });
                } else {
                    return res.status(400).json({ error: '该用户已注册，无法发送注册邀请' });
                }
            }
        }

        // Get Referral Code
        let referralCode = 'MOCKCODE';
        if (isSupabaseConfigured()) {
            const { data: profile } = await supabaseAdmin
                .from('sales_profiles')
                .select('referral_code')
                .eq('user_id', userId)
                .single();
            if (profile) referralCode = profile.referral_code;
        }

        // Determine Frontend URL (Dynamic)
        let frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0] : null;
        if (!frontendUrl) {
            const ip = getLocalIp();
            frontendUrl = `http://${ip}:5173`;
        }

        let inviteLink;
        if (role === 'user') {
            // Invite User -> Register Page
            inviteLink = `${frontendUrl}/?register=user&ref=${referralCode}&contact=${encodeURIComponent(contact)}`;
        } else {
            // Invite Provider -> Provider Apply Page
            inviteLink = `${frontendUrl}/provider-apply?ref=${referralCode}&contact=${encodeURIComponent(contact)}`;
        }

        if (contact.includes('@')) {
            if (role === 'user') {
                // Lazy import or assume it's available? 
                // I need to add sendUserInvitation to imports first.
                // For now, I will use sendProviderInvitation but ideally I should use sendUserInvitation.
                // Let's assume I will add it to imports in next step or use dynamic import?
                // ES modules don't support dynamic import easily inside function without async.
                // I will stick to updating imports later.
                // Use sendProviderInvitation for now, but I will fix it.
                // ACTUALLY, I will use a conditional string in the email function if I can't add new function easily?
                // No, I should do it right.
                // I will reference `sendUserInvitation` here, and ensure it is imported.
                await sendUserInvitation(contact, inviteLink, userName);
            } else {
                await sendProviderInvitation(contact, inviteLink, userName);
            }
        } else {
            // SMS
            const title = role === 'user' ? '注册优服佳' : '入驻优服佳服务商平台';
            const message = `【优服佳】${userName} 诚邀您${title}！链接：${inviteLink}`;
            await sendSMS(contact, message);
        }

        res.json({ success: true, message: contact.includes('@') ? '邮件已发送' : '短信已发送' });

    } catch (error) {
        console.error('Invite error:', error);
        res.status(500).json({ error: '发送邀请失败' });
    }
});

// GET /api/sales/my-providers
// Get providers invited by this sales partner
router.get('/my-providers', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        if (!isSupabaseConfigured()) {
            return res.json({
                providers: [
                    { id: 'p1', name: 'James Plumber', email: 'james@test.com', phone: '1234567890', status: 'active', created_at: '2023-01-01' },
                    { id: 'p2', name: 'Anna Cleaner', email: 'anna@test.com', phone: '0987654321', status: 'complaint', created_at: '2023-02-01' }
                ]
            });
        }

        const { data: providers, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, phone, status, created_at')
            .eq('referrer_id', userId)
            .eq('role', 'provider')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ providers });
    } catch (error) {
        console.error('Get my-providers error:', error);
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
});

// POST /api/sales/withdraw
// Apply for withdrawal
router.post('/withdraw', authenticateToken, async (req, res) => {
    try {
        const { amount, method, account } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        if (!isSupabaseConfigured()) {
            return res.json({ success: true, message: 'Withdrawal request submitted (Mock)' });
        }

        // Check balance (Optional strict check)
        const { data: profile } = await supabaseAdmin.from('sales_profiles').select('current_balance').eq('user_id', userId).single();
        if (profile && profile.current_balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        const { error } = await supabaseAdmin.from('withdrawal_requests').insert({
            user_id: userId,
            amount,
            notes: `Method: ${method}, Account: ${account}`,
            status: 'pending'
        });

        if (error) throw error;

        // Optimistically deduct balance? Or wait for admin approval?
        // Usually wait. But user might want to see it deducted.
        // Let's keep it simple: just request.

        res.json({ success: true, message: '提现申请已提交，等待审核' });

    } catch (error) {
        console.error('Withdraw error:', error);
        res.status(500).json({ error: '提现申请失败' });
    }
});

// GET /api/sales/tickets
// Get tickets related to my providers
router.get('/tickets', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        if (!isSupabaseConfigured()) {
            return res.json({
                tickets: [
                    { id: 't1', subject: 'Customer Complaint', description: 'Late arrival', status: 'open', created_at: '2023-05-01', provider_name: 'James Plumber' },
                    { id: 't2', subject: 'Tech Issue', description: 'App crashed', status: 'resolved', created_at: '2023-05-02', provider_name: 'Anna Cleaner' }
                ]
            });
        }

        // 1. Get My Providers
        const { data: providers } = await supabaseAdmin.from('users').select('id').eq('referrer_id', userId).eq('role', 'provider');
        if (!providers || providers.length === 0) return res.json({ tickets: [] });

        const providerIds = providers.map(p => p.id);

        // 2. Get Tickets
        const { data: tickets, error } = await supabaseAdmin
            .from('support_tickets')
            .select('*, users(name)') // Join to get Provider Name? users(name) if foreign key exists. 
            // Postgres join syntax in Supabase: .select('*, users!user_id(name)')
            .in('user_id', providerIds)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to flat structure
        const formattedTickets = tickets.map(t => ({
            ...t,
            provider_name: t.users?.name || 'Unknown'
        }));

        res.json({ tickets: formattedTickets });

    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

export default router;
