import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

// Generate HMAC signature for link protection
const generateSignature = (token, phone, inviteRef) => {
    const secret = process.env.REFERRAL_SECRET || 'default-referral-secret-key';
    return crypto.createHmac('sha256', secret)
        .update(`${token}${phone}${inviteRef}`)
        .digest('hex');
};

// POST /api/referral/shorten - Create a short link
router.post('/shorten', async (req, res) => {
    try {
        const { phone, inviteRef, expiresDays = 7 } = req.body;

        if (!phone || !inviteRef) {
            return res.status(400).json({ error: 'Phone and inviteRef are required' });
        }

        const token = uuidv4().substring(0, 8); // Short token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresDays);

        const signature = generateSignature(token, phone, inviteRef);

        if (isSupabaseConfigured()) {
            const { error } = await supabaseAdmin.from('referral_links').insert({
                token,
                phone,
                invite_ref: inviteRef,
                expires_at: expiresAt,
                signature
            });

            if (error) throw error;
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const shortUrl = `${frontendUrl}/#/?r=${token}`;

        res.json({ shortUrl, token, expiresAt });
    } catch (error) {
        console.error('Shorten referral link error:', error);
        res.status(500).json({ error: 'Failed to create short link' });
    }
});

// GET /api/referral/resolve/:token - Resolve a short link token
router.get('/resolve/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('referral_links')
                .select('*')
                .eq('token', token)
                .maybeSingle();

            if (error) throw error;
            if (!data) return res.status(404).json({ error: 'Link not found' });

            if (new Date() > new Date(data.expires_at)) {
                return res.status(410).json({ error: 'Link expired' });
            }

            if (data.used_at) {
                return res.status(410).json({ error: 'Link already used' });
            }

            // Verify signature
            const expectedSignature = generateSignature(token, data.phone, data.invite_ref);
            if (expectedSignature !== data.signature) {
                return res.status(400).json({ error: 'Invalid link signature' });
            }

            res.json({
                phone: data.phone,
                inviteRef: data.invite_ref
            });
        } else {
            res.status(501).json({ error: 'Supabase not configured' });
        }
    } catch (error) {
        console.error('Resolve referral link error:', error);
        res.status(500).json({ error: 'Failed to resolve link' });
    }
});

// POST /api/referral/consume/:token - Mark link as used
router.post('/consume/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (isSupabaseConfigured()) {
            const { error } = await supabaseAdmin
                .from('referral_links')
                .update({ used_at: new Date().toISOString() })
                .eq('token', token);

            if (error) throw error;
            res.json({ success: true });
        } else {
            res.status(501).json({ error: 'Supabase not configured' });
        }
    } catch (error) {
        console.error('Consume referral link error:', error);
        res.status(500).json({ error: 'Failed to consume link' });
    }
});

export default router;
