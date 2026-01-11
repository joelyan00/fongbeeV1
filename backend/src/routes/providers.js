import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { mockUsers } from './auth.js';
import { sendSMS, sendTemplateSMS } from '../services/smsService.js';
import { generateServiceId, generateApplicationId } from '../utils/idGenerator.js';
import { AuditLogger, logServiceAudit, getServiceAuditHistory, getRejectionCategories, REJECTION_CATEGORIES } from '../services/serviceAuditService.js';

const router = express.Router();

// Mock storage for provider profiles
const mockProviderProfiles = [
    {
        id: '1',
        user_id: 'provider-1',
        company_name: '搬家小助手',
        description: '五年搬家经验，服务周到',
        service_categories: ['搬家服务', '家具组装'],
        status: 'approved',
        created_at: new Date().toISOString()
    }
];

// Mock storage for service type applications
const mockServiceTypeApplications = [];

// POST /api/providers/apply - 申请成为服务商 (Category Based)
router.post('/apply', authenticateToken, async (req, res) => {
    try {
        const {
            company_name, description, company_address, business_scope,
            license_url, website, service_city, languages,
            id_front_url, id_back_url, extra_data,
            phone, email
        } = req.body;
        const userId = req.user.id;

        if (!company_name) return res.status(400).json({ error: '公司名称为必填项' });
        if (!business_scope) return res.status(400).json({ error: '必须选择一项主营业务' });

        if (isSupabaseConfigured()) {

            // 1. Upsert Basic Profile Info (provider_profiles)
            // This table now acts as a "Base Profile" storing common company info.
            // We ignore 'status' here or set it to 'approved' simply to mark profile as filled.
            // The real approval status lives in service_type_applications.

            const profileData = {
                user_id: userId,
                company_name,
                description,
                company_address,
                business_scope, // Primary scope, mainly for display
                license_url,
                website,
                service_categories: business_scope ? [business_scope] : [],
                service_city,
                languages,
                id_front_url,
                id_back_url,
                extra_data: extra_data || {},
                service_phone: phone,
                email: email,
                updated_at: new Date().toISOString()
            };

            // Check if profile exists
            const { data: existingProfile } = await supabaseAdmin
                .from('provider_profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            let profileId;

            if (existingProfile) {
                const { error: updateError } = await supabaseAdmin
                    .from('provider_profiles')
                    .update(profileData)
                    .eq('user_id', userId);
                if (updateError) throw updateError;
                profileId = existingProfile.id;
            } else {
                const { data: newProfile, error: insertError } = await supabaseAdmin
                    .from('provider_profiles')
                    .insert({ ...profileData, status: 'pending' }) // Status in profile is less relevant now
                    .select('id')
                    .single();
                if (insertError) throw insertError;
                profileId = newProfile.id;
            }

            // 2. Upsert Service Type Application (The real application)
            // Check if application for this category exists
            const { data: existingApp } = await supabaseAdmin
                .from('service_type_applications')
                .select('id, status')
                .eq('user_id', userId)
                .eq('category', business_scope)
                .single();

            if (existingApp) {
                if (existingApp.status === 'approved') {
                    return res.status(400).json({ error: `您已经是[${business_scope}]认证服务商，无需重复申请` });
                }
                // Update existing application (Re-submit)
                const { data: updatedApp, error: appUpdateError } = await supabaseAdmin
                    .from('service_type_applications')
                    .update({
                        status: 'pending',
                        extra_data: extra_data || {},
                        reason: null, // Clear rejection reason
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingApp.id)
                    .select()
                    .single();

                if (appUpdateError) throw appUpdateError;
                return res.json({ message: '申请已更新，请等待审核', application: updatedApp });

            } else {
                // Create new application
                const { data: newApp, error: appInsertError } = await supabaseAdmin
                    .from('service_type_applications')
                    .insert({
                        user_id: userId,
                        category: business_scope,
                        status: 'pending',
                        extra_data: extra_data || {}
                    })
                    .select()
                    .single();

                if (appInsertError) throw appInsertError;
                return res.json({ message: '申请已提交，请等待审核', application: newApp });
            }

        } else {
            // Mock Mode
            return res.json({ message: 'Mock申请成功', profile: { status: 'pending' } });
        }
    } catch (err) {
        console.error('Provider Application Error:', err);
        return res.status(500).json({ error: '申请提交失败: ' + err.message });
    }
});



// GET /api/providers/me/services - 获取当前用户的服务列表 (from provider_services table)
router.get('/me/services', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        if (isSupabaseConfigured()) {
            const { data: services, error } = await supabaseAdmin
                .from('provider_services')
                .select('*')
                .eq('provider_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[ProvidersAPI] DB Error:', error);
                throw error;
            }
            res.json({ services: services || [] });
        } else {
            // Mock data - return empty or some mock services if needed
            res.json({ services: [] });
        }
    } catch (error) {
        console.error('Get provider services error:', error);
        res.status(500).json({ error: '获取服务列表失败' });
    }
});

// GET /api/providers/me - 获取当前用户的服务商信息
// GET /api/providers/me - 获取当前用户的服务商信息
router.get('/me', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        if (isSupabaseConfigured()) {
            // Check current role and credits from database to prevent stale token access
            const { data: userData, error: userError } = await supabaseAdmin
                .from('users')
                .select('role, credits, wallet_balance')
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            const { data: profile, error } = await supabaseAdmin
                .from('provider_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            // Enforce categories sync here for resilience
            if (profile) {
                // Fetch approved applications
                const { data: apps } = await supabaseAdmin
                    .from('service_type_applications')
                    .select('category')
                    .eq('user_id', userId)
                    .eq('status', 'approved');

                // Fetch latest application (for rejection details/pre-fill)
                const { data: latestApp } = await supabaseAdmin
                    .from('service_type_applications')
                    .select('extra_data, reason, status')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(); // Use maybeSingle to avoid error if none

                if (latestApp) {
                    profile.latest_application = latestApp;
                    // If profile rejection reason is missing but app has one, use it
                    if (!profile.rejection_reason && latestApp.status === 'rejected') {
                        profile.rejection_reason = latestApp.reason;
                    }
                }

                let categories = Array.isArray(profile.service_categories) ? [...profile.service_categories] : [];

                // Add business_scope
                if (profile.business_scope && !categories.includes(profile.business_scope)) {
                    categories.push(profile.business_scope);
                }

                // Add approved apps
                if (apps) {
                    apps.forEach(app => {
                        if (!categories.includes(app.category)) categories.push(app.category);
                    });
                }
                profile.service_categories = categories;
            }

            res.json({
                profile: profile || null,
                currentRole: userData.role,
                credits: userData.credits || 0,
                wallet_balance: userData.wallet_balance || 0
            });
        } else {
            const user = mockUsers.find(u => u.id === userId);
            const profile = mockProviderProfiles.find(p => p.user_id === userId);

            if (profile) {
                const apps = mockServiceTypeApplications.filter(a => a.user_id === userId && a.status === 'approved');
                let categories = Array.isArray(profile.service_categories) ? [...profile.service_categories] : [];
                if (profile.business_scope && !categories.includes(profile.business_scope)) categories.push(profile.business_scope);
                apps.forEach(app => {
                    if (!categories.includes(app.category)) categories.push(app.category);
                });
                profile.service_categories = categories;
            }

            res.json({ profile: profile || null, currentRole: user?.role });
        }
    } catch (error) {
        console.error('Get provider profile error:', error);
        res.status(500).json({ error: '获取服务商信息失败' });
    }
});

// PUT /api/providers/me/profile - 更新服务商信息 (Global Profile Settings)
router.put('/me/profile', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { service_city, schedule, holidays } = req.body;

    // We can expand this to update other profile fields later
    const updates = {};
    if (service_city !== undefined) updates.service_city = service_city;
    if (schedule !== undefined) updates.schedule = schedule;
    if (holidays !== undefined) updates.holidays = holidays;

    try {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('provider_profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            res.json({ message: '设置已更新', profile: data });
        } else {
            // Mock
            const profile = mockProviderProfiles.find(p => p.user_id === userId);
            if (profile) {
                if (service_city !== undefined) profile.service_city = service_city;
                if (schedule !== undefined) profile.schedule = schedule;
                if (holidays !== undefined) profile.holidays = holidays;
                res.json({ message: '设置已更新', profile });
            } else {
                res.status(404).json({ error: 'Profile not found' });
            }
        }
    } catch (error) {
        console.error('Update provider profile error:', error);
        res.status(500).json({ error: '更新失败' });
    }
});

// POST /api/providers/service-types/apply - 申请新增服务类型
router.post('/service-types/apply', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { category, reason, extra_data } = req.body;

    if (!category) return res.status(400).json({ error: '请选择要申请的服务类型' });

    // Security: Validate images if provided
    if (category === '接机服务' && extra_data) {
        const { license_image, insurance_image, registration_image } = extra_data;
        const validateImage = (img) => {
            if (!img) return true; // Optional or not provided yet
            return img.startsWith('data:image/jpeg;base64,') ||
                img.startsWith('data:image/png;base64,') ||
                img.startsWith('data:image/webp;base64,');
        };

        if (!validateImage(license_image) || !validateImage(insurance_image) || !validateImage(registration_image)) {
            return res.status(400).json({ error: '上传的文件格式不正确，仅支持图片格式' });
        }
    }

    try {
        if (isSupabaseConfigured()) {
            // Check for existing application to prevent duplicates
            const { data: existingApp } = await supabaseAdmin
                .from('service_type_applications')
                .select('id, status')
                .eq('user_id', userId)
                .eq('category', category)
                .single();

            if (existingApp) {
                if (existingApp.status === 'pending') {
                    return res.status(400).json({ error: '您已经提交过该服务类型的申请，请等待审核' });
                }
                if (existingApp.status === 'approved') {
                    return res.status(400).json({ error: `您已经是[${category}]认证服务商，无需重复申请` });
                }
                // Status is 'rejected', update the existing application
                const { data: updatedApp, error: updateError } = await supabaseAdmin
                    .from('service_type_applications')
                    .update({
                        status: 'pending',
                        reason: reason || null,
                        extra_data,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingApp.id)
                    .select()
                    .single();

                if (updateError) throw updateError;
                return res.json({ message: '申请已重新提交，请等待管理员审核', application: updatedApp });
            }

            // No existing application, create new one
            const { data, error } = await supabaseAdmin
                .from('service_type_applications')
                .insert({
                    user_id: userId,
                    category,
                    reason,
                    extra_data,
                    status: 'pending',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            res.json({ message: '申请已提交，请等待管理员审核', application: data });
        } else {
            // Mock mode - also check for duplicates
            const existingApp = mockServiceTypeApplications.find(a => a.user_id === userId && a.category === category);
            if (existingApp) {
                if (existingApp.status === 'pending') {
                    return res.status(400).json({ error: '您已经提交过该服务类型的申请，请等待审核' });
                }
                if (existingApp.status === 'approved') {
                    return res.status(400).json({ error: `您已经是[${category}]认证服务商，无需重复申请` });
                }
                // Update rejected application
                existingApp.status = 'pending';
                existingApp.reason = reason || null;
                existingApp.extra_data = extra_data;
                existingApp.updated_at = new Date().toISOString();
                return res.json({ message: '申请已重新提交，请等待管理员审核', application: existingApp });
            }

            const newApp = {
                id: uuidv4(),
                user_id: userId,
                category,
                reason,
                extra_data,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            mockServiceTypeApplications.push(newApp);
            res.json({ message: '申请已提交，请等待管理员审核', application: newApp });
        }
    } catch (error) {
        console.error('Service type apply error:', error);
        res.status(500).json({ error: '提交申请失败' });
    }
});

// GET /api/providers/service-types/applications - 获取当前用户的申请列表
router.get('/service-types/applications', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabaseAdmin
                .from('service_type_applications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json({ applications: data });
        } else {
            const apps = mockServiceTypeApplications.filter(a => a.user_id === userId);
            apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            res.json({ applications: apps });
        }
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ error: '获取申请列表失败' });
    }
});

// GET /api/admin/service-type-applications - 获取待审核申请 (管理员)
router.get('/admin/applications', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: '权限不足' });

    try {
        if (isSupabaseConfigured()) {
            // 1. Fetch Service Type Applications
            const { data: serviceApps, error: serviceError } = await supabaseAdmin
                .from('service_type_applications')
                .select(`
                    *,
                    user:users (
                        name,
                        email
                    )
                `)
                .order('created_at', { ascending: false });

            if (serviceError) throw serviceError;

            // 2. Fetch Pending Provider Profiles (Initial Applications)
            const { data: profileApps, error: profileError } = await supabaseAdmin
                .from('provider_profiles')
                .select(`
                    *,
                    user:users (
                        name,
                        email
                    )
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (profileError) throw profileError;

            if (serviceError) throw serviceError;

            // Normalize
            const formattedServiceApps = serviceApps.map(app => ({
                ...app,
                type: 'service_application',
                user: app.user || { name: 'Unknown', email: 'Unknown' }
            }));

            // Only return service applications to avoid duplicates
            // Since POST /apply now creates a service_type_application, we don't need to fetch from provider_profiles
            const allApps = formattedServiceApps.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            res.json({ applications: allApps });

        } else {
            // Mock Data
            const serviceApps = mockServiceTypeApplications.map(app => {
                const user = mockUsers.find(u => u.id === app.user_id);
                return {
                    ...app,
                    user: user ? { name: user.name, email: user.email } : null,
                    type: 'service_application'
                };
            });

            const profileApps = mockProviderProfiles
                .filter(p => p.status === 'pending')
                .map(p => {
                    const user = mockUsers.find(u => u.id === p.user_id);
                    return {
                        id: p.user_id, // trick for frontend key, but careful
                        application_id: p.id,
                        user_id: p.user_id,
                        created_at: p.created_at,
                        user: user || { name: 'Unknown', email: 'Unknown' },
                        category: p.business_scope || p.service_categories[0],
                        reason: p.description,
                        status: p.status,
                        type: 'initial_application',
                        extra_data: p.extra_data
                    };
                });

            const allApps = [...serviceApps, ...profileApps].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            res.json({ applications: allApps });
        }
    } catch (error) {
        console.error('Fetch applications error:', error);
        res.status(500).json({ error: '获取待审核列表失败' });
    }
});

// PATCH /api/admin/applications/:id - 审核申请
router.patch('/admin/applications/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: '权限不足' });
    const { id } = req.params;
    const { status, reason } = req.body; // 'approved' or 'rejected', and optional reason

    try {
        if (isSupabaseConfigured()) {
            // Updated application
            const updateData = { status, updated_at: new Date().toISOString() };
            if (reason) updateData.reason = reason;

            const { data: application, error } = await supabaseAdmin
                .from('service_type_applications')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            if (status === 'approved') {
                // 1. Get current profile or prepare for creation
                const { data: profile } = await supabaseAdmin
                    .from('provider_profiles')
                    .select('id, service_categories, business_scope')
                    .eq('user_id', application.user_id)
                    .maybeSingle();

                let categories = [];
                if (profile && Array.isArray(profile.service_categories)) {
                    categories = profile.service_categories;
                }

                if (!categories.includes(application.category)) {
                    categories.push(application.category);
                }

                if (profile) {
                    // Update existing profile
                    await supabaseAdmin
                        .from('provider_profiles')
                        .update({
                            service_categories: categories,
                            status: 'approved',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', profile.id);
                } else {
                    // Create new profile using application data fallback
                    const extraData = application.extra_data || {};
                    const basicInfo = extraData.basicInfo || {};
                    const serviceScope = extraData.serviceScope || {};

                    // Join address parts if they exist
                    const addressParts = [
                        extraData.addressStreet || basicInfo.addressStreet,
                        extraData.addressCity || basicInfo.addressCity,
                        extraData.addressProvince || basicInfo.addressProvince,
                        extraData.addressPostalCode || basicInfo.addressPostalCode
                    ].filter(Boolean);
                    const companyAddress = addressParts.join(', ') || '未提供地址';

                    await supabaseAdmin
                        .from('provider_profiles')
                        .insert({
                            user_id: application.user_id,
                            company_name: basicInfo.name || extraData.name || '新服务商',
                            company_address: companyAddress,
                            service_phone: basicInfo.phone || extraData.phone || null,
                            email: basicInfo.email || extraData.email || null,
                            business_scope: application.category,
                            service_categories: [application.category],
                            status: 'approved',
                            service_city: serviceScope.city || null,
                            languages: serviceScope.languages || [],
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });
                }

                // 2. Ensure User Role is 'provider'
                await supabaseAdmin
                    .from('users')
                    .update({ role: 'provider' })
                    .eq('id', application.user_id);
            }
            else if (status === 'rejected') {
                // If rejected, allow user to re-apply by setting profile to rejected
                // Update if pending OR already rejected (to update reason), but protect 'approved' providers
                await supabaseAdmin
                    .from('provider_profiles')
                    .update({
                        status: 'rejected',
                        rejection_reason: reason
                    })
                    .eq('user_id', application.user_id)
                    .neq('status', 'approved');
            }

            res.json({ message: '处理成功', application });
        } else {
            const app = mockServiceTypeApplications.find(a => a.id === id);
            if (!app) return res.status(404).json({ error: '申请不存在' });

            app.status = status;
            app.updated_at = new Date().toISOString();

            if (status === 'approved') {
                const profile = mockProviderProfiles.find(p => p.user_id === app.user_id);
                if (profile) {
                    profile.service_categories = profile.service_categories || [];

                    if (profile.business_scope && !profile.service_categories.includes(profile.business_scope)) {
                        profile.service_categories.push(profile.business_scope);
                    }

                    if (!profile.service_categories.includes(app.category)) {
                        profile.service_categories.push(app.category);
                    }
                }
            }
            res.json({ message: '处理成功', application: app });
        }
    } catch (error) {
        console.error('Review application error:', error);
        res.status(500).json({ error: '处理失败' });
    }
});

// PATCH /api/providers/admin/verify/:userId - 审核通过服务商入驻 (初始申请)
router.patch('/admin/verify/:userId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: '权限不足' });
    const { userId } = req.params;
    const { status, reason } = req.body; // 'approved' or 'rejected', plus reason

    try {
        if (isSupabaseConfigured()) {
            // 1. Update Profile Status
            const updatePayload = {
                status,
                updated_at: new Date().toISOString()
            };
            if (status === 'rejected' && reason) {
                updatePayload.rejection_reason = reason;
            }

            const { data: profile, error: profileError } = await supabaseAdmin
                .from('provider_profiles')
                .update(updatePayload)
                .eq('user_id', userId)
                .select()
                .single();

            if (profileError) throw profileError;

            if (status === 'approved') {
                // 2. Upgrade User Role
                await supabaseAdmin
                    .from('users')
                    .update({ role: 'provider' })
                    .eq('id', userId);

                // 3. Ensure business_scope is in service_categories
                let categories = Array.isArray(profile.service_categories) ? profile.service_categories : [];
                if (profile.business_scope && !categories.includes(profile.business_scope)) {
                    categories.push(profile.business_scope);
                    await supabaseAdmin
                        .from('provider_profiles')
                        .update({ service_categories: categories })
                        .eq('user_id', userId);
                }
            }

            res.json({ message: '审核成功', profile });
        } else {
            const profile = mockProviderProfiles.find(p => p.user_id === userId);
            if (!profile) return res.status(404).json({ error: '档案不存在' });

            profile.status = status;
            if (status === 'approved') {
                const user = mockUsers.find(u => u.id === userId);
                if (user) user.role = 'provider';

                profile.service_categories = profile.service_categories || [];
                if (profile.business_scope && !profile.service_categories.includes(profile.business_scope)) {
                    profile.service_categories.push(profile.business_scope);
                }
            }
            res.json({ message: '审核成功', profile });
        }
    } catch (error) {
        console.error('Verify provider error:', error);
        res.status(500).json({ error: '操作失败' });
    }
});



// GET /api/providers/admin/stats - 获取服务商统计数据
router.get('/admin/stats', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: '权限不足' });

    try {
        if (isSupabaseConfigured()) {
            // Use Supabase counts
            // Total
            const { count: total } = await supabaseAdmin
                .from('provider_profiles')
                .select('*', { count: 'exact', head: true });

            // Approved
            const { count: verified } = await supabaseAdmin
                .from('provider_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved');

            // Pending
            const { count: pending } = await supabaseAdmin
                .from('provider_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Rejected / Frozen
            const { count: frozen } = await supabaseAdmin
                .from('provider_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'rejected');

            res.json({ stats: { total, verified, pending, frozen } });
        } else {
            // Mock stats
            const total = mockProviderProfiles.length;
            const verified = mockProviderProfiles.filter(p => p.status === 'approved').length;
            const pending = mockProviderProfiles.filter(p => p.status === 'pending').length;
            const frozen = mockProviderProfiles.filter(p => p.status === 'rejected').length;

            res.json({ stats: { total, verified, pending, frozen } });
        }
    } catch (error) {
        console.error('Get provider stats error:', error);
        res.status(500).json({ error: '获取统计数据失败' });
    }
});

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
                        credits,
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
                credits: p.user.credits || 0,
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

// PATCH /api/providers/admin/:userId/credits - 管理员调整服务商积分
router.patch('/admin/:userId/credits', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: '权限不足' });

    const { userId } = req.params;
    const { amount, reason } = req.body;

    if (amount === undefined || amount === null) {
        return res.status(400).json({ error: '请提供变动金额' });
    }
    if (!reason) {
        return res.status(400).json({ error: '请提供变动原因' });
    }

    try {
        if (isSupabaseConfigured()) {
            // 1. Get current credits
            const { data: user, error: userError } = await supabaseAdmin
                .from('users')
                .select('credits')
                .eq('id', userId)
                .single();

            if (userError || !user) {
                return res.status(404).json({ error: '用户不存在' });
            }

            const currentCredits = user.credits || 0;
            const newCredits = currentCredits + amount;

            // Prevent negative balance on deduction
            if (newCredits < 0) {
                return res.status(400).json({
                    error: `余额不足。当前积分 ${currentCredits}，无法扣除 ${Math.abs(amount)} 积分`
                });
            }

            // 2. Update credits
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({ credits: newCredits })
                .eq('id', userId);

            if (updateError) throw updateError;

            // 3. Log the transaction
            await supabaseAdmin.from('credit_transactions').insert({
                user_id: userId,
                amount: amount,
                type: amount >= 0 ? 'admin_add' : 'admin_deduct',
                description: reason,
                created_by: req.user.id
            });

            res.json({
                message: amount >= 0 ? '充值成功' : '扣除成功',
                credits: newCredits,
                previousCredits: currentCredits,
                change: amount
            });

        } else {
            // Mock mode
            const user = mockUsers.find(u => u.id === userId);
            if (!user) return res.status(404).json({ error: '用户不存在' });

            user.credits = (user.credits || 0) + amount;
            res.json({
                message: amount >= 0 ? '充值成功 (Mock)' : '扣除成功 (Mock)',
                credits: user.credits
            });
        }
    } catch (error) {
        console.error('Update credits error:', error);
        res.status(500).json({ error: '积分调整失败' });
    }
});

// GET /api/providers/:id/public - Get public provider profile
router.get('/:id/public', async (req, res) => {
    try {
        const providerId = req.params.id; // This is the user_id

        if (isSupabaseConfigured()) {
            // 1. Get Profile
            const { data: profile, error } = await supabaseAdmin
                .from('provider_profiles')
                .select('*')
                .eq('user_id', providerId)
                .single();

            if (error) {
                // Return 404 if not found
                return res.status(404).json({ error: 'Provider not found' });
            }

            // 2. Get User Info (Name, Avatar)
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('name, avatar_url')
                .eq('id', providerId)
                .single();

            // 3. Combine
            const result = {
                id: profile.user_id,
                company_name: profile.company_name,
                description: profile.description,
                service_categories: profile.service_categories,
                service_city: profile.service_city,
                rating: profile.rating || 5.0,
                years_experience: 3, // Mock
                name: user?.name || profile.company_name || 'Service Provider',
                avatar_url: user?.avatar_url,
                languages: profile.languages,
                // Add dummy reviews for now
                reviews: [
                    { id: 1, user: '张女士', rating: 5, content: '服务非常专业，准时到达！', date: '2023-12-01' },
                    { id: 2, user: '李先生', rating: 5, content: '干活利索，价格公道。', date: '2023-11-20' },
                    { id: 3, user: '匿名用户', rating: 4, content: '总体不错。', date: '2023-11-15' }
                ]
            };

            res.json(result);

        } else {
            // Mock
            const p = mockProviderProfiles.find(p => p.user_id === providerId || p.id === providerId);
            if (p) {
                res.json({
                    ...p,
                    name: p.company_name,
                    avatar_url: '',
                    reviews: []
                });
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        }
    } catch (error) {
        console.error('Get provider public profile error:', error);
        res.status(500).json({ error: 'Failed to fetch provider profile' });
    }
});

// POST /api/providers/check-phone-availability
// Checks if a phone number is already registered as a provider
router.post('/check-phone-availability', authenticateToken, async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    try {
        if (isSupabaseConfigured()) {
            // Find user by phone
            // Phone can be in 'phone' column or maybe check extra_data? Assuming phone column.
            try {
                const { data: users, error: userError } = await supabaseAdmin
                    .from('users')
                    .select('id, name, avatar_url, role')
                    .eq('phone', phone)
                    .limit(1);

                if (userError) {
                    console.error('Supabase user check error:', userError);
                    throw userError;
                }

                const user = users && users.length > 0 ? users[0] : null;

                if (user) {
                    // User exists, check if provider profile exists
                    const { data: profiles } = await supabaseAdmin
                        .from('provider_profiles')
                        .select('company_name, status')
                        .eq('user_id', user.id)
                        .limit(1);

                    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

                    return res.json({
                        registered: true,
                        isProvider: user.role === 'provider',
                        user: {
                            id: user.id,
                            name: user.name,
                            company_name: profile?.company_name,
                            avatar: user.avatar_url
                        }
                    });
                } else {
                    return res.json({ registered: false });
                }
            } catch (queryErr) {
                console.error('Database query failed:', queryErr);
                return res.status(500).json({ error: 'Database query failed' });
            }
        } else {
            // Mock Check
            // Assume phone '1234567890' is registered
            if (phone === '1234567890') {
                return res.json({
                    registered: true,
                    isProvider: true,
                    user: { id: 'mock-p1', name: 'Mock Provider', company_name: 'Mock Company' }
                });
            }
            return res.json({ registered: false });
        }
    } catch (err) {
        console.error('Check phone error:', err);
        res.status(500).json({ error: 'Check failed' });
    }
});

// POST /api/providers/send-invite
router.post('/send-invite', authenticateToken, async (req, res) => {
    let { phone, serviceName, userName, serviceDate, serviceAddress, customMessage } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    // Normalize phone: if 10 digits, assume NA +1
    const cleanPhone = phone.replace(/\D/g, '');
    let originalPhone = phone;
    if (cleanPhone.length === 10) {
        phone = '+1' + cleanPhone;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
        phone = '+' + cleanPhone;
    } else if (!phone.startsWith('+')) {
        // Fallback just in case
        phone = '+' + cleanPhone;
    }
    console.log(`[SendInvite] Original Phone: ${originalPhone}, Normalized: ${phone}, Body:`, req.body);

    try {
        // Construct Message
        const link = 'https://youfujia.com/provider/join?phone=' + phone;

        if (customMessage) {
            // Direct Send
            const result = await sendSMS(phone, customMessage);
            if (result.success) return res.json({ success: true, message: 'Custom Invitation sent', sid: result.sid });
        } else {
            // Template Send
            const details = [];
            if (serviceDate) details.push(serviceDate);
            if (serviceAddress) details.push(serviceAddress);
            const detailStr = details.length > 0 ? `(${details.join(' / ')})` : '';

            const templateData = {
                userName: userName || '用户',
                serviceName: serviceName || '服务',
                details: detailStr,
                link: link,
                ...req.body // Pass all other fields
            };

            const result = await sendTemplateSMS(phone, 'provider_invite', templateData);

            // Fallback if template fails (e.g. DB not ready)
            if (!result.success && result.error === 'Template not found') {
                const fallbackMsg = `【优服佳】您好，客户[${userName || 'Guest'}]正在寻找[${serviceName || '服务'}]${detailStr}。请点击链接查看详情并报价：${link}`;
                const fbResult = await sendSMS(phone, fallbackMsg);
                if (fbResult.success) return res.json({ success: true, message: 'Fallback Invitation sent', sid: fbResult.sid });
                else return res.status(500).json({ error: 'Failed to send SMS', details: fbResult.error });
            }

            if (result.success) {
                res.json({ success: true, message: 'Template Invitation sent', sid: result.sid });
            } else {
                res.status(500).json({ error: 'Failed to send SMS', details: result.error });
            }
            return; // Stop here
        }

        if (result.success) {
            res.json({ success: true, message: 'Invitation sent', sid: result.sid });
        } else {
            res.status(500).json({ error: 'Failed to send SMS', details: result.error });
        }
    } catch (err) {
        console.error('Invite error:', err);
        res.status(500).json({ error: 'Invite failed' });
    }
});

// POST /api/providers/services - 创建标准服务
router.post('/services', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const {
            category, categoryId, title, description,
            price, priceUnit, additionalRate, taxIncluded,
            inclusions, exclusions, materialsPolicy, extraFees,
            duration, serviceCity, advanceBooking, clientRequirements,
            cancellationPolicy, isLicensed, hasInsurance,
            depositRatio, serviceMode, addOns, images, formData
        } = req.body;

        // Validation
        if (!title || !price || !category) {
            return res.status(400).json({ error: '请填写必填项 (标题、价格、类目)' });
        }

        if (isSupabaseConfigured()) {
            // Generate IDs
            const serviceIdentityId = generateServiceId();
            const applicationNo = generateApplicationId();

            // Insert into provider_services table
            const { data: service, error } = await supabaseAdmin
                .from('provider_services')
                .insert({
                    provider_id: userId,
                    category,
                    category_id: categoryId,
                    title,
                    description,
                    price: parseFloat(price),
                    price_unit: priceUnit,
                    additional_rate: additionalRate ? parseFloat(additionalRate) : null,
                    tax_included: taxIncluded || false,
                    inclusions,
                    exclusions,
                    materials_policy: materialsPolicy,
                    extra_fees: extraFees,
                    duration: duration ? parseInt(duration) : null,
                    service_city: serviceCity || [],
                    advance_booking: advanceBooking ? parseInt(advanceBooking) : 24,
                    client_requirements: clientRequirements,
                    cancellation_policy: cancellationPolicy,
                    is_licensed: isLicensed || false,
                    has_insurance: hasInsurance || false,
                    deposit_ratio: depositRatio || 20,
                    service_mode: serviceMode || 'offline',
                    add_ons: addOns || [],
                    images: images || [],
                    form_data: formData || {},
                    status: 'pending', // Pending admin approval
                    created_at: new Date().toISOString(),
                    service_identity_id: serviceIdentityId // Add Identity ID
                })
                .select()
                .single();

            if (error) throw error;

            // Submit Application Record
            const { error: appError } = await supabaseAdmin
                .from('provider_service_applications')
                .insert({
                    service_id: service.id,
                    provider_id: userId,
                    application_no: applicationNo,
                    service_identity_id: serviceIdentityId,
                    snapshot_data: service, // Save the full service data as snapshot
                    status: 'pending'
                });

            if (appError) console.error('Failed to create application record:', appError);

            // Log audit event
            try {
                const { data: user } = await supabaseAdmin.from('users').select('name').eq('id', userId).single();
                await AuditLogger.serviceCreated(serviceIdentityId, service.id, userId, user?.name || 'Provider', false);
            } catch (auditErr) {
                console.error('Audit log failed (non-critical):', auditErr);
            }

            res.json({ message: '服务已提交审核', service });
        } else {
            // Mock mode
            res.json({
                message: '服务已提交审核 (Mock)',
                service: { id: uuidv4(), title, price, status: 'pending', service_identity_id: generateServiceId() }
            });
        }
    } catch (err) {
        console.error('Create service error:', err);
        res.status(500).json({ error: '创建服务失败: ' + err.message });
    }
});

// GET /api/providers/my-templates - 获取服务商可用的标准服务模板（基于已开通类别）
router.get('/my-templates', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        if (isSupabaseConfigured()) {
            // 1. Get provider's approved categories
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('provider_profiles')
                .select('service_categories')
                .eq('user_id', userId)
                .single();

            if (profileError || !profile) {
                return res.status(404).json({ error: '服务商资料不存在', templates: [] });
            }

            const myCategories = profile.service_categories || [];

            if (myCategories.length === 0) {
                return res.json({
                    templates: [],
                    message: '您尚未开通任何服务类别，请先申请开通'
                });
            }

            // 2. Get category IDs from names (Parent Categories)
            const { data: categoryRecords } = await supabaseAdmin
                .from('service_categories')
                .select('id, name')
                .in('name', myCategories);

            let allCategoryRecords = [...(categoryRecords || [])];
            const parentIds = categoryRecords?.map(c => c.id) || [];

            // 2b. Get child categories (if any)
            if (parentIds.length > 0) {
                const { data: childRecords } = await supabaseAdmin
                    .from('service_categories')
                    .select('id, name')
                    .in('parent_id', parentIds);

                if (childRecords && childRecords.length > 0) {
                    allCategoryRecords = [...allCategoryRecords, ...childRecords];
                }
            }

            const categoryNames = allCategoryRecords.map(c => c.name);
            const nameToIdMap = {};
            allCategoryRecords.forEach(c => { nameToIdMap[c.name] = c.id; });

            if (categoryNames.length === 0) {
                return res.json({ templates: [], message: '未找到匹配的服务类别' });
            }

            // 3. Get published standard service blueprints matching provider's categories
            const { data: blueprints, error: blueprintsError } = await supabaseAdmin
                .from('service_blueprints')
                .select('*')
                .eq('category', 'standard_service')  // Only standard service blueprints
                .eq('status', 'published')            // Only published blueprints
                .in('service_category', categoryNames) // Match by service category
                .order('sort_order', { ascending: true })
                .order('updated_at', { ascending: false });

            if (blueprintsError) throw blueprintsError;

            // 4. Transform blueprints to match frontend expectations
            const result = (blueprints || []).map(b => ({
                id: b.id,
                name: b.name,
                title: b.pre_filled_content?.title || b.name,
                description: b.description,
                category: b.service_category,
                category_id: nameToIdMap[b.service_category],
                category_name: b.service_category,
                base_price: b.pre_filled_content?.price_range?.min || null,
                price_unit: b.pre_filled_content?.price_range?.unit || 'per_service',
                // Include blueprint-specific data
                pre_filled_content: b.pre_filled_content,
                sop_content: b.sop_content,
                faq_content: b.faq_content,
                pricing_guide: b.pricing_guide,
                images: b.images,
                is_featured: b.is_featured
            }));

            res.json({
                templates: result,
                categories: myCategories,
                total: result.length
            });
        } else {
            // Mock
            res.json({ templates: [], categories: [], total: 0 });
        }
    } catch (err) {
        console.error('Get my templates error:', err);
        res.status(500).json({ error: '获取模板失败: ' + err.message });
    }
});

// GET /api/providers/my-services - 获取服务商自己的服务列表
router.get('/my-services', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { status, page = 1, size = 20 } = req.query;
    const offset = (page - 1) * size;

    try {
        if (isSupabaseConfigured()) {
            let query = supabaseAdmin
                .from('provider_services')
                .select('*', { count: 'exact' })
                .eq('provider_id', userId)
                .neq('status', 'archived'); // Don't show archived/deleted services

            if (status && status !== 'all') {
                query = query.eq('status', status);
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + Number(size) - 1);

            if (error) throw error;

            res.json({
                services: data || [],
                total: count || 0,
                page: Number(page),
                size: Number(size)
            });
        } else {
            // Mock
            res.json({ services: [], total: 0, page: 1, size: 20 });
        }
    } catch (err) {
        console.error('Get my services error:', err);
        res.status(500).json({ error: '获取服务列表失败' });
    }
});

// POST /api/providers/services/:id/unpublish - 下架服务
router.post('/services/:id/unpublish', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    try {
        if (isSupabaseConfigured()) {
            // Check ownership and current status
            const { data: service, error: findError } = await supabaseAdmin
                .from('provider_services')
                .select('provider_id, status, service_identity_id')
                .eq('id', id)
                .single();

            if (findError || !service) {
                return res.status(404).json({ error: '服务不存在' });
            }
            if (service.provider_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: '无权操作此服务' });
            }
            if (service.status !== 'approved' && service.status !== 'published') {
                return res.status(400).json({ error: '只有已上架的服务才能下架' });
            }

            // Update status to unpublished
            const { data: updated, error: updateError } = await supabaseAdmin
                .from('provider_services')
                .update({
                    status: 'unpublished',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Log audit
            try {
                const { data: user } = await supabaseAdmin.from('users').select('name').eq('id', userId).single();
                await AuditLogger.serviceUnpublished(
                    service.service_identity_id,
                    id,
                    userId,
                    user?.name || 'Provider',
                    'provider',
                    reason || '服务商主动下架'
                );
            } catch (auditErr) {
                console.error('Audit log failed:', auditErr);
            }

            res.json({ message: '服务已下架', service: updated });
        } else {
            res.json({ message: '服务已下架 (Mock)' });
        }
    } catch (err) {
        console.error('Unpublish service error:', err);
        res.status(500).json({ error: '下架失败: ' + err.message });
    }
});

// DELETE /api/providers/services/:id - 删除服务 (软删除/归档)
router.delete('/services/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        if (isSupabaseConfigured()) {
            // Check ownership and current status
            const { data: service, error: findError } = await supabaseAdmin
                .from('provider_services')
                .select('provider_id, status, service_identity_id')
                .eq('id', id)
                .single();

            if (findError || !service) {
                return res.status(404).json({ error: '服务不存在' });
            }
            if (service.provider_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: '无权操作此服务' });
            }
            // Only allow deletion of unpublished, rejected, or draft services
            const deletableStatuses = ['unpublished', 'rejected', 'draft', 'pending'];
            if (!deletableStatuses.includes(service.status)) {
                return res.status(400).json({
                    error: '已上架的服务需要先下架才能删除',
                    currentStatus: service.status
                });
            }

            // Soft delete - change status to archived
            const { error: updateError } = await supabaseAdmin
                .from('provider_services')
                .update({
                    status: 'archived',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (updateError) throw updateError;

            // Log audit
            try {
                const { data: user } = await supabaseAdmin.from('users').select('name').eq('id', userId).single();
                await logServiceAudit({
                    serviceIdentityId: service.service_identity_id,
                    serviceId: id,
                    action: 'archived',
                    previousStatus: service.status,
                    newStatus: 'archived',
                    actorId: userId,
                    actorRole: 'provider',
                    actorName: user?.name,
                    reason: '服务商删除服务'
                });
            } catch (auditErr) {
                console.error('Audit log failed:', auditErr);
            }

            res.json({ message: '服务已删除' });
        } else {
            res.json({ message: '服务已删除 (Mock)' });
        }
    } catch (err) {
        console.error('Delete service error:', err);
        res.status(500).json({ error: '删除失败: ' + err.message });
    }
});


// PUT /api/providers/services/:id - 更新服务 (如上下架、编辑)
router.put('/services/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, listing_status, ...updates } = req.body;

    // console.log(`[ProvidersAPI] Update Service ID: ${id}, User: ${userId}`);

    try {
        if (isSupabaseConfigured()) {
            // Check ownership
            const { data: existing, error: findError } = await supabaseAdmin
                .from('provider_services')
                .select('provider_id')
                .eq('id', id)
                .single();

            if (findError || !existing) {
                // console.log('[ProvidersAPI] Service not found:', findError);
                return res.status(404).json({ error: '服务不存在' });
            }
            if (existing.provider_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: '无权操作此服务' });
            }

            // Construct update payload
            const payload = { ...updates, updated_at: new Date().toISOString() };

            // Handle status mapping if frontend sends 'listing_status'
            if (listing_status) {
                payload.status = listing_status;
            }
            if (status) {
                payload.status = status;
            }

            const { data: service, error } = await supabaseAdmin
                .from('provider_services')
                .update(payload)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // If status is changed to 'pending' (re-submission), create a new application record
            // Also need to check if it HAS a service_identity_id (legacy services might not)
            if (payload.status === 'pending') {
                const applicationNo = generateApplicationId();
                // Ensure service_identity_id exists, if not, maybe generate one now? 
                // Ideally migration happens separately, but for robustness:
                let identityId = service.service_identity_id;
                if (!identityId) {
                    identityId = generateServiceId();
                    await supabaseAdmin.from('provider_services').update({ service_identity_id: identityId }).eq('id', id);
                }

                const { error: appError } = await supabaseAdmin
                    .from('provider_service_applications')
                    .insert({
                        service_id: service.id,
                        provider_id: userId,
                        application_no: applicationNo,
                        service_identity_id: identityId,
                        snapshot_data: service, // Snapshot of updated status
                        status: 'pending'
                    });
                if (appError) console.error('Failed to create re-submission application record:', appError);
            }

            res.json({ message: '更新成功', service });
        } else {
            // Mock
            res.json({ message: '更新成功 (Mock)', service: { id, ...req.body } });
        }
    } catch (err) {
        console.error('Update service error:', err);
        res.status(500).json({ error: '更新失败: ' + err.message });
    }
});

// ============================================
// Service Audit & Lifecycle APIs
// ============================================

// GET /api/providers/services/:id/history - Get audit history for a service
router.get('/services/:id/history', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    try {
        if (isSupabaseConfigured()) {
            // Get service to find service_identity_id
            const { data: service, error: findError } = await supabaseAdmin
                .from('provider_services')
                .select('service_identity_id, provider_id')
                .eq('id', id)
                .single();

            if (findError || !service) {
                return res.status(404).json({ error: '服务不存在' });
            }

            // Check authorization
            if (!isAdmin && service.provider_id !== userId) {
                return res.status(403).json({ error: '无权查看此服务的历史记录' });
            }

            const history = await getServiceAuditHistory(service.service_identity_id);
            res.json({ history });
        } else {
            // Mock
            res.json({ history: [] });
        }
    } catch (err) {
        console.error('Get service history error:', err);
        res.status(500).json({ error: '获取历史记录失败' });
    }
});

// GET /api/providers/services/by-identity/:serviceIdentityId - Get service by identity ID
router.get('/services/by-identity/:serviceIdentityId', authenticateToken, async (req, res) => {
    const { serviceIdentityId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    try {
        if (isSupabaseConfigured()) {
            const { data: service, error } = await supabaseAdmin
                .from('provider_services')
                .select('*')
                .eq('service_identity_id', serviceIdentityId)
                .single();

            if (error || !service) {
                return res.status(404).json({ error: '服务不存在' });
            }

            // Check authorization
            if (!isAdmin && service.provider_id !== userId) {
                return res.status(403).json({ error: '无权查看此服务' });
            }

            // Get audit history
            const history = await getServiceAuditHistory(serviceIdentityId);

            res.json({ service, history });
        } else {
            res.json({ service: null, history: [] });
        }
    } catch (err) {
        console.error('Get service by identity error:', err);
        res.status(500).json({ error: '获取服务失败' });
    }
});

// GET /api/providers/rejection-categories - Get predefined rejection categories
router.get('/rejection-categories', async (req, res) => {
    try {
        const categories = await getRejectionCategories();
        res.json({ categories });
    } catch (err) {
        console.error('Get rejection categories error:', err);
        res.json({ categories: REJECTION_CATEGORIES });
    }
});

export { mockProviderProfiles, mockServiceTypeApplications };
export default router;

