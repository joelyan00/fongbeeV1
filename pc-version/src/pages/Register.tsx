import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Phone, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import Header from '../components/Header';
import SocialLogin from '../components/SocialLogin';
import { authApi, setAuth } from '../services/api';

export default function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [agreed, setAgreed] = useState(false); // Agreement state
    const [showPassword, setShowPassword] = useState(false);

    const isSalesInvite = searchParams.get('role_invite') === 'sales';

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '', // Optional
        phone: '',
        code: '',
        role: isSalesInvite ? 'sales' : 'user' // Default based on invite
    });

    const [countdown, setCountdown] = useState(0);

    // Auto-fill form data from URL if contact provided
    useEffect(() => {
        const contact = searchParams.get('contact');
        if (contact) {
            if (contact.includes('@')) {
                setFormData(prev => ({ ...prev, email: contact }));
            } else {
                setFormData(prev => ({ ...prev, phone: contact }));
            }
        }
    }, [searchParams]);

    const isEmailImported = !!searchParams.get('contact') && searchParams.get('contact')?.includes('@');
    const invitedEmail = searchParams.get('contact');
    const isTrustedEmail = formData.email === invitedEmail && !!invitedEmail;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSendCode = async () => {
        const isSales = formData.role === 'sales';
        if (isSales && !formData.phone) {
            setError('请先输入手机号码');
            return;
        }
        if (!isSales && !formData.email) {
            setError('请先输入电子邮箱');
            return;
        }

        if (countdown > 0) return;

        setLoading(true);
        try {
            await authApi.sendCode(isSales
                ? { phone: formData.phone, type: 'register' }
                : { email: formData.email, type: 'register' }
            );
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            setError('');
        } catch (e: any) {
            setError(e.message || '发送验证码失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (formData.role === 'sales') {
            if (!formData.name || !formData.phone || !formData.email || !formData.code || !formData.password) {
                setError('请完整填写个人信息 (真实姓名、手机、邮箱、验证码、密码)');
                return;
            }
        } else {
            if (!formData.email || !formData.password || (!isTrustedEmail && !formData.code)) {
                setError(isTrustedEmail ? '请填写邮箱和密码' : '请填写必填项 (邮箱、验证码、密码)');
                return;
            }
            if (!agreed) {
                setError('请阅读并同意服务条款和隐私政策');
                return;
            }
        }

        if (formData.password.length < 6) {
            setError('密码长度至少需要6位');
            return;
        }

        setLoading(true);
        try {
            const { email, password, name, phone, code, role } = formData;
            const inviteCode = searchParams.get('ref'); // Get referral code from URL
            // Send request with code and inviteCode
            const res = await authApi.register({ email, password, name, phone, code, role, inviteCode });

            if (res.token) {
                setAuth(res.token, res.user);
            }

            navigate('/');
        } catch (err: any) {
            setError(err.message || '注册失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <Header />

            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                    <div>
                        <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 mb-6">
                            <span className="text-white font-bold text-2xl font-serif">Y</span>
                        </div>
                        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                            创建优服佳账号
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            已有账号？
                            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 ml-1">
                                立即登录
                            </Link>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="text-sm text-red-700">{error}</div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {formData.role === 'sales' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="name"
                                            type="text"
                                            className="appearance-none rounded-xl relative block w-full pl-12 pr-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                                            placeholder="真实姓名"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="phone"
                                            type="tel"
                                            className="appearance-none rounded-xl relative block w-full pl-12 pr-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                                            placeholder="手机号码"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <label htmlFor="email" className="sr-only">电子邮箱</label>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    readOnly={formData.role === 'sales' && isEmailImported}
                                    className={`appearance-none rounded-xl relative block w-full pl-12 pr-12 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all ${formData.role === 'sales' && isEmailImported ? 'bg-gray-50 text-gray-500' : ''}`}
                                    placeholder="电子邮箱"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {isTrustedEmail && (
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-emerald-500">
                                        <Check className="h-5 w-5" />
                                    </div>
                                )}
                            </div>

                            {isTrustedEmail && formData.role === 'user' && (
                                <p className="text-xs text-emerald-600 mt-1 ml-1 animate-in fade-in duration-300 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    受邀邮箱已通过验证，无需发送验证码。
                                </p>
                            )}

                            {(formData.role === 'sales' || !isTrustedEmail) && (
                                <div className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="code"
                                            name="code"
                                            type="text"
                                            className="appearance-none rounded-xl relative block w-full pl-12 pr-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                                            placeholder={formData.role === 'sales' ? "手机验证码" : "邮箱验证码"}
                                            value={formData.code}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={countdown > 0}
                                        className="whitespace-nowrap px-4 py-3 border border-primary-200 text-sm font-medium rounded-xl text-primary-700 bg-primary-50 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-32"
                                    >
                                        {countdown > 0 ? `${countdown}s` : '获取验证码'}
                                    </button>
                                </div>
                            )}

                            <div className="relative">
                                <label htmlFor="password" className="sr-only">密码</label>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none rounded-xl relative block w-full pl-12 pr-12 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                                    placeholder="密码 (至少6位)"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {!isSalesInvite && formData.role !== 'sales' && (
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="agreement"
                                        name="agreement"
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="agreement" className="font-medium text-gray-600 cursor-pointer select-none">
                                        我已阅读并接受 <a href="#" className="text-primary-600 hover:text-primary-500">用户协议</a> 和 <a href="#" className="text-primary-600 hover:text-primary-500">隐私政策</a>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Sales Role Option - Only Visible via Invite */}
                        {isSalesInvite && (
                            <div className="flex items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <input
                                    id="is_sales"
                                    type="checkbox"
                                    checked={formData.role === 'sales'}
                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                                    onChange={(e) => setFormData({ ...formData, role: e.target.checked ? 'sales' : 'user' })}
                                />
                                <label htmlFor="is_sales" className="ml-3 text-sm font-bold text-emerald-700 cursor-pointer">
                                    注册成为销售合伙人，我阅读并接受
                                    <a href="#" className="underline hover:text-emerald-900 mx-1" onClick={(e) => e.stopPropagation()}>合伙人协议</a>
                                    和
                                    <a href="#" className="underline hover:text-emerald-900 mx-1" onClick={(e) => e.stopPropagation()}>隐私协议</a>
                                </label>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-primary-500/30"
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? '注册中...' : '注册账号'}
                            </button>
                        </div>

                        {!isSalesInvite && <SocialLogin />}
                    </form>
                </div>
            </div>

            {/* Simple Footer */}
            <div className="py-6 text-center text-gray-400 text-sm border-t border-gray-100">
                © 2025 YouFuJia Home Services
            </div>
        </div>
    );
}
