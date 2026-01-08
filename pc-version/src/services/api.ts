// API configuration for React frontend
const API_BASE_URL =
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
        ? 'https://fongbeev1-backe-end.onrender.com/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// Auth Helpers
export const AUTH_CHANGE_EVENT = 'auth-change';

export const getToken = (): string | null => {
    return localStorage.getItem('user_token');
};

export const getUserInfo = (): any | null => {
    try {
        const u = localStorage.getItem('user_info');
        return u ? JSON.parse(u) : null;
    } catch {
        return null;
    }
};

export const isLoggedIn = (): boolean => {
    return !!getToken();
};

export const setAuth = (token: string, user: any) => {
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_info', JSON.stringify(user));
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const clearAuth = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const logout = clearAuth;

// Generic request wrapper
export async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        if (response.status === 401) {
            clearAuth(); // Auto clear invalid token
            // Optional: Redirect to login or dispatch event
            // window.location.href = '/login'; 
        }

        throw new Error(error?.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// ============ Auth API ============
export const authApi = {
    register: (data: any) => request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    login: (data: any) => request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    googleLogin: (data: { code: string }) => request<{ user: any; token: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    sendCode: (data: { email?: string; phone?: string; type: string }) => request('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateProfile: (data: { name: string }) => request<{ user: any; message: string }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    updateContact: (data: { type: 'phone' | 'email'; value: string; code: string }) => request<{ user: any; message: string; token?: string }>('/auth/update-contact', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    changePassword: (data: any) => request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
};

// ============ Service Categories API ============
export interface Category {
    id: string;
    name: string;
    icon: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
}

export const categoriesApi = {
    getAll: (params?: { service_type?: 'standard' | 'custom' }) => {
        const query = params ? new URLSearchParams(params as any).toString() : '';
        return request<{ categories: Category[] }>(`/categories${query ? `?${query}` : ''}`);
    },
    getAllIncludingInactive: () => request<{ categories: Category[] }>('/categories?all=true'),
};

// ============ Form Templates API ============
export interface FormTemplate {
    id: string;
    name: string;
    description?: string;
    type: 'standard' | 'custom';
    status: string;
    color?: string;
    steps?: any[];
}

export const formTemplatesApi = {
    getPublished: (type?: string, category?: string) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (category) params.append('category', category);
        const query = params.toString();
        return request<{ templates: FormTemplate[] }>(`/form-templates/published${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => request<{ template: FormTemplate }>(`/form-templates/${id}`),
};

// ============ CMS API (Articles) ============
export interface Article {
    id: string;
    title: string;
    summary?: string;
    content?: string;
    category?: string; // 'guide', 'health', 'real_estate', 'news'
    cover_image?: string;
    views?: number;
    created_at?: string;
}

export const cmsApi = {
    getArticles: (params: { type?: string; sort?: string; limit?: number } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.type) queryParams.append('type', params.type);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        const query = queryParams.toString();
        return request<{ articles: Article[] }>(`/cms?${query}`);
    },
    getById: (id: string) => request<{ article: Article }>(`/cms/${id}`),
};

// ============ Cities API ============
export interface City {
    id: string;
    name: string;
    code?: string;
}

export const citiesApi = {
    getActive: () => request<City[]>('/cities/active')
};

// ============ AI API ============
export const aiApi = {
    rewrite: (text: string, context: string) =>
        request<{ original: string; enhanced: string; message: string }>('/ai/rewrite', {
            method: 'POST',
            body: JSON.stringify({ text, context, language: 'zh' }),
        }),
};

export const submissionsApi = {
    create: (data: any) => request<{ submission: any }>('/submissions', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getMySubmissions: (params: Record<string, any> = {}) => {
        const query = new URLSearchParams(params).toString();
        return request<{ submissions: any[]; count?: number }>(`/submissions?${query}`);
    },
    getById: (id: string) => request<{ submission: any }>(`/submissions/${id}`),
    update: (id: string, data: any) => request<{ submission: any }>(`/submissions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (id: string) => request<{ success: boolean }>(`/submissions/${id}`, {
        method: 'DELETE'
    }),
};

export const usersApi = {
    getDashboardStats: () => request<{
        stats: {
            custom_orders: number;
            orders: number;
            cart: number;
            inbox: number;
            reviews: number;
        }
    }>('/users/me/dashboard-stats'),
    getCreditsHistory: () => request<{ history: any[] }>('/users/me/credits/history'),
    getReviews: (type: 'written' | 'received' = 'written') => request<{ reviews: any[] }>(`/users/me/reviews?type=${type}`),
};

export const invoicesApi = {
    getMyInvoices: (params: Record<string, any> = {}) => {
        const query = new URLSearchParams(params).toString();
        return request<{ invoices: any[]; count?: number }>(`/invoices?${query}`);
    }
};

export const notificationsApi = {
    getCount: () => request<{ count: number }>('/notifications/count'),
};

export const paymentApi = {
    getMethods: () => request<{ methods: any[] }>('/payment/methods'),
    createSetupIntent: () => request<{ clientSecret: string; customerId: string }>('/payment/setup-intent', { method: 'POST' }),
    setDefaultMethod: (paymentMethodId: string) => request<{ success: boolean }>('/payment/set-default', {
        method: 'POST',
        body: JSON.stringify({ paymentMethodId })
    }),
};

export const addressApi = {
    getAll: () => request<{ addresses: any[] }>('/addresses'),
    create: (data: any) => request<{ address: any }>('/addresses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<{ address: any }>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean }>(`/addresses/${id}`, { method: 'DELETE' }),
};

export const providersApi = {
    applyServiceType: (data: { category: string; reason?: string; extra_data?: any }) =>
        request<{ message: string; application: any }>('/providers/service-types/apply', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getMyProfile: () => request<{ profile: any }>('/providers/me'),

    // Create standard service
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
        serviceCity?: string[]; // Array of city names for filtering
        advanceBooking?: number;
        clientRequirements?: string;
        cancellationPolicy?: string;
        isLicensed?: boolean;
        hasInsurance?: boolean;
        depositRatio?: number; // 0-100
        serviceMode?: string; // offline, remote, store
        addOns?: { name: string; price: string }[];
        images?: string[];
    }) => request<{ message: string; service: any }>('/providers/services', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
};

export const bannersApi = {
    getActive: () => request<any[]>('/banners/active')
};

export const salesApi = {
    getProfile: () => request<{ profile: any }>('/sales/profile'),
    getCommissions: () => request<{ logs: any[] }>('/sales/commissions'),
    sendInvite: (contact: string, role: string) => request<{ success: boolean; message: string }>('/sales/invite', {
        method: 'POST',
        body: JSON.stringify({ contact, role })
    }),
    getMyProviders: () => request<{ providers: any[] }>('/sales/my-providers'),
    withdraw: (data: { amount: number; method: string; account: string }) => request<{ success: boolean; message: string }>('/sales/withdraw', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateSettings: (data: { bonus_enabled: boolean }) => request<{ success: boolean; message: string }>('/sales/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    getTickets: () => request<{ tickets: any[] }>('/sales/tickets'),
};

export const servicesApi = {
    getOfferings: (params?: { city?: string; category?: string }) => {
        const query = params ? new URLSearchParams(params as any).toString() : '';
        return request<{ services: any[] }>(`/services/offerings${query ? `?${query}` : ''}`);
    },
    getOfferingById: (id: string) => request<{ service: any }>(`/services/offerings/${id}`),
};

// ============ Orders V2 API (New Payment System) ============
export const ordersV2Api = {
    // List orders
    getMyOrders: (params: { role?: 'user' | 'provider'; status?: string; page?: number; limit?: number } = {}) => {
        const query = new URLSearchParams(params as any).toString();
        return request<{ success: boolean; orders: any[]; total: number; page: number; limit: number }>(`/orders-v2?${query}`);
    },

    // Get order detail
    getOrder: (id: string) => request<{ success: boolean; order: any }>(`/orders-v2/${id}`),

    // Create order
    create: (data: {
        serviceType: 'standard' | 'simple_custom' | 'complex_custom';
        providerId: string;
        serviceListingId?: string;
        submissionId?: string;
        totalAmount: number;
        depositAmount?: number;
        depositRate?: number;
        currency?: string;
        regretPeriodHours?: number;
        idempotencyKey?: string;
    }) => request<{ success: boolean; order: any; payment: any }>('/orders-v2', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Cancel order
    cancel: (id: string, data: { reason?: string; exemptRating?: boolean }) =>
        request<{ success: boolean; order: any }>(`/orders-v2/${id}/cancel`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),

    // Provider starts service
    startService: (id: string, photoUrl?: string) =>
        request<{ success: boolean; expiresAt: string }>(`/orders-v2/${id}/start`, {
            method: 'PATCH',
            body: JSON.stringify({ photoUrl })
        }),

    // Provider enters verification code
    verifyCode: (id: string, code: string) =>
        request<{ success: boolean; message: string }>(`/orders-v2/${id}/verify-code`, {
            method: 'POST',
            body: JSON.stringify({ code })
        }),

    // Provider requests acceptance
    requestAcceptance: (id: string, photoUrl?: string) =>
        request<{ success: boolean }>(`/orders-v2/${id}/request-acceptance`, {
            method: 'POST',
            body: JSON.stringify({ photoUrl })
        }),

    // User accepts service
    accept: (id: string) =>
        request<{ success: boolean }>(`/orders-v2/${id}/accept`, { method: 'PATCH' }),

    // User requests rework
    rework: (id: string, reason: string) =>
        request<{ success: boolean }>(`/orders-v2/${id}/rework`, {
            method: 'PATCH',
            body: JSON.stringify({ reason })
        }),

    // User rates order
    rate: (id: string, data: { rating: number; comment?: string; photos?: string[] }) =>
        request<{ success: boolean }>(`/orders-v2/${id}/rate`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
};

export const healthCheck = () => request<{ status: string; timestamp: string }>('/health');
