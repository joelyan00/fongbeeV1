/**
 * Session Service
 * Manages user login sessions for device limiting
 * Max 3 active devices per user - kicks oldest on new login
 */

import crypto from 'crypto';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const MAX_SESSIONS_PER_USER = 3;

// In-memory mock storage for development
const mockSessions = [];

/**
 * Parse User-Agent to get a friendly device name
 */
export function parseDeviceName(userAgent) {
    if (!userAgent) return '未知设备';

    // Detect OS
    let os = '未知系统';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS') || userAgent.includes('Macintosh')) os = 'Mac';
    else if (userAgent.includes('iPhone')) os = 'iPhone';
    else if (userAgent.includes('iPad')) os = 'iPad';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('Linux')) os = 'Linux';

    // Detect Browser
    let browser = '';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) browser = 'Chrome';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('MicroMessenger')) browser = '微信';

    return browser ? `${os} ${browser}` : os;
}

/**
 * Hash a token for secure storage
 */
export function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a new session for user
 * If user has >= 3 sessions, revokes the oldest one
 */
export async function createSession(userId, token, req) {
    const tokenHash = hashToken(token);
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection?.remoteAddress || '';
    const deviceName = parseDeviceName(userAgent);

    if (isSupabaseConfigured()) {
        // Get current active sessions
        const { data: existingSessions } = await supabaseAdmin
            .from('user_sessions')
            .select('id, created_at')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: true });

        // If at limit, revoke oldest session(s)
        if (existingSessions && existingSessions.length >= MAX_SESSIONS_PER_USER) {
            const sessionsToRevoke = existingSessions.slice(0, existingSessions.length - MAX_SESSIONS_PER_USER + 1);

            for (const session of sessionsToRevoke) {
                await supabaseAdmin
                    .from('user_sessions')
                    .update({
                        is_active: false,
                        revoked_at: new Date().toISOString(),
                        revoked_reason: 'device_limit'
                    })
                    .eq('id', session.id);
            }

            console.log(`🔐 Revoked ${sessionsToRevoke.length} old session(s) for user ${userId} due to device limit`);
        }

        // Create new session
        const { data: newSession, error } = await supabaseAdmin
            .from('user_sessions')
            .insert({
                user_id: userId,
                token_hash: tokenHash,
                device_info: userAgent,
                device_name: deviceName,
                ip_address: ipAddress,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to create session:', error);
            // Don't throw - session tracking is not critical for login
        }

        return newSession;
    } else {
        // Mock implementation
        const mockSession = {
            id: crypto.randomUUID(),
            user_id: userId,
            token_hash: tokenHash,
            device_info: userAgent,
            device_name: deviceName,
            ip_address: ipAddress,
            created_at: new Date().toISOString(),
            last_active_at: new Date().toISOString(),
            is_active: true
        };

        // Check existing mock sessions
        const userSessions = mockSessions.filter(s => s.user_id === userId && s.is_active);
        if (userSessions.length >= MAX_SESSIONS_PER_USER) {
            // Revoke oldest
            const oldest = userSessions[0];
            oldest.is_active = false;
            oldest.revoked_at = new Date().toISOString();
            oldest.revoked_reason = 'device_limit';
            console.log(`🔐 [Mock] Revoked old session for user ${userId}`);
        }

        mockSessions.push(mockSession);
        return mockSession;
    }
}

/**
 * Validate if a session is still active
 */
export async function validateSession(token) {
    const tokenHash = hashToken(token);

    if (isSupabaseConfigured()) {
        const { data } = await supabaseAdmin
            .from('user_sessions')
            .select('*')
            .eq('token_hash', tokenHash)
            .eq('is_active', true)
            .single();

        if (data) {
            // Update last_active_at
            await supabaseAdmin
                .from('user_sessions')
                .update({ last_active_at: new Date().toISOString() })
                .eq('id', data.id);
        }

        return data;
    } else {
        const session = mockSessions.find(s => s.token_hash === tokenHash && s.is_active);
        if (session) {
            session.last_active_at = new Date().toISOString();
        }
        return session;
    }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId) {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabaseAdmin
            .from('user_sessions')
            .select('id, device_name, ip_address, created_at, last_active_at')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('last_active_at', { ascending: false });

        if (error) {
            console.error('Failed to get sessions:', error);
            return [];
        }

        return data || [];
    } else {
        return mockSessions
            .filter(s => s.user_id === userId && s.is_active)
            .map(({ id, device_name, ip_address, created_at, last_active_at }) => ({
                id, device_name, ip_address, created_at, last_active_at
            }));
    }
}

/**
 * Revoke a specific session (manual logout from device)
 */
export async function revokeSession(sessionId, userId) {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabaseAdmin
            .from('user_sessions')
            .update({
                is_active: false,
                revoked_at: new Date().toISOString(),
                revoked_reason: 'manual'
            })
            .eq('id', sessionId)
            .eq('user_id', userId) // Security: only owner can revoke
            .select()
            .single();

        return { success: !error, data };
    } else {
        const session = mockSessions.find(s => s.id === sessionId && s.user_id === userId);
        if (session) {
            session.is_active = false;
            session.revoked_at = new Date().toISOString();
            session.revoked_reason = 'manual';
            return { success: true, data: session };
        }
        return { success: false };
    }
}

/**
 * Revoke all sessions for a user (e.g., after password change)
 */
export async function revokeAllSessions(userId, exceptTokenHash = null) {
    if (isSupabaseConfigured()) {
        let query = supabaseAdmin
            .from('user_sessions')
            .update({
                is_active: false,
                revoked_at: new Date().toISOString(),
                revoked_reason: 'password_change'
            })
            .eq('user_id', userId)
            .eq('is_active', true);

        if (exceptTokenHash) {
            query = query.neq('token_hash', exceptTokenHash);
        }

        const { error } = await query;
        return !error;
    } else {
        mockSessions
            .filter(s => s.user_id === userId && s.is_active && s.token_hash !== exceptTokenHash)
            .forEach(s => {
                s.is_active = false;
                s.revoked_at = new Date().toISOString();
                s.revoked_reason = 'password_change';
            });
        return true;
    }
}

/**
 * Revoke session by token (for logout)
 */
export async function revokeSessionByToken(token) {
    const tokenHash = hashToken(token);

    if (isSupabaseConfigured()) {
        const { error } = await supabaseAdmin
            .from('user_sessions')
            .update({
                is_active: false,
                revoked_at: new Date().toISOString(),
                revoked_reason: 'logout'
            })
            .eq('token_hash', tokenHash);

        return !error;
    } else {
        const session = mockSessions.find(s => s.token_hash === tokenHash);
        if (session) {
            session.is_active = false;
            session.revoked_at = new Date().toISOString();
            session.revoked_reason = 'logout';
        }
        return true;
    }
}
