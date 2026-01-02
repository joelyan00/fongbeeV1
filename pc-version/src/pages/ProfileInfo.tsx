import React, { useState, useEffect } from 'react';
import MobileHeader from '../components/MobileHeader';
import { getUserInfo, authApi, setAuth, getToken } from '../services/api';
import ChangeContactModal from '../components/ChangeContactModal';

export default function ProfileInfo() {
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({ surname: '', name: '' });
    const [saving, setSaving] = useState(false);
    const [contactModal, setContactModal] = useState<{ open: boolean; type: 'phone' | 'email' }>({ open: false, type: 'phone' });
    const [msg, setMsg] = useState<{ content: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const u = getUserInfo();
        setUser(u);
        if (u) {
            setFormData({
                surname: u.name?.charAt(0) || '',
                name: u.name?.slice(1) || ''
            });
        }
    }, [contactModal.open]);

    const handleSave = async () => {
        setMsg(null);
        if (!formData.surname || !formData.name) return setMsg({ content: '请输入完整姓名', type: 'error' });
        setSaving(true);
        try {
            const fullName = formData.surname + formData.name;
            const res = await authApi.updateProfile({ name: fullName });
            setUser(res.user);
            const token = getToken();
            if (token) setAuth(token, res.user);
            setMsg({ content: '保存成功', type: 'success' });
            setTimeout(() => setMsg(null), 2000);
        } catch (e: any) {
            setMsg({ content: e.message || '保存失败', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pt-14">
            <MobileHeader title="个人信息" />

            <div className="bg-white mt-2 px-4 py-6 space-y-6">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-3xl font-bold text-primary-600 shadow-inner">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">姓</label>
                        <input
                            type="text"
                            value={formData.surname}
                            onChange={e => setFormData({ ...formData, surname: e.target.value })}
                            className="w-full border-b border-gray-200 py-3 text-gray-800 focus:outline-none focus:border-cyan-500 bg-transparent text-base"
                            placeholder="请输入姓"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">名</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border-b border-gray-200 py-3 text-gray-800 focus:outline-none focus:border-cyan-500 bg-transparent text-base"
                            placeholder="请输入名"
                        />
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm text-gray-500 mb-1">手机号码</label>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-800 text-base">{user.phone || '未绑定'}</span>
                            <button onClick={() => setContactModal({ open: true, type: 'phone' })} className="text-sm text-cyan-500 font-medium">修改</button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm text-gray-500 mb-1">邮箱</label>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-800 text-base">{user.email || '未绑定'}</span>
                            <button onClick={() => setContactModal({ open: true, type: 'email' })} className="text-sm text-cyan-500 font-medium">修改</button>
                        </div>
                    </div>
                </div>
            </div>

            {msg && (
                <div className={`text-center text-sm py-2 ${msg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                    {msg.content}
                </div>
            )}

            <div className="p-6 mt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-cyan-500 text-white rounded-xl py-3.5 font-medium shadow-lg shadow-cyan-500/30 active:scale-[0.98] transition-all disabled:opacity-70"
                >
                    {saving ? '保存中...' : '保存更改'}
                </button>
            </div>

            <ChangeContactModal
                isOpen={contactModal.open}
                type={contactModal.type}
                onClose={() => setContactModal({ ...contactModal, open: false })}
                onSuccess={(u) => setUser(u)}
            />
        </div>
    );
}
