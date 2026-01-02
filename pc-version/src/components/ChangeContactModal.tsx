import React, { useState, useEffect } from 'react';
import { authApi, setAuth, getToken } from '../services/api';

interface ChangeContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'phone' | 'email';
    onSuccess: (user: any) => void;
}

export default function ChangeContactModal({ isOpen, onClose, type, onSuccess }: ChangeContactModalProps) {
    const [value, setValue] = useState('');
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ content: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setValue('');
            setCode('');
            setTimer(0);
            setMsg(null);
        }
    }, [isOpen]);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    if (!isOpen) return null;

    const showMsg = (content: string, type: 'success' | 'error' = 'error') => {
        setMsg({ content, type });
        // Auto clear success message eventually
        if (type === 'success' && content !== '修改成功') {
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const handleSendCode = async () => {
        setMsg(null);
        if (!value) return showMsg(`请输入新的${type === 'phone' ? '手机号码' : '邮箱地址'}`);
        // Regex Basic Check
        if (type === 'phone' && !/^\d{10,11}$/.test(value)) return showMsg('请输入有效的手机号码');
        if (type === 'email' && !/^.+@.+\..+$/.test(value)) return showMsg('请输入有效的邮箱地址');

        try {
            await authApi.sendCode({ [type]: value, type: 'change_contact' });
            setTimer(60);
            showMsg('验证码已发送', 'success');
        } catch (error: any) {
            showMsg(error.message || '发送失败');
        }
    };

    const handleSave = async () => {
        setMsg(null);
        if (!value || !code) return showMsg('请填写完整信息');
        setLoading(true);
        try {
            const res = await authApi.updateContact({ type, value, code });
            showMsg('修改成功', 'success');

            const token = res.token || getToken();
            if (token) setAuth(token, res.user);

            // Delay close to show success
            setTimeout(() => {
                onSuccess(res.user);
                onClose();
            }, 1000);
        } catch (error: any) {
            showMsg(error.message || '修改失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

                <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">
                    修改{type === 'phone' ? '手机号码' : '邮箱地址'}
                </h2>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm text-gray-600">新的{type === 'phone' ? '手机号码' : '邮箱地址'}</label>
                            {msg && (
                                <span className={`text-xs ${msg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                    {msg.content}
                                </span>
                            )}
                        </div>
                        <input
                            type={type === 'email' ? 'email' : 'tel'}
                            value={value}
                            onChange={e => { setValue(e.target.value); setMsg(null); }}
                            placeholder={`请输入新的${type === 'phone' ? '手机号码' : '邮箱'}`}
                            className={`w-full border rounded px-4 py-2.5 outline-none transition-colors ${msg?.type === 'error' ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-2">验证码</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={code}
                                onChange={e => { setCode(e.target.value); setMsg(null); }}
                                placeholder="输入验证码"
                                className="flex-1 border border-gray-200 rounded px-4 py-2.5 outline-none focus:border-primary-500 transition-colors"
                            />
                            <button
                                onClick={handleSendCode}
                                disabled={timer > 0}
                                className="bg-gray-50 border border-gray-200 text-primary-500 px-4 rounded text-sm min-w-[100px] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {timer > 0 ? `${timer}s后重发` : '获取验证码'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-primary-500 text-white rounded py-3 font-medium hover:bg-primary-600 transition-colors disabled:opacity-70"
                    >
                        {loading ? '保存中...' : '确认修改'}
                    </button>
                </div>
            </div>
        </div>
    );
}
