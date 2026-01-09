import { useState, useEffect } from 'react';
import { Smartphone, Monitor, Laptop, Tablet, LogOut, Loader2 } from 'lucide-react';
import { authApi } from '../services/api';

interface Session {
    id: string;
    device_name: string;
    ip_address: string;
    created_at: string;
    last_active_at: string;
    is_current?: boolean;
}

// Get device icon based on device name
function getDeviceIcon(deviceName: string) {
    const name = deviceName.toLowerCase();
    if (name.includes('iphone') || name.includes('android')) return Smartphone;
    if (name.includes('ipad') || name.includes('tablet')) return Tablet;
    if (name.includes('mac') || name.includes('windows') || name.includes('linux')) {
        if (name.includes('mobile')) return Smartphone;
        return name.includes('mac') ? Laptop : Monitor;
    }
    return Monitor;
}

// Format relative time
function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
}

export default function DeviceManagement() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await authApi.getSessions();
            setSessions(res.sessions || []);
        } catch (err: any) {
            setError(err.message || '获取设备列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevoke = async (sessionId: string) => {
        if (!confirm('确定要登出该设备吗？')) return;

        try {
            setRevoking(sessionId);
            await authApi.revokeSession(sessionId);
            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (err: any) {
            setError(err.message || '登出设备失败');
        } finally {
            setRevoking(null);
        }
    };

    const handleLogoutAll = async () => {
        if (!confirm('确定要登出所有其他设备吗？当前设备将保持登录状态。')) return;

        try {
            setLoading(true);
            await authApi.logoutAll();
            await fetchSessions();
        } catch (err: any) {
            setError(err.message || '登出失败');
        } finally {
            setLoading(false);
        }
    };

    if (loading && sessions.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800">已登录设备</h3>
                {sessions.length > 1 && (
                    <button
                        onClick={handleLogoutAll}
                        className="text-sm text-red-500 hover:text-red-600"
                    >
                        登出其他设备
                    </button>
                )}
            </div>

            {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {sessions.map(session => {
                    const Icon = getDeviceIcon(session.device_name);
                    return (
                        <div
                            key={session.id}
                            className={`flex items-center justify-between p-4 bg-white rounded-xl border ${session.is_current ? 'border-primary-200 bg-primary-50/30' : 'border-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${session.is_current ? 'bg-primary-100' : 'bg-gray-100'}`}>
                                    <Icon className={`w-5 h-5 ${session.is_current ? 'text-primary-600' : 'text-gray-500'}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800">{session.device_name}</span>
                                        {session.is_current && (
                                            <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                                                当前设备
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {session.ip_address} · 最后活跃: {formatRelativeTime(session.last_active_at)}
                                    </div>
                                </div>
                            </div>

                            {!session.is_current && (
                                <button
                                    onClick={() => handleRevoke(session.id)}
                                    disabled={revoking === session.id}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="登出该设备"
                                >
                                    {revoking === session.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <LogOut className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-gray-400 text-center pt-2">
                最多支持 3 台设备同时登录
            </p>
        </div>
    );
}
