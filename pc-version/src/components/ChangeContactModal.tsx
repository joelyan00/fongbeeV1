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

    useEffect(() => {
        if (!isOpen) {
            setValue('');
            setCode('');
            setTimer(0);
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

    const handleSendCode = async () => {
        if (!value) return alert(`请输入新的${type === 'phone' ? '手机号码' : '邮箱地址'}`);
        // Regex Basic Check
        if (type === 'phone' && !/^\d{10,11}$/.test(value)) return alert('请输入有效的手机号码');
        if (type === 'email' && !/^.+@.+\..+$/.test(value)) return alert('请输入有效的邮箱地址');

        try {
            await authApi.sendCode({ [type]: value, type: 'change_contact' });
            setTimer(60);
            alert('验证码已发送');
        } catch (error: any) {
            alert(error.message || '发送失败');
        }
    };

    const handleSave = async () => {
        if (!value || !code) return alert('请填写完整信息');
        setLoading(true);
        try {
            const res = await authApi.updateContact({ type, value, code });
            alert('修改成功');
            // Update auth local storage handled by onSuccess or caller?
            // Actually explicit update here is safer
            const token = getToken();
            if (token) setAuth(token, res.user);

            onSuccess(res.user);
            onClose();
        } catch (error: any) {
            alert(error.message || '修改失败');
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
                        <label className="block text-sm text-gray-600 mb-2">新的{type === 'phone' ? '手机号码' : '邮箱地址'}</label>
                        <input
                            type={type === 'email' ? 'email' : 'tel'}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            placeholder={`请输入新的${type === 'phone' ? '手机号码' : '邮箱'}`}
                            className="w-full border border-gray-200 rounded px-4 py-2.5 outline-none focus:border-primary-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-2">验证码</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                placeholder="输入验证码"
                                className="flex-1 border border-gray-200 rounded px-4 py-2.5 outline-none focus:border-primary-500 transition-colors"
                            />
                            <button
                                onClick={handleSendCode}
                                disabled={timer > 0}
                                className="bg-gray-50 border border-gray-200 text-primary-500 px-4 rounded text-sm min-w-[100px] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
