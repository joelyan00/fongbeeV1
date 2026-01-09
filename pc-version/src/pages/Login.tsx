import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Header from '../components/Header';
import SocialLogin from '../components/SocialLogin';
import { authApi, setAuth, isLoggedIn } from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLoggedIn()) {
            navigate('/');
        }
    }, [navigate]);

    // Login Method State
    const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password'); // Default to password
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        code: ''
    });

    const [countdown, setCountdown] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSendCode = async () => {
        if (!formData.email) {
            setError('请先输入电子邮箱');
            return;
        }
        if (countdown > 0) return;

        try {
            await authApi.sendCode({ email: formData.email, type: 'login' });
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
        } catch (e: any) {
            setError(e.message || '发送验证码失败');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Adjust payload based on method
            const payload = loginMethod === 'password'
                ? { email: formData.email, password: formData.password }
                : { email: formData.email, code: formData.code };

            const res = await authApi.login(payload);

            if (res.token) {
                setAuth(res.token, res.user);
            }

            if (res.user?.role === 'provider') {
                navigate('/provider/dashboard');
            } else if (res.user?.role === 'sales') {
                navigate('/sales-dashboard');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <Header />

            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-10">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                    <div>
                        <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 mb-6">
                            <span className="text-white font-bold text-2xl font-serif">Y</span>
                        </div>
                        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                            欢迎回来
                        </h2>

                        {/* Tabs */}
                        <div className="flex justify-center gap-8 mt-6 border-b border-gray-100 pb-1">
                            <button
                                onClick={() => { setLoginMethod('password'); setError(''); }}
                                className={`pb-2 text-base font-medium transition-all ${loginMethod === 'password' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                密码登录
                            </button>
                            <button
                                onClick={() => { setLoginMethod('code'); setError(''); }}
                                className={`pb-2 text-base font-medium transition-all ${loginMethod === 'code' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                验证码登录
                            </button>
                        </div>
                    </div>

                    <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                        <div className="min-h-[20px]">
                            {error && (
                                <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-start animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div className="text-sm text-red-700">{error}</div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <label htmlFor="email" className="sr-only">电子邮箱</label>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-xl relative block w-full pl-12 pr-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                                    placeholder="电子邮箱"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            {loginMethod === 'password' ? (
                                <div className="relative">
                                    <label htmlFor="password" className="sr-only">密码</label>
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className="appearance-none rounded-xl relative block w-full pl-12 pr-12 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                                        placeholder="密码"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center z-20"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="code"
                                            name="code"
                                            type="text"
                                            required
                                            className="appearance-none rounded-xl relative block w-full pl-12 pr-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                                            placeholder="请输入验证码"
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
                                        {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    记住我
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                                    忘记密码?
                                </a>
                            </div>
                        </div>

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
                                {loading ? '登录中...' : '登录'}
                            </button>
                        </div>

                        <div className="text-center">
                            <span className="text-gray-500 text-sm">还没有账号？</span>
                            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 ml-1 text-sm">
                                立即注册
                            </Link>
                        </div>

                        <SocialLogin />
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
