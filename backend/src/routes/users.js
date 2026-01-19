import express from 'express';
import bcrypt from 'bcryptjs';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { mockUsers } from './auth.js';

const router = express.Router();

// GET /api/users - 获取所有用户 (管理员)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, size = 10, keyword, status, role } = req.query;
        const offset = (page - 1) * size;

        if (isSupabaseConfigured()) {
            let query = supabaseAdmin
                .from('users')
                .select('*', { count: 'exact' });

            if (keyword) {
                query = query.or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%,email.ilike.%${keyword}%`);
            }
            if (status) {
                query = query.eq('status', status);
            }
            if (role) {
                query = query.eq('role', role);
            }

            const { data: usersData, count, error } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + size - 1);

            if (error) throw error;

            // Manual join for provider profiles to avoid relation errors
            let users = usersData;
            if (users.length > 0) {
                const userIds = users.map(u => u.id);
                const { data: profiles, error: profileError } = await supabaseAdmin
                    .from('provider_profiles')
                    .select('user_id, service_categories')
                    .in('user_id', userIds);

                if (!profileError && profiles) {
                    const profileMap = {};
                    profiles.forEach(p => {
                        profileMap[p.user_id] = p;
                    });
                    users = users.map(u => ({
                        ...u,
                        provider_profiles: profileMap[u.id] || null
                    }));
                }
            }

            res.json({
                users: users,
                total: count,
                page: Number(page),
                size: Number(size)
            });
        } else {
            // Mock mode
            let users = mockUsers.filter(u => u.role !== 'admin'); // Don't show admin in list
            const { mockProviderProfiles } = await import('./providers.js');

            if (keyword) {
                const kw = keyword.toLowerCase();
                users = users.filter(u =>
                    u.name?.toLowerCase().includes(kw) ||
                    u.email?.toLowerCase().includes(kw) ||
                    u.phone?.includes(kw)
                );
            }
            if (status) {
                users = users.filter(u => u.status === status);
            }
            if (role) {
                users = users.filter(u => u.role === role);
            }

            const total = users.length;
            const paginatedUsers = users.slice(offset, offset + Number(size));

            res.json({
                users: paginatedUsers.map(u => {
                    const profile = mockProviderProfiles.find(p => p.user_id === u.id);
                    return {
                        id: u.id,
                        email: u.email,
                        name: u.name,
                        phone: u.phone,
                        role: u.role,
                        status: u.status,
                        created_at: u.created_at,
                        provider_profiles: profile ? { service_categories: profile.service_categories } : null
                    };
                }),
                total,
                page: Number(page),
                size: Number(size)
            });
        }
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: '获取用户列表失败' });
    }
});

// GET /api/users/stats - 获取用户统计 (管理员)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        if (isSupabaseConfigured()) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

            const { count: total } = await supabaseAdmin
                .from('users')
                .select('*', { count: 'exact', head: true });

            const { count: active } = await supabaseAdmin
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            const { count: todayNew } = await supabaseAdmin
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            const { count: monthNew } = await supabaseAdmin
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', monthStart.toISOString());

            res.json({ total, active, todayNew, monthNew });
        } else {
            // Mock stats
            const users = mockUsers.filter(u => u.role !== 'admin');
            res.json({
                total: users.length,
                active: users.filter(u => u.status === 'active').length,
                todayNew: 0,
                monthNew: users.length
            });
        }
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: '获取统计数据失败' });
    }
});

// PATCH /api/users/:id/role - 更新用户角色 (管理员)
router.patch('/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'provider', 'admin'].includes(role)) {
            return res.status(400).json({ error: '无效的角色值' });
        }

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('users')
                .update({ role })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            res.json({ message: '角色更新成功', user: data });
        } else {
            // Mock mode
            const user = mockUsers.find(u => u.id === id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }
            user.role = role;
            res.json({ message: '角色更新成功', user });
        }
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: '更新角色失败' });
    }
});

// PATCH /api/users/:id/status - 更新用户状态 (管理员)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'disabled'].includes(status)) {
            return res.status(400).json({ error: '无效的状态值' });
        }

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('users')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            res.json({ message: '状态更新成功', user: data });
        } else {
            // Mock mode
            const user = mockUsers.find(u => u.id === id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }
            user.status = status;
            res.json({ message: '状态更新成功', user });
        }
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: '更新状态失败' });
    }
});

// POST /api/users/:id/reset-password - 重置用户密码 (管理员)
router.post('/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: '新密码长度至少需要6位' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('users')
                .update({ password: hashedPassword })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            res.json({ message: '密码重置成功' });
        } else {
            // Mock mode
            const user = mockUsers.find(u => u.id === id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }
            user.password = hashedPassword;
            res.json({ message: '密码重置成功' });
        }
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: '重置密码失败' });
    }
});

// GET /api/users/:id - 获取用户详情 (管理员)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured()) {
            // 1. Fetch User Base Info
            const { data: user, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !user) {
                return res.status(404).json({ error: '用户不存在' });
            }

            // 2. Fetch Provider Profile manually
            const { data: profile } = await supabaseAdmin
                .from('provider_profiles')
                .select('*')
                .eq('user_id', id)
                .single();

            // 3. Fetch recent submissions assigned to this provider (optional, for "recent orders")
            const { data: orders } = await supabaseAdmin
                .from('submissions')
                .select('id, created_at, status, template_id, user_email, form_data')
                .eq('assigned_provider_id', id)
                .order('created_at', { ascending: false })
                .limit(5);

            // 4. Fetch service type applications (e.g. for Airport Pickup documents)
            const { data: applications } = await supabaseAdmin
                .from('service_type_applications')
                .select('*')
                .eq('user_id', id);

            res.json({
                user: {
                    ...user,
                    provider_profile: profile || null,
                    recent_orders: orders || [],
                    applications: applications || []
                }
            });
        } else {
            // Mock mode
            const user = mockUsers.find(u => u.id === id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }

            const { mockProviderProfiles } = await import('./providers.js');
            const profile = mockProviderProfiles.find(p => p.user_id === id);

            res.json({
                user: {
                    ...user,
                    provider_profile: profile || null,
                    recent_orders: [] // Mock orders empty for now
                }
            });
        }
    } catch (error) {
        console.error('Get user detail error:', error);
        res.status(500).json({ error: '获取用户详情失败' });
    }
});

// GET /api/users/me/dashboard-stats
router.get('/me/dashboard-stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        if (isSupabaseConfigured()) {
            // Count Submissions (Orders)
            const { count: orders } = await supabaseAdmin
                .from('submissions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            // Count Reviews
            // Check if reviews table exists first? Assuming yes based on my task.
            // If it doesn't exist, this might throw, but loop will catch.
            let reviews = 0;
            try {
                const { count: r } = await supabaseAdmin
                    .from('reviews')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId);
                reviews = r || 0;
            } catch (ignore) { }

            res.json({
                stats: {
                    custom_orders: 0, // Placeholder if we don't separate types
                    orders: orders || 0,
                    cart: 0, // Cart is client side mostly
                    inbox: 0, // Notifications?
                    reviews: reviews
                }
            });
        } else {
            // Mock
            res.json({
                stats: {
                    custom_orders: 12,
                    orders: 5,
                    cart: 2,
                    inbox: 3,
                    reviews: 4
                }
            });
        }
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: '获取统计失败' });
    }
});

// GET /api/users/me/credits/history
router.get('/me/credits/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        if (isSupabaseConfigured()) {
            const { data } = await supabaseAdmin
                .from('credit_transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            res.json({ history: data || [] });
        } else {
            // Mock
            res.json({
                history: [
                    { id: '1', amount: 100, type: 'admin_gift', description: '新用户注册奖励', created_at: new Date().toISOString() },
                    { id: '2', amount: -20, type: 'purchase', description: '购买服务抵扣', created_at: new Date(Date.now() - 86400000).toISOString() }
                ]
            });
        }
    } catch (error) {
        console.error('Get credits history error:', error);
        res.status(500).json({ error: '获取积分记录失败' });
    }
});

// GET /api/users/me/reviews
router.get('/me/reviews', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'written' } = req.query; // 'written' or 'received'

        if (isSupabaseConfigured()) {
            if (type === 'received') {
                // Providers see reviews left for them
                const { data, error } = await supabaseAdmin
                    .from('order_reviews')
                    .select(`
                        *,
                        reply_content,
                        reply_at,
                        orders!inner(
                            order_no,
                            service_listing_id,
                            provider_services(name, images)
                        ),
                        users!order_reviews_user_id_fkey(name, avatar_url)
                    `)
                    .eq('provider_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                res.json({ reviews: data || [] });
            } else {
                // Users see reviews they wrote
                // 1. Fetch from order_reviews (new system) - simplified query without nested joins
                const { data: orderReviews, error: ore } = await supabaseAdmin
                    .from('order_reviews')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (ore) {
                    console.error('[Reviews] Query error:', ore);
                    throw ore;
                }

                console.log('[Reviews] Found order_reviews:', orderReviews?.length || 0);

                // Manually fetch order details for each review
                const formattedReviews = [];
                for (const r of (orderReviews || [])) {
                    let serviceName = '服务订单';
                    let serviceImage = '';

                    // Try to get order details
                    if (r.order_id) {
                        const { data: order } = await supabaseAdmin
                            .from('orders')
                            .select('order_no, service_name, service_listing_id')
                            .eq('id', r.order_id)
                            .single();

                        if (order) {
                            serviceName = order.service_name || '服务订单';

                            // Try to get service image if there's a listing
                            if (order.service_listing_id) {
                                const { data: service } = await supabaseAdmin
                                    .from('provider_services')
                                    .select('name, images')
                                    .eq('id', order.service_listing_id)
                                    .single();
                                if (service) {
                                    serviceName = service.name || serviceName;
                                    serviceImage = service.images?.[0] || '';
                                }
                            }
                        }
                    }

                    formattedReviews.push({
                        id: r.id,
                        serviceName,
                        serviceImage,
                        date: r.created_at?.split('T')[0] || '',
                        rating: r.rating_overall,
                        content: r.comment,
                        images: r.photos || []
                    });
                }

                // 2. Fetch from legacy reviews table if it exists
                let legacyReviews = [];
                try {
                    const { data: lr } = await supabaseAdmin
                        .from('reviews')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false });
                    legacyReviews = lr || [];
                } catch (ignore) { }

                const formattedLegacy = legacyReviews.map(r => ({
                    id: r.id,
                    serviceName: '旧订单服务',
                    serviceImage: '',
                    date: r.created_at?.split('T')[0],
                    rating: r.rating,
                    content: r.content,
                    images: r.images || []
                }));

                console.log('[Reviews] Returning total:', formattedReviews.length + formattedLegacy.length);
                res.json({ reviews: [...formattedReviews, ...formattedLegacy] });
            }
        } else {
            // Mock
            res.json({
                reviews: [
                    { id: '1', serviceName: '家庭保洁 (Mock)', serviceImage: '', date: '2023-12-10', rating: 5, content: '服务很好！', images: [] }
                ]
            });
        }
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: '获取评价失败' });
    }
});

export default router;
