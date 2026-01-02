import React from 'react';
import MobileHeader from '../components/MobileHeader';
import { User, Lock, Bell, ChevronRight } from 'lucide-react';
import { clearAuth } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("确定要退出登录吗？")) {
            clearAuth();
            navigate('/login');
        }
    };

    const menuItems = [
        { icon: User, label: '个人信息', path: '/settings/profile' },
        { icon: Lock, label: '修改密码', path: '/settings/password' },
        { icon: Bell, label: '消息通知设置', path: '/settings/notifications' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-14">
            <MobileHeader title="个人设置" />

            <div className="mt-2 bg-white">
                {menuItems.map((item, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between px-4 py-4 active:bg-gray-50 cursor-pointer ${idx !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-gray-800">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                ))}
            </div>

            <div className="p-4 mt-8">
                <button
                    onClick={handleLogout}
                    className="w-full bg-white text-gray-600 py-3.5 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors"
                >
                    退出登录
                </button>
            </div>
        </div>
    );
}
