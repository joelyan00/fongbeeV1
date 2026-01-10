import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    CheckSquare,
    ClipboardList,
    Settings,
    Users,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { getUserInfo, logout } from '../services/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('standard_orders');

    useEffect(() => {
        const user = getUserInfo();
        if (!user || user.role !== 'admin') {
            // Basic protection, redirect if not admin
            // But for dev we might allow access or login handling does it
            if (!user) navigate('/login');
        }
        setUserInfo(user);
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SidebarItem = ({ id, label, icon: Icon, active = false }: any) => (
        <div
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm font-medium transition-colors border-r-2 ${active
                ? 'text-primary-600 bg-primary-50 border-primary-600'
                : 'text-gray-600 hover:bg-gray-50 border-transparent'
                }`}
            onClick={() => setActiveTab(id)}
        >
            {Icon && <Icon size={18} />}
            {label}
        </div>
    );

    const SidebarSection = ({ title, children }: any) => (
        <div className="mb-6">
            <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</div>
            {children}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold font-serif">A</div>
                    <span className="text-sm font-medium text-gray-500 border-l border-gray-200 pl-4">网站管理后台</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-gray-800">{userInfo?.name || 'Administrator'}</div>
                        <div className="text-xs text-blue-600">Super Admin</div>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 bg-white border-r border-gray-200 py-6 overflow-y-auto hidden md:block">
                    <SidebarItem id="dashboard" label="概览" icon={LayoutDashboard} active={activeTab === 'dashboard'} />
                    <div className="h-6"></div>

                    <SidebarSection title="入驻管理">
                        <SidebarItem id="provider_apps" label="服务商入驻申请" icon={CheckSquare} active={activeTab === 'provider_apps'} />
                        <SidebarItem id="onboarding_forms" label="入驻申请表单" icon={FileText} active={activeTab === 'onboarding_forms'} />
                    </SidebarSection>

                    <SidebarSection title="服务模版管理">
                        <SidebarItem id="standard_blueprints" label="标准服务模版" icon={FileText} active={activeTab === 'standard_blueprints'} />
                        <SidebarItem id="simple_custom_blueprints" label="简单定制模版" icon={FileText} active={activeTab === 'simple_custom_blueprints'} />
                        <SidebarItem id="complex_custom_blueprints" label="复杂定制模版" icon={FileText} active={activeTab === 'complex_custom_blueprints'} />
                    </SidebarSection>

                    <SidebarSection title="订单管理">
                        <SidebarItem id="standard_orders" label="标准服务订单" icon={ClipboardList} active={activeTab === 'standard_orders'} />
                        <SidebarItem id="custom_orders" label="定制服务订单" icon={ClipboardList} active={activeTab === 'custom_orders'} />
                    </SidebarSection>

                    <SidebarSection title="系统设置">
                        <SidebarItem id="settings" label="平台设置" icon={Settings} active={activeTab === 'settings'} />
                    </SidebarSection>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {activeTab === 'dashboard' && '概览'}
                        {activeTab === 'provider_apps' && '服务商入驻申请'}
                        {activeTab === 'onboarding_forms' && '入驻申请表单'}
                        {activeTab === 'standard_blueprints' && '标准服务模版'}
                        {activeTab === 'simple_custom_blueprints' && '简单定制模版'}
                        {activeTab === 'complex_custom_blueprints' && '复杂定制模版'}
                        {activeTab === 'standard_orders' && '标准服务订单'}
                        {activeTab === 'custom_orders' && '定制服务订单'}
                        {activeTab === 'settings' && '平台设置'}
                    </h2>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
                        {/* Content Placeholder */}
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 mt-20">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                <Settings size={32} className="text-gray-300" />
                            </div>
                            <p>管理功能 "{activeTab}" 正在开发中...</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
