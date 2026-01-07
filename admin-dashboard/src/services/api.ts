// API configuration
const API_BASE_URL =
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
        ? 'https://fongbeev1-backe-end.onrender.com/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// Get token from localStorage
const getToken = () => localStorage.getItem('admin_token');

// Helper to build query string
const buildQuery = (params: any) => {
    if (!params) return '';
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.append(key, String(value));
        }
    });
    return query.toString();
};

// Generic fetch wrapper
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// ============ Auth API ============
export const authApi = {
    // Admin login
    adminLogin: (email: string, password: string) =>
        request<{ message: string; user: any; token: string }>('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    // User login
    login: (email: string, password: string, code?: string) =>
        request<{ message: string; user: any; token: string; require2fa?: boolean }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, code }),
        }),
    changePassword: (oldPw: string, newPw: string) =>
        request<{ message: string }>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
        }),

    // Get current user
    getMe: () => request<{ user: any }>('/auth/me'),

    // Register
    register: (data: { email: string; password: string; name?: string; phone?: string }) =>
        request<{ message: string; user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ============ Users API ============
export const usersApi = {
    // Get all users (admin)
    getAll: (params?: { page?: number; size?: number; keyword?: string; status?: string; role?: string }) => {
        const query = buildQuery(params);
        return request<{ users: any[]; total: number; page: number; size: number }>(
            `/users${query ? `?${query}` : ''}`
        );
    },

    // Get single user by ID (admin)
    getById: (id: string) =>
        request<{ user: any }>(`/users/${id}`),

    // Get user stats (admin)
    getStats: () =>
        request<{ total: number; active: number; todayNew: number; monthNew: number }>('/users/stats'),

    // Update user status (admin)
    updateStatus: (id: string, status: 'active' | 'disabled') =>
        request<{ message: string; user: any }>(`/users/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),

    // Update user role (admin)
    updateRole: (id: string, role: 'user' | 'provider' | 'admin') =>
        request<{ message: string; user: any }>(`/users/${id}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        }),
    resetPassword: (id: string, password: string) =>
        request<{ message: string }>(`/users/${id}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ password }),
        }),
    inviteSales: (contact: string) =>
        request<{ message: string; link: string }>('/admin/invite-sales', {
            method: 'POST',
            body: JSON.stringify({ contact }),
        }),
    // Sales Partners
    getSalesPartners: () => request<{ partners: any[] }>('/admin/sales-partners'),
    getSalesPartnerDetail: (id: string) => request<{ partner: any; providers: any[] }>(`/admin/sales-partners/${id}`),
};

// ============ Form Templates API ============
export const formTemplatesApi = {
    // Get all templates
    getAll: (params?: { type?: string; status?: string; includeSteps?: boolean }) => {
        const query = buildQuery(params);
        return request<{ templates: any[] }>(`/form-templates${query ? `?${query}` : ''}`);
    },

    // Get published templates (for frontend)
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

    // Create template (admin)
    create: (data: { name: string; description?: string; type: string; steps: any[]; color?: string }) =>
        request<{ message: string; template: any }>('/form-templates', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Update template (admin)
    update: (id: string, data: Partial<{ name: string; description: string; type: string; steps: any[]; color: string; status: string }>) =>
        request<{ message: string; template: any }>(`/form-templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // Publish template (admin)
    publish: (id: string) =>
        request<{ message: string; template: any }>(`/form-templates/${id}/publish`, {
            method: 'PATCH',
        }),

    // Delete template (admin)
    delete: (id: string) =>
        request<{ message: string }>(`/form-templates/${id}`, {
            method: 'DELETE',
        }),
};

// ============ Submissions API ============
export const submissionsApi = {
    // Get submissions
    getAll: (params?: { page?: number; size?: number; status?: string; templateId?: string }) => {
        const query = buildQuery(params);
        return request<{ submissions: any[]; total: number; page: number; size: number }>(
            `/submissions${query ? `?${query}` : ''}`
        );
    },

    // Get submission stats (admin)
    getStats: () =>
        request<{ total: number; pending: number; processing: number; completed: number }>('/submissions/stats'),

    // Get single submission
    getById: (id: string) =>
        request<{ submission: any }>(`/submissions/${id}`),

    // Create submission
    create: (data: { templateId: string; formData: Record<string, any> }) =>
        request<{ message: string; submission: any }>('/submissions', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Update submission status (admin)
    updateStatus: (id: string, status: 'pending' | 'processing' | 'completed' | 'cancelled') =>
        request<{ message: string; submission: any }>(`/submissions/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
};

// ============ Providers API ============
// ============ Providers API ============
export const providersApi = {
    // Get all service type applications (admin)
    getServiceTypeApplications: () =>
        request<{ applications: any[] }>('/providers/admin/applications'),

    // Review application (admin)
    reviewApplication: (id: string, status: 'approved' | 'rejected', reason?: string) =>
        request<{ message: string; application: any }>(`/providers/admin/applications/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, reason }),
        }),

    // Verify provider application (approve/reject initial application)
    verifyProvider: (userId: string, status: 'approved' | 'rejected', reason?: string) => {
        return request(`/providers/admin/verify/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, reason })
        });
    },
    // Get all providers list (admin - includes pending)
    getProvidersList: (params?: { page?: number; size?: number; status?: string; keyword?: string }) => {
        const query = buildQuery(params);
        return request<{ providers: any[]; total: number; page: number; size: number }>(
            `/providers/admin/list${query ? `?${query}` : ''}`
        );
    },

    // Get provider stats
    getStats: () => request<{ stats: { total: number; verified: number; pending: number; frozen: number } }>('/providers/admin/stats'),

    // Update provider credits (admin)
    updateCredits: (userId: string, amount: number, reason: string) =>
        request<{ message: string; credits: number }>(`/providers/admin/${userId}/credits`, {
            method: 'PATCH',
            body: JSON.stringify({ amount, reason }),
        }),
};


// ============ Service Categories API ============
export const categoriesApi = {
    // Get all categories (including disabled) for admin
    getAll: () => request<{ categories: any[] }>('/categories?all=true'),
    create: (data: any) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/categories/${id}`, { method: 'DELETE' })
};

// Health check
export const healthCheck = () => request<{ status: string; timestamp: string }>('/health');

// ============ Finance API ============
export const financeApi = {
    getSummary: () => request<{ stripe_balance: number; escrow_balance: number; platform_revenue: number }>('/admin/finance/summary'),
    updateBankAccount: () => request<{ message: string }>('/admin/finance/bank-account', { method: 'POST' }),
    getSettings: () => request<{ platform_fee_percent: number }>('/admin/system/settings'),
    updateSettings: (data: { platform_fee_percent: number }) => request<{ message: string }>('/admin/system/settings', { method: 'POST', body: JSON.stringify(data) })
};

export const bannersApi = {
    getAll: () => request<any[]>('/banners'),
    create: (data: any) => request<any>('/banners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/banners/${id}`, { method: 'DELETE' }),
    getActive: () => request<any[]>('/banners/active')
};

// ============ SMS Templates API ============
export const smsTemplatesApi = {
    getAll: () => request<{ templates: any[] }>('/sms-templates'),
    update: (id: string, data: any) =>
        request<{ message: string; template: any }>(`/sms-templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// ============ Cities API ============
export const citiesApi = {
    getAll: () => request<any[]>('/cities'),
    getActive: () => request<any[]>('/cities/active'),
    create: (data: any) => request<any>('/cities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/cities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/cities/${id}`, { method: 'DELETE' }),
};

// ============ Admin Submissions API ============
export const adminSubmissionsApi = {
    // Get standard service orders
    getStandardOrders: (params?: { page?: number; size?: number; status?: string; keyword?: string }) => {
        const query = buildQuery(params);
        return request<{ orders: any[]; total: number }>(`/admin/submissions/standard-orders${query ? `?${query}` : ''}`);
    },

    // Get listing applications (providers applying to list services)
    getListingApplications: (params?: { page?: number; size?: number; type?: string }) => {
        const query = buildQuery(params);
        return request<{ submissions: any[]; total: number }>(`/admin/submissions/listing-applications${query ? `?${query}` : ''}`);
    },

    // Approve listing application
    approveListingApplication: (id: string, source?: string) =>
        request<{ message: string }>(`/admin/submissions/${id}/approve-listing`, {
            method: 'POST',
            body: JSON.stringify({ source }),
        }),

    // Reject listing application
    rejectListingApplication: (id: string, reason?: string, source?: string) =>
        request<{ message: string }>(`/admin/submissions/${id}/reject-listing`, {
            method: 'POST',
            body: JSON.stringify({ reason, source }),
        }),
};

// ============ Contracts API ============
export const contractsApi = {
    getAll: () => request<{ templates: any[] }>('/contracts'),
    getById: (id: string) => request<{ template: any }>(`/contracts/${id}`),
    create: (data: { name: string; content: string; status?: string }) =>
        request<{ message: string; template: any }>('/contracts', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    update: (id: string, data: { name?: string; content?: string; status?: string }) =>
        request<{ message: string; template: any }>(`/contracts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    delete: (id: string) => request<{ message: string }>(`/contracts/${id}`, { method: 'DELETE' })
};

