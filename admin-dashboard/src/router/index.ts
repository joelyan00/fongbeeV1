import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/DashboardLayout.vue'),
            children: [
                {
                    path: '',
                    name: 'home',
                    component: () => import('../views/HomeView.vue')
                },
                // 分类管理
                {
                    path: 'categories',
                    name: 'categories',
                    component: () => import('../views/categories/CategoryListView.vue')
                },
                // 表单管理
                {
                    path: 'forms',
                    name: 'forms',
                    component: () => import('../views/forms/FormListView.vue')
                },
                {
                    path: 'forms/:id',
                    name: 'form-edit',
                    component: () => import('../views/forms/FormEditView.vue')
                },
                // 需求管理
                {
                    path: 'requests',
                    name: 'requests',
                    component: () => import('../views/requests/RequestListView.vue')
                },
                {
                    path: 'requests/:id',
                    name: 'request-detail',
                    component: () => import('../views/requests/RequestDetailView.vue')
                },
                // 服务商管理
                {
                    path: 'providers',
                    name: 'providers',
                    component: () => import('../views/providers/ProviderListView.vue')
                },
                {
                    path: 'providers/applications',
                    name: 'provider-applications',
                    component: () => import('../views/providers/CategoryApplicationListView.vue')
                },
                {
                    path: 'providers/:id',
                    name: 'provider-detail',
                    component: () => import('../views/providers/ProviderDetailView.vue')
                },
                // 用户管理
                {
                    path: 'users',
                    name: 'users',
                    component: () => import('../views/users/UserListView.vue')
                },
                {
                    path: 'users/:id',
                    name: 'user-detail',
                    component: () => import('../views/users/UserDetailView.vue')
                },
                // 财务管理
                {
                    path: 'finance',
                    name: 'finance',
                    component: () => import('../views/finance/FinanceView.vue')
                },
                {
                    path: 'banners',
                    name: 'banners',
                    component: () => import('../views/banners/BannerListView.vue')
                },
                // 短信配置
                {
                    path: 'sms-templates',
                    name: 'sms-templates',
                    component: () => import('../views/sms/SmsTemplates.vue')
                },
                // 系统设置
                {
                    path: 'settings',
                    name: 'settings',
                    component: () => import('../views/settings/SettingsView.vue')
                },
                {
                    path: 'cities',
                    name: 'cities',
                    component: () => import('../views/settings/CityListView.vue')
                },
                // 内容管理 (CMS)
                {
                    path: 'cms',
                    name: 'cms-list',
                    component: () => import('../views/cms/ArticleListView.vue')
                },
                {
                    path: 'cms/create',
                    name: 'cms-create',
                    component: () => import('../views/cms/ArticleEditView.vue')
                },
                {
                    path: 'cms/edit/:id',
                    name: 'cms-edit',
                    component: () => import('../views/cms/ArticleEditView.vue')
                }
            ]
        }
    ]
})

export default router
