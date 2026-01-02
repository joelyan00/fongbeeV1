import React, { useState } from 'react';
import MobileHeader from '../components/MobileHeader';

export default function NotificationSettings() {
    const [settings, setSettings] = useState({ sms: true, email: true, site: true });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ content: string, type: 'success' | 'error' } | null>(null);

    const toggle = (key: keyof typeof settings) => {
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleSave = () => {
        setSaving(true);
        setMsg(null);
        setTimeout(() => {
            setMsg({ content: '通知设置已保存', type: 'success' });
            setSaving(false);
            setTimeout(() => setMsg(null), 2000);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-14">
            <MobileHeader title="消息通知设置" />

            <div className="bg-white mt-2">
                {[
                    { key: 'sms', label: '短信通知' },
                    { key: 'email', label: '邮件通知' },
                    { key: 'site', label: '站内消息' }
                ].map((item, idx) => {
                    const k = item.key as keyof typeof settings;
                    return (
                        <div key={k} className="flex items-center justify-between px-4 py-4 border-b border-gray-100 last:border-0">
                            <span className="text-gray-800 font-medium">{item.label}</span>
                            <div
                                onClick={() => toggle(k)}
                                className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${settings[k] ? 'bg-cyan-500' : 'bg-gray-200'}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 ${settings[k] ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {msg && (
                <div className={`text-center text-sm py-4 ${msg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                    {msg.content}
                </div>
            )}

            <div className="p-6 mt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-cyan-500 text-white rounded-xl py-3.5 font-medium shadow-lg shadow-cyan-500/30 active:scale-[0.98] transition-all disabled:opacity-70"
                >
                    {saving ? '保存中...' : '保存设置'}
                </button>
            </div>
        </div>
    );
}
