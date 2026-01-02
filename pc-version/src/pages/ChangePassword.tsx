import React, { useState } from 'react';
import MobileHeader from '../components/MobileHeader';
import { authApi } from '../services/api';

export default function ChangePassword() {
    const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ content: string, type: 'success' | 'error' } | null>(null);

    const handleSave = async () => {
        setMsg(null);
        if (!form.oldPassword || !form.newPassword) return setMsg({ content: '请填写完整信息', type: 'error' });
        if (form.newPassword !== form.confirmPassword) return setMsg({ content: '两次密码不一致', type: 'error' });

        setLoading(true);
        try {
            await authApi.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
            setMsg({ content: '密码修改成功，请重新登录', type: 'success' });
            // optionally logout logic here if needed
        } catch (e: any) {
            setMsg({ content: e.message || '修改失败', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-14">
            <MobileHeader title="修改密码" />

            <div className="bg-white mt-2 px-4 py-6 space-y-6">
                <div>
                    <label className="block text-sm text-gray-500 mb-1">原密码</label>
                    <input
                        type="password"
                        value={form.oldPassword}
                        onChange={e => setForm({ ...form, oldPassword: e.target.value })}
                        className="w-full border-b border-gray-200 py-3 text-gray-800 focus:outline-none focus:border-cyan-500 text-base"
                        placeholder="请输入原密码"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-500 mb-1">新密码</label>
                    <input
                        type="password"
                        value={form.newPassword}
                        onChange={e => setForm({ ...form, newPassword: e.target.value })}
                        className="w-full border-b border-gray-200 py-3 text-gray-800 focus:outline-none focus:border-cyan-500 text-base"
                        placeholder="请输入新密码"
                    />
                    <p className="text-xs text-gray-400 mt-2">8-20个字符，需包含大小写字母、数字及特殊字符</p>
                </div>
                <div>
                    <label className="block text-sm text-gray-500 mb-1">确认密码</label>
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                        className="w-full border-b border-gray-200 py-3 text-gray-800 focus:outline-none focus:border-cyan-500 text-base"
                        placeholder="请再次输入新密码"
                    />
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
                    disabled={loading}
                    className="w-full bg-cyan-500 text-white rounded-xl py-3.5 font-medium shadow-lg shadow-cyan-500/30 active:scale-[0.98] transition-all disabled:opacity-70"
                >
                    {loading ? '提交中...' : '确认修改'}
                </button>
            </div>
        </div>
    );
}
