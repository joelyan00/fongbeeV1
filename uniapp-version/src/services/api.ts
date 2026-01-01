// API configuration for UniApp
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get token from storage
const getToken = (): string | null => {
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
                    reject(new Error(error?.error || `HTTP error! status: ${res.statusCode}`));
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

    // Send Verification Code
    sendCode: (email: string, type: 'register' | 'reset_password' | 'login') =>
        request<{ message: string }>('/auth/send-code', {
            method: 'POST',
            data: { email, type },
        }),

    // Reset Password
    resetPassword: (email: string, code: string, newPassword: string) =>
        request<{ message: string }>('/auth/reset-password', {
            method: 'POST',
            data: { email, code, newPassword },
        }),
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

    // Get my quotes (Provider side)
    getMyQuotes: () =>
        request<{ quotes: any[] }>('/quotes/my-quotes'),

    // Accept/Hire quote (User side)
    accept: (quoteId: string) =>
        request<{ message: string; provider_id: string }>('/quotes/' + quoteId + '/accept', {
            method: 'POST'
        }),
};


// ============ Service Categories API ============
export const categoriesApi = {
    getAll: () => request<{ categories: any[] }>('/categories'),
};

// ============ Notifications API ============
export const notificationsApi = {
    getCount: () => request<{ count: number }>('/notifications/count'),
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
    getMyProviders: () => request<{ providers: any[] }>('/sales/providers'),
    getTickets: () => request<{ tickets: any[] }>('/sales/tickets'),
    sendInvite: (contact: string, type: 'provider' | 'user') =>
        request<{ message: string }>('/sales/invite', { method: 'POST', data: { contact, type } }),
    withdraw: (data: { amount: number; method: string; account: string }) =>
        request<{ message: string }>('/sales/withdraw', { method: 'POST', data }),
    updateSettings: (data: { bonus_enabled: boolean }) =>
        request<{ message: string }>('/sales/settings', { method: 'PUT', data })
};

