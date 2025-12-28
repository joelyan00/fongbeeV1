import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

let mockAddresses = [
    {
        id: 'addr_mock_1',
        user_id: 'mock_user_1',
        name: 'Joel Test',
        phone: '1234567890',
        address_line1: '123 Main St',
        city: 'Toronto',
        state: 'ON',
        postal_code: 'M5V 2H1',
        country: 'Canada',
        is_default: true
    }
];

// GET /api/addresses
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('user_addresses')
                .select('*')
                .eq('user_id', req.user.id)
                .order('is_default', { ascending: false });

            if (error) throw error;
            res.json({ addresses: data });
        } else {
            const userAddresses = mockAddresses.filter(a => a.user_id === req.user.id);
            res.json({ addresses: userAddresses });
        }
    } catch (e) {
        console.error('Get addresses error:', e);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
});

// POST /api/addresses
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, phone, address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;

        if (isSupabaseConfigured()) {
            if (is_default) {
                await supabaseAdmin
                    .from('user_addresses')
                    .update({ is_default: false })
                    .eq('user_id', req.user.id);
            }

            const { data, error } = await supabaseAdmin
                .from('user_addresses')
                .insert({
                    user_id: req.user.id,
                    name, phone, address_line1, address_line2, city, state, postal_code,
                    country: country || 'Canada',
                    is_default: is_default || false
                })
                .select()
                .single();

            if (error) throw error;
            res.json({ address: data });
        } else {
            const newAddr = {
                id: `addr_${Date.now()}`,
                user_id: req.user.id,
                name, phone, address_line1, address_line2, city, state, postal_code,
                country: country || 'Canada',
                is_default: is_default || false
            };
            if (is_default) {
                mockAddresses.forEach(a => { if (a.user_id === req.user.id) a.is_default = false; });
            }
            mockAddresses.push(newAddr);
            res.json({ address: newAddr });
        }
    } catch (e) {
        console.error('Create address error:', e);
        res.status(500).json({ error: 'Failed to create address' });
    }
});

// PUT /api/addresses/:id
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        delete updates.id;
        delete updates.user_id;
        delete updates.created_at;

        if (isSupabaseConfigured()) {
            if (updates.is_default) {
                await supabaseAdmin.from('user_addresses').update({ is_default: false }).eq('user_id', req.user.id);
            }
            const { data, error } = await supabaseAdmin
                .from('user_addresses')
                .update(updates)
                .eq('id', id)
                .eq('user_id', req.user.id)
                .select().single();
            if (error) throw error;
            res.json({ address: data });
        } else {
            const idx = mockAddresses.findIndex(a => a.id === id && a.user_id === req.user.id);
            if (idx === -1) return res.status(404).json({ error: 'Address not found' });

            if (updates.is_default) {
                mockAddresses.forEach(a => { if (a.user_id === req.user.id) a.is_default = false; });
            }
            mockAddresses[idx] = { ...mockAddresses[idx], ...updates };
            res.json({ address: mockAddresses[idx] });
        }
    } catch (e) {
        console.error('Update address error:', e);
        res.status(500).json({ error: 'Update failed' });
    }
});

// DELETE /api/addresses/:id
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (isSupabaseConfigured()) {
            await supabaseAdmin.from('user_addresses').delete().eq('id', id).eq('user_id', req.user.id);
        } else {
            mockAddresses = mockAddresses.filter(a => !(a.id === id && a.user_id === req.user.id));
        }
        res.json({ success: true });
    } catch (e) {
        console.error('Delete address error:', e);
        res.status(500).json({ error: 'Delete failed' });
    }
});

export default router;
