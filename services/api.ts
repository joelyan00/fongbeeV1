// API configuration for React frontend
const API_BASE_URL = 'http://localhost:3001/api';

// Helper to get token (if you implement auth later)
const getToken = (): string | null => {
    return localStorage.getItem('user_token');
};

// Generic request wrapper
async function request<T>(
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
        throw new Error(error?.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

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
    getAll: () => request<{ categories: Category[] }>('/categories'),
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

export const healthCheck = () => request<{ status: string; timestamp: string }>('/health');
