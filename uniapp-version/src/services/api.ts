// API configuration for UniApp
// Use production URL if not localhost/127.0.0.1, otherwise use env or localhost:3001
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_BASE_URL = isLocal
    ? (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')
    : 'https://fongbeev1-backe-end.onrender.com/api';

// Get token from storage
export const getToken = (): string | null => {
    try {
        return uni.getStorageSync('user_token') || null;
    } catch {
        return null;
    }
};

// Set token to storage
export const setToken = (token: string) => {
    uni.setStorageSync('user_token', token);
};

// Remove token
export const removeToken = () => {
    uni.removeStorageSync('user_token');
};

// Get user info
export const getUserInfo = (): any | null => {
    try {
        const userStr = uni.getStorageSync('user_info');
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

// Set user info
export const setUserInfo = (user: any) => {
    uni.setStorageSync('user_info', JSON.stringify(user));
};

// Remove user info
export const removeUserInfo = () => {
    uni.removeStorageSync('user_info');
};

// Check if logged in
export const isLoggedIn = (): boolean => {
    return !!getToken();
};

// Logout
export const logout = () => {
    removeToken();
    removeUserInfo();
};

export const clearAuth = logout;

// Generic request wrapper
interface RequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    header?: Record<string, string>;
}

async function request<T>(
    endpoint: string,
    options: RequestConfig = {}
): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.header || {}),
    };

    return new Promise((resolve, reject) => {
        uni.request({
            url: `${API_BASE_URL}${endpoint}`,
            method: options.method || 'GET',
            data: options.data,
            header: headers,
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data as T);
                } else {
                    const error = res.data as any;
                    // Extract meaningful error message
                    const errorMsg = error?.message || error?.error || `HTTP error! status: ${res.statusCode}`;
                    const details = error?.errors ? ` (${error.errors.join(', ')})` : '';
                    reject(new Error(errorMsg + details));
                }
            },
            fail: (err) => {
                reject(new Error(err.errMsg || 'Network request failed'));
            },
        });
    });
}

// ============ Auth API ============
export const authApi = {
    // User login
    login: (data: any) =>
        request<{ message: string; user: any; token: string }>('/auth/login', {
            method: 'POST',
            data,
        }),

    // Register
    register: (data: { email: string; password: string; name?: string; phone?: string; role?: 'user' | 'provider' | 'sales'; code?: string; inviteCode?: string }) =>
        request<{ message: string; user: any; token: string }>('/auth/register', {
            method: 'POST',
            data,
        }),

    // Google Login
    googleLogin: (data: { code: string }) =>
        request<{ message: string; user: any; token: string }>('/auth/google', {
            method: 'POST',
            data,
        }),

    // Apple Login
    appleLogin: (data: { id_token: string, user?: any }) =>
        request<{ message: string; user: any; token: string }>('/auth/apple', {
            method: 'POST',
            data,
        }),

    // Send Verification Code (Email)
    sendCode: (email: string, type: 'register' | 'login' | 'reset_password' | 'change_contact' | 'change_email') =>
        request<{ message: string }>('/auth/send-code', {
            method: 'POST',
            data: { email, type },
        }),
    sendPhoneCode: (phone: string, type: 'register' | 'login' | 'change_phone' | 'change_contact') =>
        request<{ message: string }>('/auth/send-code', {
            method: 'POST',
            data: { phone, type },
        }),

    // Reset Password
    resetPassword: (email: string, code: string, newPassword: string) =>
        request<{ message: string }>('/auth/reset-password', {
            method: 'POST',
            data: { email, code, newPassword },
        }),

    // Update Profile
    updateProfile: (data: { name?: string; avatar?: string; phone?: string; email?: string; code?: string }) =>
        request<{ user: any; message: string }>('/auth/profile', {
            method: 'PUT',
            data,
        }),

    // Update Contact (Phone/Email with verification)
    updateContact: (type: 'phone' | 'email', value: string, code: string) =>
        request<{ user: any; message: string }>('/auth/update-contact', {
            method: 'POST',
            data: { type, value, code },
        }),

    // Get Provider Profile
    getProviderProfile: () => request<{ profile: any }>('/providers/me'),

    // Update Provider Profile
    updateProviderProfile: (data: any) =>
        request<{ profile: any; message: string }>('/providers/me/profile', {
            method: 'PUT',
            data,
        }),

    // Change Password
    changePassword: (data: { oldPassword: string; newPassword: string }) =>
        request<{ message: string }>('/auth/change-password', {
            method: 'POST',
            data,
        }),
};

// ============ Upload API ============
export const uploadApi = {
    uploadFile: (filePath: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            uni.uploadFile({
                url: `${API_BASE_URL}/upload`,
                filePath: filePath,
                name: 'file',
                header: {
                    'Authorization': `Bearer ${getToken()}`
                },
                success: (res) => {
                    try {
                        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                        if (data.success || data.url) {
                            resolve(data.url);
                        } else {
                            reject(new Error(data.error || data.message || '上传失败'));
                        }
                    } catch (e) {
                        reject(new Error('解析上传响应失败'));
                    }
                },
                fail: (err) => {
                    reject(new Error(err.errMsg || '网络请求失败'));
                }
            });
        });
    }
};

// ============ Form Templates API ============
export const formTemplatesApi = {
    // Get published templates (for users)
    getPublished: (type?: string, category?: string) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (category) params.append('category', category);
        const query = params.toString();
        return request<{ templates: any[] }>(`/form-templates/published${query ? `?${query}` : ''}`);
    },

    // Get single template
    getById: (id: string) =>
        request<{ template: any }>(`/form-templates/${id}`),
};

// ============ Providers API ============
export const providersApi = {
    apply: (data: {
        company_name: string;
        description?: string;
        company_address?: string;
        business_scope?: string;
        license_url?: string;
        website?: string;
        service_city?: string;
        languages?: string;
        phone?: string;
        email?: string;
        extra_data?: any;
    }) =>
        request<{ message: string; profile: any }>('/providers/apply', {
            method: 'POST',
            data,
        }),

    getMyProfile: () => request<{ profile: any }>('/providers/me'),

    // Update Provider Profile
    updateProfile: (data: { service_city?: string;[key: string]: any }) =>
        request<{ message: string; profile: any }>('/providers/me/profile', {
            method: 'PUT',
            data,
        }),

    // Apply for additional service types
    applyServiceType: (data: { category: string; reason?: string; extra_data?: any }) =>
        request<{ message: string; application: any }>('/providers/service-types/apply', {
            method: 'POST',
            data,
        }),

    // Get current provider's applications
    getServiceTypeApplications: () =>
        request<{ applications: any[] }>('/providers/service-types/applications'),

    // Check availability by phone
    checkPhone: (phone: string) =>
        request<{ registered: boolean; isProvider: boolean; user?: any }>('/providers/check-phone-availability', {
            method: 'POST',
            data: { phone }
        }),

    // Send Invite SMS
    sendInvite: (phone: string, serviceName: string, details: { userName?: string; serviceDate?: string; serviceAddress?: string } = {}) =>
        request<{ success: boolean; message: string }>('/providers/send-invite', {
            method: 'POST',
            data: { phone, serviceName, ...details }
        }),

    // Create a new standard service
    createService: (data: {
        category: string;
        categoryId?: string;
        title: string;
        description: string;
        price: number;
        priceUnit: string;
        additionalRate?: number;
        taxIncluded?: boolean;
        inclusions?: string;
        exclusions?: string;
        materialsPolicy?: string;
        extraFees?: string;
        duration?: number | null;
        serviceArea?: string;
        advanceBooking?: number;
        clientRequirements?: string;
        cancellationPolicy?: string;
        isLicensed?: boolean;
        hasInsurance?: boolean;
        addOns?: { name: string; price: string }[];
        images?: string[];
    }) =>
        request<{ message: string; service: any }>('/providers/services', {
            method: 'POST',
            data,
        }),

    // Get provider's services
    getMyServices: (params?: { status?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return request<{ services: any[] }>(`/providers/services${query ? `?${query}` : ''}`);
    },

    // Get public provider profile
    getPublicProfile: (id: string) =>
        request<{ profile: any }>(`/providers/${id}/public-profile`),
};

// ============ Submissions API ============
export const submissionsApi = {
    // Create submission
    create: (data: { templateId: string; formData: Record<string, any> }) =>
        request<{ message: string; submission: any }>('/submissions', {
            method: 'POST',
            data,
        }),

    // Update submission
    update: (id: string, data: { formData: Record<string, any> }) =>
        request<{ message: string; submission: any }>(`/submissions/${id}`, {
            method: 'PUT',
            data,
        }),

    // Cancel submission
    cancel: (id: string) =>
        request<{ message: string; submission: any }>(`/submissions/${id}/cancel`, {
            method: 'POST',
        }),

    // Get user's submissions
    getMySubmissions: (params?: { page?: number; size?: number; status?: string; scope?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return request<{ submissions: any[]; total: number; page: number; size: number }>(
            `/submissions${query ? `?${query}` : ''}`
        );
    },

    // Get single submission
    getById: (id: string) =>
        request<{ submission: any }>(`/submissions/${id}`),

    // Get available orders for providers (order hall)
    getAvailable: (params?: { page?: number; size?: number }) => {
        const query = new URLSearchParams({
            scope: 'available',
            ...(params || {})
        } as any).toString();
        return request<{ submissions: any[]; total: number; page: number; size: number }>(
            `/submissions?${query}`
        );
    },

    // Accept/grab an order (LEGACY - use verify + quote now)
    accept: (id: string) =>
        request<{ message: string; submission: any }>(`/submissions/${id}/accept`, {
            method: 'POST',
        }),

    // Get matching providers for a submission (user view)
    getMatchingProviders: (id: string) =>
        request<{ providers: any[]; total: number; quoted_count: number; category: string }>(`/submissions/${id}/matching-providers`),
};

// ============ Quotes API ============
export const quotesApi = {
    // Create quote (Deducts credits)
    create: (data: { submissionId: string; price: number; message: string; deposit?: number }) =>
        request<{ message: string; quote: any; remainingCredits: number }>('/quotes', {
            method: 'POST',
            data,
        }),

    // Get quote credit cost for a submission
    getQuoteCost: (submissionId: string) =>
        request<{ cost: number; currentCredits: number; remainingAfterQuote: number; canQuote: boolean }>(`/quotes/cost/${submissionId}`),

    // Get quotes for a submission (User side)
    getBySubmission: (submissionId: string) =>
        request<{ quotes: any[] }>(`/quotes/submission/${submissionId}`),

    accept: (quoteId: string) =>
        request<{ message: string; provider_id: string }>('/quotes/' + quoteId + '/accept', {
            method: 'POST'
        }),

    // Get my quotes (Provider side)
    getMyQuotes: () =>
        request<{ quotes: any[] }>('/quotes/my-quotes'),
};



// ============ Service Categories API ============
export const categoriesApi = {
    getAll: (params?: { service_type?: 'standard' | 'custom' }) => {
        const query = params ? new URLSearchParams(params as any).toString() : '';
        return request<{ categories: any[] }>(`/categories${query ? `?${query}` : ''}`);
    },
};

// ============ Services API (Public) ============
export const servicesApi = {
    getOfferings: (params?: { city?: string; category?: string }) => {
        const query = params ? new URLSearchParams(params as any).toString() : '';
        return request<{ services: any[] }>(`/services/offerings${query ? `?${query}` : ''}`);
    },
    getOfferingById: (id: string) =>
        request<{ service: any }>(`/services/offerings/${id}`),
};

// ============ Cities API ============
export const citiesApi = {
    getActive: () => request<any[]>('/cities/active'),
};

// ============ AI API ============
export const aiApi = {
    rewrite: (text: string, context: string) =>
        request<{ original: string; enhanced: string; message: string }>('/ai/rewrite', {
            method: 'POST',
            data: { text, context, language: 'zh' },
        }),
};

// ============ Notifications API ============
export const notificationsApi = {
    getCount: (role?: string) => request<{ count: number }>(`/notifications/count${role ? `?role=${role}` : ''}`),
    getList: () => request<{ notifications: any[] }>('/notifications'),
    markAsRead: (id: string) => request<{ success: boolean; }>(`/notifications/${id}/read`, {
        method: 'POST'
    }),
};

// ============ Payment API ============
export const paymentApi = {
    // List saved payment methods
    getMethods: () => request<{ methods: any[] }>('/payment/methods'),

    // Create setup intent (for adding new card)
    createSetupIntent: () => request<{ clientSecret: string; customerId: string }>('/payment/setup-intent', {
        method: 'POST'
    }),

    // Set default payment method
    setDefaultMethod: (paymentMethodId: string) => request<{ success: boolean }>('/payment/set-default', {
        method: 'POST',
        data: { paymentMethodId }
    }),
};

// ============ Address API ============
export const addressApi = {
    getAll: () => request<{ addresses: any[] }>('/addresses'),
    create: (data: any) => request<{ address: any }>('/addresses', { method: 'POST', data }),
    update: (id: string, data: any) => request<{ address: any }>(`/addresses/${id}`, { method: 'PUT', data }),
    delete: (id: string) => request<{ success: boolean }>(`/addresses/${id}`, { method: 'DELETE' }),
};

// ============ Order Payments API ============
export const ordersApi = {
    payDeposit: (orderId: string, paymentMethodId?: string) =>
        request<{ message: string; status: string }>(`/orders/${orderId}/pay-deposit`, {
            method: 'POST',
            data: { paymentMethodId }
        }),

    confirmStart: (orderId: string) =>
        request<{ message: string }>(`/orders/${orderId}/confirm-start`, {
            method: 'POST'
        }),

    payBalance: (orderId: string, method: 'online' | 'offline') =>
        request<{ message: string }>(`/orders/${orderId}/pay-balance`, {
            method: 'POST',
            data: { method }
        }),
};

// ============ Orders V2 API (Provider Order Management) ============
export const ordersV2Api = {
    getMyOrders: (params?: { role?: string; status?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return request<{ success: boolean; orders: any[] }>(`/orders-v2${query ? `?${query}` : ''}`);
    },

    create: (data: any) =>
        request<{ success: boolean; order: any; message: string }>('/orders-v2', {
            method: 'POST',
            data
        }),

    startService: (orderId: string) =>
        request<{ success: boolean; message: string }>(`/orders-v2/${orderId}/start`, {
            method: 'POST'
        }),

    startServiceV2: (orderId: string, data: { photos: string[]; description: string }) =>
        request<{ success: boolean; message: string }>(`/orders-v2/${orderId}/start-service-v2`, {
            method: 'POST',
            data
        }),

    confirmStart: (orderId: string) =>
        request<{ success: boolean; message: string }>(`/orders-v2/${orderId}/confirm-start`, {
            method: 'POST'
        }),

    refuseStart: (orderId: string, reason: string) =>
        request<{ success: boolean; message: string }>(`/orders-v2/${orderId}/refuse-start`, {
            method: 'POST',
            data: { reason }
        }),

    submitCompletion: (orderId: string, data: { photos: string[]; description: string }) =>
        request<{ success: boolean; message: string }>(`/orders-v2/${orderId}/submit-completion`, {
            method: 'POST',
            data
        }),

    verifyCode: (orderId: string, code: string) =>
        request<{ success: boolean; message: string }>(`/orders-v2/${orderId}/verify-code`, {
            method: 'POST',
            data: { code }
        }),

    // Redundant acceptance request methods removed

    cancel: (orderId: string, data: { reason?: string }) =>
        request<{ success: boolean; message: string }>(`/orders-v2/${orderId}/cancel`, {
            method: 'POST',
            data
        }),

    accept: (orderId: string) =>
        request<{ success: boolean; message: string }>(`/orders-v2/${orderId}/accept`, {
            method: 'POST'
        }),

    getOrderByNo: (orderNo: string) =>
        request<{ success: boolean; order: { id: string; order_no: string; provider_access_token: string } }>(`/orders-v2/by-no/${orderNo}`),

    getById: (id: string) =>
        request<{ success: boolean; order: any }>('/orders-v2/' + id),
};

// Health check
export const healthCheck = () => request<{ status: string; timestamp: string }>('/health');

// ============ Admin API ============
export const adminApi = {
    getFinanceSummary: () => request<{ stripe_balance: number; escrow_balance: number; platform_revenue: number }>('/admin/finance/summary'),
    updateBankAccount: () => request<{ message: string }>('/admin/finance/bank-account', { method: 'POST' })
};

export const bannersApi = {
    getActive: () => request<any[]>('/banners/active')
};

export const smsTemplatesApi = {
    getAll: () => request<{ templates: any[] }>('/sms-templates'),
    update: (id: string, data: { content: string; description?: string }) =>
        request<{ message: string; template: any }>(`/sms-templates/${id}`, {
            method: 'PUT',
            data
        })
};

// ============ Sales API ============
export const salesApi = {
    getProfile: () => request<{ profile: any }>('/sales/profile'),
    getCommissions: () => request<{ logs: any[] }>('/sales/commissions'),
    getMyProviders: () => request<{ providers: any[] }>('/sales/my-providers'),
    getTickets: () => request<{ tickets: any[] }>('/sales/tickets'),
    sendInvite: (contact: string, role: 'provider' | 'user') =>
        request<{ message: string }>('/sales/invite', { method: 'POST', data: { contact, role } }),
    withdraw: (data: { amount: number; method: string; account: string }) =>
        request<{ message: string }>('/sales/withdraw', { method: 'POST', data }),
    updateSettings: (data: { bonus_enabled: boolean }) =>
        request<{ message: string }>('/sales/settings', { method: 'PUT', data })
};

export const cmsApi = {
    getArticles: (params?: { type?: string; category?: string; status?: string; limit?: number; sort?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return request<{ articles: any[] }>(`/cms?${query}`);
    },
    getArticleById: (id: string | number) => request<{ article: any }>(`/cms/${id}`),
    getArticleBySlug: (slug: string) => request<{ article: any }>(`/cms/slug/${slug}`),
};

// ============ System Settings API ============
export const systemSettingsApi = {
    getAll: () => request<{ success: boolean; settings: Record<string, string> }>('/system-settings'),
};

// ============ Credits API ============
export const creditsApi = {
    getBalance: () => request<{
        success: boolean;
        data: {
            total: number;
            purchased: number;
            subscription: number;
            listings: number;
            subscriptionInfo: any;
        }
    }>('/credits/balance'),
};

// ============ Custom Service Categories API ============
export const customServiceCategoriesApi = {
    getAll: () => request<{ success: boolean; data: any[] }>('/custom-service-categories'),
    getById: (id: string) => request<{ success: boolean; data: any }>(`/custom-service-categories/${id}`),
};

// ============ Subscription Plans API ============
export const subscriptionPlansApi = {
    getAll: () => request<{ success: boolean; data: any[] }>('/subscription-plans'),
    getById: (id: string) => request<{ success: boolean; data: any }>(`/subscription-plans/${id}`),
};

// ============ User Subscription API ============
export const userSubscriptionApi = {
    getCurrent: () => request<{ success: boolean; data: any }>('/user/subscription'),
    subscribe: (planId: string, billingCycle: 'monthly' | 'yearly') =>
        request<{ success: boolean; data: any }>('/user/subscription/subscribe', {
            method: 'POST',
            data: { plan_id: planId, billing_cycle: billingCycle }
        }),
    cancel: () => request<{ success: boolean; message: string }>('/user/subscription/cancel', {
        method: 'POST'
    }),
    getHistory: () => request<{ success: boolean; data: any[] }>('/user/subscription/history'),
};


