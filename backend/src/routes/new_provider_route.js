
// GET /api/providers/admin/list - 获取所有服务商列表 (包括待审核)
router.get('/admin/list', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: '权限不足' });

    try {
        const { page = 1, size = 10, status, keyword } = req.query;
        const offset = (page - 1) * size;

        if (isSupabaseConfigured()) {
            let query = supabaseAdmin
                .from('provider_profiles')
                .select(`
                    *,
                    user:users (
                        id,
                        name,
                        email,
                        phone,
                        role,
                        status,
                        created_at
                    )
                `, { count: 'exact' });

            if (status) {
                query = query.eq('status', status);
            }

            // Note: Keyword search across joined table is tricky in simple Supabase query.
            // We might need to fetch more and filter in memory if keyword is provided, 
            // or trust that the client handles filtering if dataset is small.
            // For now, let's just return paginated list and allow frontend to filter or simplified backend filter.

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + Number(size) - 1);

            if (error) throw error;

            // Transform data to flat structure for frontend convenience
            const providers = data.map(p => ({
                id: p.user.id, // Use User ID as main ID
                profile_id: p.id,
                name: p.company_name || p.user.name || p.user.email,
                email: p.user.email,
                phone: p.user.phone || p.contact_phone || '-',
                role: p.user.role,
                userStatus: p.user.status,
                status: p.status, // Profile status (pending/approved)
                statusText: p.status === 'approved' ? '已认证' : (p.status === 'pending' ? '待审核' : '已拒绝'),
                category: Array.isArray(p.service_categories) ? p.service_categories.join(', ') : (p.service_categories || '-'),
                rating: p.rating || 5.0,
                orders: 0,
                joinDate: new Date(p.created_at).toLocaleDateString(),
                avatar: ''
            }));

            res.json({
                providers,
                total: count,
                page: Number(page),
                size: Number(size)
            });

        } else {
            // Mock Data Implementation
            // Join mockUsers and mockProviderProfiles
            let profiles = mockProviderProfiles.map(p => {
                const user = mockUsers.find(u => u.id === p.user_id);
                return {
                    ...p,
                    user: user || {}
                };
            });

            if (status) {
                profiles = profiles.filter(p => p.status === status);
            }
            if (keyword) {
                const k = keyword.toLowerCase();
                profiles = profiles.filter(p =>
                    (p.company_name && p.company_name.toLowerCase().includes(k)) ||
                    (p.user.name && p.user.name.toLowerCase().includes(k)) ||
                    (p.user.email && p.user.email.toLowerCase().includes(k))
                );
            }

            const total = profiles.length;
            const sliced = profiles.slice(offset, offset + Number(size));

            const providers = sliced.map(p => ({
                id: p.user_id,
                profile_id: p.id,
                name: p.company_name || p.user.name || p.user.email,
                email: p.user.email,
                phone: p.user.phone || '-',
                role: p.user.role,
                userStatus: p.user.status,
                status: p.status,
                statusText: p.status === 'approved' ? '已认证' : '待审核',
                category: Array.isArray(p.service_categories) ? p.service_categories.join(', ') : '-',
                rating: 5.0,
                orders: 0,
                joinDate: new Date(p.created_at).toLocaleDateString(),
                avatar: ''
            }));

            res.json({
                providers,
                total,
                page: Number(page),
                size: Number(size)
            });
        }
    } catch (error) {
        console.error('Get admin provider list error:', error);
        res.status(500).json({ error: '获取服务商列表失败' });
    }
});
