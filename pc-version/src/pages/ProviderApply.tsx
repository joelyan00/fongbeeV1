import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import {
    Check, ArrowRight, User, Phone, Mail, Lock,
    Briefcase, Upload, Trash2, Tag,
    Wrench, Eye, EyeOff, MapPin
} from 'lucide-react';
import {
    categoriesApi, formTemplatesApi, providersApi,
    authApi, isLoggedIn, getUserInfo, setAuth, getToken
} from '../services/api';
import SocialLogin from '../components/SocialLogin';

export default function ProviderApply() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(1); // 1 = Basic Info, 2 = Category, 3 = Details
    const [loading, setLoading] = useState(false);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    // Basic Info Form
    const [basicInfo, setBasicInfo] = useState({
        name: '',
        phone: '',
        email: '',
        addressStreet: '',
        addressCity: '',
        addressProvince: '',
        addressPostalCode: '',
        password: '',
        confirmPassword: '',
        referralCode: '',
        code: ''
    });

    const [countdown, setCountdown] = useState(0);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Category Selection
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [categoryLoading, setCategoryLoading] = useState(true);

    // Details Form (Template based)
    const [template, setTemplate] = useState<any>(null);
    const [formStepIndex, setFormStepIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [templateLoading, setTemplateLoading] = useState(false);

    // Step 2: Service Scope State
    const [serviceScope, setServiceScope] = useState({
        province: 'ON',
        cities: [] as string[],
        languages: [] as string[]
    });

    const PROVINCES = [
        { code: 'BC', label: '卑诗 BC' },
        { code: 'ON', label: '安省 ON' },
        { code: 'AB', label: '阿省 AB' },
        { code: 'QC', label: '魁省 QC' },
        { code: 'MB', label: '曼省 MB' },
        { code: 'SK', label: '萨省 SK' },
    ];

    const CITIES_MAP: Record<string, string[]> = {
        'ON': ['大多伦多地区 (GTA)', '汉密尔顿 (Hamilton)', '渥太华 (Ottawa)', '伦敦 (London)', '温莎 (Windsor)', '滑铁卢 (Waterloo)', '贵湖 (Guelph)', '基奇纳 (Kitchener)', '剑桥 (Cambridge)', '圣凯瑟琳 (St. Catharines)'],
        'BC': ['大温哥华地区', '维多利亚', '基隆拿'],
        'AB': ['卡尔加里', '埃德蒙顿'],
        'QC': ['蒙特利尔', '魁北克城'],
    };

    const LANGUAGES = ['国语', '粤语', '英语', '法语'];

    const toggleCity = (city: string) => {
        setServiceScope(prev => {
            const cities = prev.cities.includes(city)
                ? prev.cities.filter(c => c !== city)
                : [...prev.cities, city];
            return { ...prev, cities };
        });
    };

    const toggleLanguage = (lang: string) => {
        setServiceScope(prev => {
            const languages = prev.languages.includes(lang)
                ? prev.languages.filter(l => l !== lang)
                : [...prev.languages, lang];
            return { ...prev, languages };
        });
    };

    useEffect(() => {
        // Check login status
        const loggedIn = isLoggedIn();
        setIsUserLoggedIn(loggedIn);

        if (loggedIn) {
            const user = getUserInfo();
            if (user) {
                setBasicInfo(prev => ({
                    ...prev,
                    name: user.name || '',
                    phone: user.phone || '',
                    email: user.email || ''
                }));
            }
        }

        // Auto-fill Referral Code from URL
        const ref = searchParams.get('ref') || searchParams.get('code');
        if (ref) {
            setBasicInfo(prev => ({ ...prev, referralCode: ref }));
        }

        // Auto-fill Contact Info from URL
        const contact = searchParams.get('contact');
        if (contact) {
            if (contact.includes('@')) {
                setBasicInfo(prev => ({ ...prev, email: contact }));
            } else {
                setBasicInfo(prev => ({ ...prev, phone: contact }));
            }
        }

        loadCategories();

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
                const { token, user } = event.data;
                // Mock Login Success
                setAuth(token, { ...user, role: 'user' }); // Default role user
                setIsUserLoggedIn(true);

                // Auto-fill form
                setBasicInfo(prev => ({
                    ...prev,
                    name: user.name || prev.name,
                    email: user.email || prev.email,
                }));

                alert('Google 登录成功！');
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [searchParams]);

    const handleSendCode = async () => {
        if (!basicInfo.email) {
            alert('请先输入电子邮箱');
            return;
        }
        if (countdown > 0) return;

        try {
            await authApi.sendCode({ email: basicInfo.email, type: 'register' });
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
            alert('验证码已发送至您的邮箱');
        } catch (e: any) {
            alert(e.message || '发送验证码失败');
        }
    };

    const loadCategories = async () => {
        try {
            const res = await categoriesApi.getAll();
            setCategories(res.categories || []);
        } catch (e) {
            console.error(e);
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleBasicInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors

        // Validation
        let hasError = false;
        const newErrors: Record<string, string> = {};

        if (!basicInfo.addressStreet?.trim()) { newErrors.addressStreet = '请输入街道地址'; hasError = true; }
        if (!basicInfo.addressCity?.trim()) { newErrors.addressCity = '请输入城市'; hasError = true; }
        if (!basicInfo.addressProvince?.trim()) { newErrors.addressProvince = '请输入省份'; hasError = true; }
        if (!basicInfo.addressPostalCode?.trim()) { newErrors.addressPostalCode = '请输入邮政编码'; hasError = true; }

        if (!isUserLoggedIn) {
            if (!basicInfo.code) {
                newErrors.code = '请输入验证码';
                hasError = true;
            }

            if (basicInfo.password.length < 6) {
                newErrors.password = '密码至少需要6位';
                hasError = true;
            }

            if (basicInfo.password !== basicInfo.confirmPassword) {
                newErrors.confirmPassword = '两次输入的密码不一致';
                hasError = true;
            }
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }
        setStep(2);
    };

    const handleCategorySelect = (catName: string) => {
        setSelectedCategory(catName);
    };

    const handleNextStep = () => {
        if (selectedCategory && serviceScope.province && serviceScope.languages.length > 0) {
            loadTemplate(selectedCategory);
        } else {
            alert('请完成所有必填项选择（主营业务、服务区域、服务语言）');
        }
    };

    const loadTemplate = async (catName: string) => {
        setTemplateLoading(true);
        try {
            // provider_reg template
            const res = await formTemplatesApi.getPublished('provider_reg', catName);
            if (res.templates && res.templates.length > 0) {
                setTemplate(res.templates[0]);
                setFormStepIndex(0); // Reset form step
                setStep(3);
            } else {
                alert(`未找到 "${catName}" 的注册表单配置。请联系管理员在后台创建表单。`);
            }
        } catch (e) {
            console.error(e);
            alert('加载表单失败');
        } finally {
            setTemplateLoading(false);
        }
    };

    const handleImageUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Mock upload
        const reader = new FileReader();
        reader.onload = (evt) => {
            const url = evt.target?.result as string;
            setFormData(prev => {
                const arr = prev[key] || [];
                return { ...prev, [key]: [...arr, url] };
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (key: string, idx: number) => {
        setFormData(prev => {
            const arr = [...(prev[key] || [])];
            arr.splice(idx, 1);
            return { ...prev, [key]: arr };
        });
    };

    const handleFormNext = () => {
        // Validate current step
        const fields = template.steps[formStepIndex].fields;
        for (const f of fields) {
            if (f.required && !formData[f.key]) {
                alert('请填写' + f.label);
                return;
            }
        }

        if (formStepIndex < template.steps.length - 1) {
            setFormStepIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. If guest, register first
            let token = getToken();

            if (!isUserLoggedIn) {
                const regRes = await authApi.register({
                    email: basicInfo.email,
                    password: basicInfo.password,
                    name: basicInfo.name,
                    phone: basicInfo.phone,
                    role: 'provider',
                    code: basicInfo.code, // Use actual code
                    referralCode: basicInfo.referralCode // Pass referral code
                });

                // Login implicitly
                setAuth(regRes.token, regRes.user);
                token = regRes.token;
                setIsUserLoggedIn(true);
            }

            // 2. Submit Application
            await providersApi.applyServiceType({
                category: selectedCategory,
                reason: formData.reason || JSON.stringify(formData),
                extra_data: {
                    ...formData,
                    basicInfo: {
                        name: basicInfo.name,
                        phone: basicInfo.phone,
                        email: basicInfo.email
                    },
                    serviceScope // Include service scope in extra_data
                }
            });

            // Success
            alert('申请已提交！我们会尽快审核您的资料。');
            navigate('/profile');

        } catch (e: any) {
            alert(e.message || '提交失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <div className="max-w-3xl mx-auto pt-28 px-4 pb-12">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Progress Header */}
                    <div className="bg-emerald-600 px-8 py-6 text-white">
                        <h1 className="text-2xl font-bold mb-2">服务商入驻</h1>
                        <p className="opacity-90">只需简单的几步，开启您的服务之旅</p>

                        <div className="flex items-center mt-6 text-sm font-medium">
                            <div className={`flex items-center gap-2 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step > 1 ? 'bg-emerald-800 text-emerald-200' : 'bg-white text-emerald-600'}`}>{step > 1 ? <Check className="w-4 h-4" /> : '1'}</span>
                                账户信息
                            </div>
                            <div className="w-12 h-px bg-white/30 mx-4"></div>
                            <div className={`flex items-center gap-2 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step > 2 ? 'bg-emerald-800 text-emerald-200' : 'bg-white text-emerald-600'}`}>{step > 2 ? <Check className="w-4 h-4" /> : '2'}</span>
                                选择服务
                            </div>
                            <div className="w-12 h-px bg-white/30 mx-4"></div>
                            <div className={`flex items-center gap-2 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                                <span className="w-6 h-6 rounded-full bg-white text-emerald-600 flex items-center justify-center font-bold">3</span>
                                提交资料
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <form onSubmit={handleBasicInfoSubmit} className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <User className="text-emerald-500" />
                                    基本信息
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text" required
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900"
                                                value={basicInfo.name}
                                                onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })}
                                                placeholder="您的真实姓名"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel" required
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900"
                                                value={basicInfo.phone}
                                                onChange={e => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                                                placeholder="用于接收订单通知"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email" required
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900"
                                                value={basicInfo.email}
                                                onChange={e => setBasicInfo({ ...basicInfo, email: e.target.value })}
                                                placeholder="signin@example.com"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 ml-1">请确认用于服务接收和账号绑定的正式邮箱。</p>
                                    </div>

                                    {/* Invite Code - NEW FIELD */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">邀请码 (选填)</label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${searchParams.get('ref') ? 'bg-gray-50 text-gray-500' : 'bg-white border-gray-300'}`}
                                                value={basicInfo.referralCode}
                                                onChange={e => setBasicInfo({ ...basicInfo, referralCode: e.target.value })}
                                                placeholder="如有邀请码，请输入"
                                                readOnly={!!searchParams.get('ref')}
                                            />
                                        </div>
                                        {searchParams.get('ref') && <p className="text-xs text-emerald-600 mt-1 ml-1">已自动应用邀请码</p>}
                                    </div>


                                    {!isUserLoggedIn && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱验证码</label>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${errors.code ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                                                        value={basicInfo.code}
                                                        onChange={e => setBasicInfo({ ...basicInfo, code: e.target.value })}
                                                        placeholder="请输入验证码"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleSendCode}
                                                    disabled={countdown > 0}
                                                    className="px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-medium hover:bg-emerald-100 transition-all disabled:opacity-50 min-w-[120px]"
                                                >
                                                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                                                </button>
                                            </div>
                                            {errors.code && <p className="text-red-500 text-xs mt-1 ml-1">{errors.code}</p>}
                                        </div>
                                    )}

                                    <div className="md:col-span-2 space-y-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            公司地址 <span className="text-red-500">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 ${errors.addressStreet ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500'}`}
                                            value={basicInfo.addressStreet}
                                            onChange={e => setBasicInfo({ ...basicInfo, addressStreet: e.target.value })}
                                            placeholder="街道名及门牌号"
                                        />

                                        <input
                                            type="text"
                                            className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 ${errors.addressCity ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500'}`}
                                            value={basicInfo.addressCity}
                                            onChange={e => setBasicInfo({ ...basicInfo, addressCity: e.target.value })}
                                            placeholder="城市"
                                        />

                                        <input
                                            type="text"
                                            className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 ${errors.addressProvince ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500'}`}
                                            value={basicInfo.addressProvince}
                                            onChange={e => setBasicInfo({ ...basicInfo, addressProvince: e.target.value })}
                                            placeholder="省份"
                                        />

                                        <input
                                            type="text"
                                            className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 ${errors.addressPostalCode ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500'}`}
                                            value={basicInfo.addressPostalCode}
                                            onChange={e => setBasicInfo({ ...basicInfo, addressPostalCode: e.target.value })}
                                            placeholder="邮政编码"
                                        />
                                        {(errors.addressStreet || errors.addressCity || errors.addressProvince || errors.addressPostalCode) &&
                                            <p className="text-red-500 text-xs mt-1 ml-1">请完整填写地址信息</p>
                                        }
                                    </div>

                                    {!isUserLoggedIn && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">设置密码</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type={showPassword ? "text" : "password"} required
                                                        className={`w-full pl-10 pr-12 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                                                        value={basicInfo.password}
                                                        onChange={e => setBasicInfo({ ...basicInfo, password: e.target.value })}
                                                        placeholder="至少6位字符"
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"} required
                                                        className={`w-full pl-10 pr-12 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                                                        value={basicInfo.confirmPassword}
                                                        onChange={e => setBasicInfo({ ...basicInfo, confirmPassword: e.target.value })}
                                                        placeholder="再次输入密码"
                                                    />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2">
                                        下一步 <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                                {/* Provider Registration - No Social Login */}
                            </form>
                        )}

                        {/* Step 2: Service Scope Settings */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        服务范围设置
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">设定您的主营业务及覆盖区域</p>
                                </div>

                                {/* Main Business */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">
                                        主营业务 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.name}
                                                onClick={() => handleCategorySelect(cat.name)}
                                                className={`px-6 py-3 rounded-xl border font-medium text-sm transition-all
                                                    ${selectedCategory === cat.name
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Service Area */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">
                                        服务区域覆盖
                                    </label>

                                    {/* Provinces */}
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {PROVINCES.map((prov) => (
                                            <button
                                                key={prov.code}
                                                onClick={() => setServiceScope({ ...serviceScope, province: prov.code, cities: [] })}
                                                className={`px-5 py-2.5 rounded-xl border font-medium text-sm transition-all
                                                    ${serviceScope.province === prov.code
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {prov.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Cities */}
                                    <div className="flex flex-wrap gap-3">
                                        {(CITIES_MAP[serviceScope.province] || []).map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => toggleCity(city)}
                                                className={`px-4 py-2 rounded-lg border text-sm transition-all
                                                    ${serviceScope.cities.includes(city)
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                        {(!CITIES_MAP[serviceScope.province] || CITIES_MAP[serviceScope.province].length === 0) && (
                                            <span className="text-gray-400 text-sm">暂无该省份城市数据</span>
                                        )}
                                    </div>
                                </div>

                                {/* Languages */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">
                                        服务语言 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => toggleLanguage(lang)}
                                                className={`px-8 py-2.5 rounded-xl border font-medium text-sm transition-all
                                                    ${serviceScope.languages.includes(lang)
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-between">
                                    <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-500 hover:text-gray-900 font-medium">
                                        上一步
                                    </button>
                                    <button
                                        onClick={handleNextStep}
                                        disabled={!selectedCategory}
                                        className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        下一步
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Details */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Wrench className="text-emerald-500" />
                                    {templateLoading ? '加载表单...' : `完善${selectedCategory}资料`}
                                    {template && template.steps.length > 1 && (
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            ({formStepIndex + 1}/{template.steps.length}: {template.steps[formStepIndex].title})
                                        </span>
                                    )}
                                </h2>

                                {template && template.steps[formStepIndex].fields.map((field: any) => (
                                    <div key={field.key} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>

                                        {field.type === 'textarea' && (
                                            <textarea
                                                className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                                placeholder={field.placeholder || "请输入..."}
                                                value={formData[field.key] || ''}
                                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                            />
                                        )}

                                        {['text', 'number', 'tel', 'email'].includes(field.type) && (
                                            <input
                                                type={field.type === 'number' ? 'number' : (field.type === 'tel' ? 'tel' : (field.type === 'email' ? 'email' : 'text'))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder={field.placeholder || "请输入..."}
                                                value={formData[field.key] || ''}
                                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                            />
                                        )}

                                        {field.type === 'image' && (
                                            <div className="grid grid-cols-3 gap-4">
                                                {(formData[field.key] || []).map((imgUrl: string, idx: number) => (
                                                    <div key={idx} className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                        <img src={imgUrl} alt="uploaded" className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => handleRemoveImage(field.key, idx)}
                                                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Upload Button */}
                                                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-emerald-600">
                                                    <Upload className="w-8 h-8 mb-2" />
                                                    <span className="text-xs font-medium">上传图片</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(field.key, e)} />
                                                </label>
                                            </div>
                                        )}
                                        {field.type === 'select' && (
                                            <select
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                                value={formData[field.key] || ''}
                                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                            >
                                                <option value="">请选择</option>
                                                {field.options.map((opt: any) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}

                                <div className="pt-8 flex justify-between items-center">
                                    <button
                                        onClick={() => {
                                            if (formStepIndex > 0) setFormStepIndex(prev => prev - 1);
                                            else setStep(2);
                                        }}
                                        className="px-6 py-2 text-gray-500 hover:text-gray-900 font-medium"
                                    >
                                        上一步
                                    </button>
                                    <button
                                        onClick={handleFormNext}
                                        disabled={loading}
                                        className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? '提交中...' : (template && formStepIndex < template.steps.length - 1 ? '下一步' : '提交申请')}
                                        {!loading && <Check className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
