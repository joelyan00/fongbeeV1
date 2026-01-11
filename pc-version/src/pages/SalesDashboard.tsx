import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import {
    LayoutDashboard, DollarSign, Users, Copy, Check, TrendingUp, CreditCard, MessageSquare, Landmark, Plus, Pencil, Trash2, X, Eye
} from 'lucide-react';
import { salesApi, getUserInfo, isLoggedIn } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function SalesDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    // Invite State
    const [inviteType, setInviteType] = useState<'provider' | 'user'>('provider');
    const [inviteContact, setInviteContact] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);

    // Mock Withdrawal Modal
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showAddPayoutModal, setShowAddPayoutModal] = useState(false);


    useEffect(() => {
        // 1. Check Login Status
        if (!isLoggedIn()) {
            navigate('/login?redirect=/sales-dashboard'); // Redirect to login
            return;
        }

        const u = getUserInfo();
        setUser(u);
        loadData();
    }, [navigate]);

    const loadData = async () => {
        setLoading(true);
        console.log('[SalesDashboard] Loading data...');
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );
            const dataPromise = Promise.all([
                salesApi.getProfile(),
                salesApi.getCommissions(),
                salesApi.getMyProviders(),
                salesApi.getTickets()
            ]);
            const [pRes, cRes, prRes, tRes]: any = await Promise.race([dataPromise, timeoutPromise]);

            setProfile(pRes.profile);
            setLogs(cRes.logs || []);
            setProviders(prRes.providers || []);
            setTickets(tRes.tickets || []);
        } catch (error: any) {
            console.error('[SalesDashboard] Load error:', error);
            showToast('加载数据失败: ' + (error.message || '网络连接异常'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteContact) return showToast('请输入联系方式', 'error');
        setInviteLoading(true);
        try {
            await salesApi.sendInvite(inviteContact, inviteType);
            showToast('邀请发送成功！'); // Custom Toast
            setInviteContact('');
        } catch (error: any) {
            showToast('发送失败: ' + (error.message || 'Unknown error'), 'error');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount) return showToast('请输入提现金额', 'error');
        try {
            await salesApi.withdraw({ amount: Number(withdrawAmount), method: 'bank', account: 'Saved Account' });
            showToast('提现申请已提交');
            setShowWithdrawModal(false);
        } catch (e: any) {
            showToast(e.message, 'error');
        }
    };

    const copyToClipboard = (text: string) => {
        const fallbackCopy = (text: string) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    setCopied(true);
                    showToast('链接已复制到剪贴板');
                    setTimeout(() => setCopied(false), 2000);
                } else {
                    showToast('复制失败，请手动复制', 'error');
                }
            } catch (err) {
                console.error('Fallback copy failed', err);
                showToast('复制失败，请手动复制', 'error');
            }
            document.body.removeChild(textArea);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                showToast('链接已复制到剪贴板');
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    };

    const getReferralLink = () => {
        if (!profile?.referral_code) return '';
        const baseUrl = window.location.origin;
        if (inviteType === 'user') {
            return `${baseUrl}/register?role_invite=user&ref=${profile.referral_code}`;
        }
        return `${baseUrl}/provider-apply?ref=${profile.referral_code}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Header />
                <div className="pt-32 flex justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />


            <div className="max-w-7xl mx-auto pt-28 px-4 pb-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="md:w-1/4 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 font-bold text-2xl">
                                {user?.name?.[0] || 'S'}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                            <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                销售合伙人
                            </span>
                        </div>

                        {/* Navigation */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden text-sm font-bold text-gray-600">
                            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}>
                                <LayoutDashboard className="w-5 h-5" /> 总览
                            </button>
                            <button onClick={() => setActiveTab('providers')} className={`w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'providers' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}>
                                <Users className="w-5 h-5" /> 我的服务商
                            </button>
                            <button onClick={() => setActiveTab('revenue')} className={`w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'revenue' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}>
                                <DollarSign className="w-5 h-5" /> 收益中心
                            </button>
                            <button onClick={() => setActiveTab('support')} className={`w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'support' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}>
                                <MessageSquare className="w-5 h-5" /> 工单协助
                            </button>
                            <button onClick={() => setActiveTab('payout')} className={`w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'payout' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}>
                                <Landmark className="w-5 h-5" /> 收款账户
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl shadow-lg p-6 text-white space-y-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                推广链接 ({inviteType === 'provider' ? '服务商' : '用户'})
                            </h3>
                            <div className="bg-white/10 rounded-lg p-3 text-xs break-all font-mono">
                                {getReferralLink()}
                            </div>
                            <button
                                onClick={() => copyToClipboard(getReferralLink())}
                                className="w-full py-2 bg-white text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? '已复制' : '复制链接'}
                            </button>
                            <div className="pt-2 border-t border-white/20 flex justify-between items-center text-sm">
                                <span>专属邀请码:</span>
                                <span className="font-bold font-mono text-lg tracking-wider">{profile?.referral_code || '---'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:w-3/4 space-y-6">

                        {/* DASHBOARD VIEW */}
                        {activeTab === 'dashboard' && (
                            <>
                                {/* Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                        <div className="flex items-center gap-3 text-gray-500 mb-2">
                                            <DollarSign className="w-5 h-5" />
                                            总收益
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900">${profile?.total_earnings || '0.00'}</div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                        <div className="flex items-center gap-3 text-gray-500 mb-2">
                                            <CreditCard className="w-5 h-5" />
                                            可提现余额
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900">${profile?.current_balance || '0.00'}</div>
                                        <button onClick={() => setShowWithdrawModal(true)} className="mt-4 text-emerald-600 text-sm font-bold hover:underline">申请提现 &rarr;</button>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                        <div className="flex items-center gap-3 text-gray-500 mb-2">
                                            <Users className="w-5 h-5" />
                                            累计服务商
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900">{providers.length}</div>
                                    </div>
                                </div>

                                {/* Invite Form */}
                                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-emerald-500" />
                                        发送邀请
                                    </h3>

                                    {/* Invite Type Toggle */}
                                    <div className="flex p-1 bg-gray-100 rounded-lg mb-4 w-fit">
                                        <button
                                            onClick={() => setInviteType('provider')}
                                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${inviteType === 'provider' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            邀请服务商
                                        </button>
                                        <button
                                            onClick={() => setInviteType('user')}
                                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${inviteType === 'user' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            邀请用户
                                        </button>
                                    </div>

                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                            placeholder={inviteType === 'provider' ? "请输入服务商邮箱或手机号" : "请输入用户邮箱或手机号"}
                                            value={inviteContact}
                                            onChange={e => setInviteContact(e.target.value)}
                                        />
                                        <button
                                            onClick={handleInvite}
                                            disabled={inviteLoading}
                                            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center whitespace-nowrap"
                                        >
                                            {inviteLoading ? '发送中...' : '发送邀请'}
                                        </button>
                                    </div>
                                </div>

                                {/* Promotion Strategy */}
                                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mt-6">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="p-1.5 bg-purple-100 rounded-lg">
                                            <TrendingUp className="w-4 h-4 text-purple-600" />
                                        </div>
                                        推广策略配置
                                    </h3>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div>
                                            <div className="font-bold text-gray-900">赠送新用户积分 (50分)</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                开启后，新用户通过您的链接注册将获得50积分。<br />
                                                <span className="text-orange-600">注意：积分成本将从您的账户余额中扣除 ($0.50/人)。</span>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={profile?.bonus_enabled || false}
                                                onChange={async (e) => {
                                                    const enabled = e.target.checked;
                                                    // Optimistic update
                                                    setProfile({ ...profile, bonus_enabled: enabled });
                                                    try {
                                                        await salesApi.updateSettings({ bonus_enabled: enabled });
                                                    } catch (err) {
                                                        showToast('设置更新失败', 'error');
                                                        setProfile({ ...profile, bonus_enabled: !enabled }); // Revert
                                                    }
                                                }}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* PROVIDERS VIEW */}
                        {activeTab === 'providers' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-900">我的服务商 ({providers.length})</div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 text-gray-500 text-sm">
                                            <tr>
                                                <th className="px-6 py-3 text-left">姓名</th>
                                                <th className="px-6 py-3 text-left">加入时间</th>
                                                <th className="px-6 py-3 text-left">状态</th>
                                                <th className="px-6 py-3 text-left">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {providers.length ? providers.map(p => (
                                                <tr key={p.id}>
                                                    <td className="px-6 py-4 font-medium">{p.name}<div className="text-xs text-gray-400">{p.email || p.phone}</div></td>
                                                    <td className="px-6 py-4 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {p.status === 'active' ? '活跃' : p.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-emerald-600 cursor-pointer font-bold">查看详情</td>
                                                </tr>
                                            )) : <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">暂无服务商</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* REVENUE VIEW */}
                        {activeTab === 'revenue' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center border border-gray-100">
                                    <div>
                                        <div className="text-sm text-gray-500">可提现余额</div>
                                        <div className="text-3xl font-bold text-gray-900">${profile?.current_balance || '0.00'}</div>
                                    </div>
                                    <button onClick={() => setShowWithdrawModal(true)} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">申请提现</button>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-900">佣金流水</div>
                                    {/* Reuse Logs Table Logic */}
                                    <table className="w-full">
                                        <thead className="bg-gray-50 text-gray-500 text-sm">
                                            <tr><th className="px-6 py-3 text-left">时间</th><th className="px-6 py-3 text-left">金额</th><th className="px-6 py-3 text-left">佣金</th><th className="px-6 py-3 text-left">状态</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {logs.map(log => (
                                                <tr key={log.id}>
                                                    <td className="px-6 py-4 text-gray-500">{new Date(log.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">${log.order_amount}</td>
                                                    <td className="px-6 py-4 font-bold text-emerald-600">+${log.commission_amount}</td>
                                                    <td className="px-6 py-4">{log.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TICKETS VIEW */}
                        {activeTab === 'support' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-900">工单列表</div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 text-gray-500 text-sm">
                                            <tr>
                                                <th className="px-6 py-3 text-left">服务商</th>
                                                <th className="px-6 py-3 text-left">主题</th>
                                                <th className="px-6 py-3 text-left">状态</th>
                                                <th className="px-6 py-3 text-left">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {tickets.length ? tickets.map(t => (
                                                <tr key={t.id}>
                                                    <td className="px-6 py-4 font-bold text-gray-900">{t.provider_name}</td>
                                                    <td className="px-6 py-4">{t.subject}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === 'open' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{t.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button className="text-emerald-600 font-bold flex items-center gap-1">
                                                            <MessageSquare className="w-4 h-4" /> 介入沟通
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">暂无相关工单</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* PAYOUT ACCOUNTS VIEW */}
                        {activeTab === 'payout' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="font-bold text-gray-900">收款账户 (Payout Accounts)</h2>
                                    <button
                                        onClick={() => setShowAddPayoutModal(true)}
                                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2 text-sm font-bold"
                                    >
                                        <Plus size={16} />
                                        添加账户
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {/* Mock Bank Account Card */}
                                        <div className="border border-gray-200 rounded-xl p-5 hover:border-emerald-500 transition-colors bg-gradient-to-br from-white to-gray-50 relative overflow-hidden group">
                                            <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
                                                <Landmark size={120} />
                                            </div>
                                            <div className="flex justify-between items-start relative z-10">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                                        <Landmark size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-gray-900 text-lg">TD Canada Trust</h3>
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">默认</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-500 font-mono">
                                                                <span className="text-gray-400 mr-2">INST:</span>004
                                                                <span className="mx-2 text-gray-300">|</span>
                                                                <span className="text-gray-400 mr-2">TRANSIT:</span>12345
                                                            </p>
                                                            <p className="text-sm text-gray-800 font-mono font-medium">
                                                                <span className="text-gray-400 mr-2">ACCT:</span>**** 9876
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="编辑">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center relative z-10">
                                                <span className="text-xs text-gray-400 uppercase tracking-wider">Account Holder</span>
                                                <span className="text-sm font-medium text-gray-700">SALES PARTNER NAME</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg flex gap-3 text-sm text-blue-700">
                                        <div className="shrink-0 mt-0.5">
                                            <Check size={16} />
                                        </div>
                                        <p>为了您的资金安全，收款账户户名必须与实名认证信息一致。目前仅支持加拿大本地银行账户 (CAD)。</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">申请提现</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">提现金额</label>
                                <input type="number" className="w-full px-4 py-2 border rounded-lg" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg">
                                提现通常需 1-3 个工作日审核。
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button onClick={() => setShowWithdrawModal(false)} className="flex-1 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-bold">取消</button>
                                <button onClick={handleWithdraw} className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700">确认提现</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Payout Account Modal */}
            {showAddPayoutModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-lg font-bold text-gray-900">添加银行账户</h3>
                            <button
                                onClick={() => setShowAddPayoutModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. JOHN DOE"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution No.</label>
                                    <input
                                        type="text"
                                        maxLength={3}
                                        placeholder="e.g. 003"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">3 digits</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transit No.</label>
                                    <input
                                        type="text"
                                        maxLength={5}
                                        placeholder="e.g. 12345"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">5 digits</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    maxLength={12}
                                    placeholder="e.g. 1234567"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                />
                                <p className="text-xs text-gray-400 mt-1">7-12 digits</p>
                            </div>

                            <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700 flex gap-2">
                                <div className="shrink-0 mt-0.5"><Eye size={14} /></div>
                                <p>请确保填写正确。错误的银行信息将导致打款失败或资金丢失。</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowAddPayoutModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => {
                                    showToast('添加成功', 'success');
                                    setShowAddPayoutModal(false);
                                }}
                                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium"
                            >
                                保存账户
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
