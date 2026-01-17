import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret';

import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// Verify JWT token middleware
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;

        // Asynchronously update last active timestamp to avoid blocking the response
        if (isSupabaseConfigured()) {
            supabaseAdmin
                .from('users')
                .update({ last_active_at: new Date().toISOString() })
                .eq('id', user.id)
                .then(() => { })
                .catch(err => console.error('Failed to update last_active_at:', err));
        }

        next();
    });
};

// Check if user is admin
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Generate JWT token
export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role || 'user',
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};
