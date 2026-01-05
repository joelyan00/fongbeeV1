import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    Settings as SettingsIcon,
    MessageSquare,
    FileText,
    CreditCard,
    User,
    LogOut,
    Plus,
    Box,
    ChevronDown,
    X,
    Check,
    ChevronRight,
    Search,
    Camera
} from 'lucide-react';
import { getUserInfo, logout, providersApi, categoriesApi, formTemplatesApi, submissionsApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ProviderOrderManager from './ProviderOrderManager';

// --- Types ---
interface Category {
    id: string;
    name: string;
    icon?: string;
}

interface Template {
    id: string;
    name: string;
    description?: string;
    steps?: any[]; // Simplified for now, or define detailed types
}

// --- Components ---

const ApplyCategoryModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const { showToast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await categoriesApi.getAll();
            setCategories(res.categories || []);
        } catch (error) {
            console.error(error);
            showToast('加载服务分类失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCategory) {
            showToast('请选择服务类目', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await providersApi.applyServiceType({
                category: selectedCategory,
                reason: reason,
                // For '接机服务', we might need extra_data images, but keeping it simple for v1 as requested
                // If specific fields are needed, we can expand this form based on selectedCategory
            });
            showToast('申请提交成功，请等待审核', 'success');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            showToast(error.message || '提交失败', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[500px] flex flex-col shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">申请开通新业务</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">选择服务类目</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        >
                            <option value="">请选择...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">申请说明 (可选)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-32"
                            placeholder="请描述您的经验、资质或团队情况..."
                        />
                    </div>
                    {/* Placeholder for future file uploads */}
                    {selectedCategory === '接机服务' && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                            提示: 接机服务可能需要后续补充车辆信息和证件照片。
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
                    >
                        {submitting ? '提交中...' : '提交申请'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const CreateServiceModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1); // 1: Category, 2: Template, 3: Details
    const [categories, setCategories] = useState<Category[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState<any>({
        title: '',
        price: '',
        unit: '次',
        description: '',
        service_area: '',
        duration: '60'
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            // In a real app, we fetch provider's APPROVED categories.
            // For now, we fetch all categories and filter or just show all for demo.
            const res = await categoriesApi.getAll();
            setCategories(res.categories || []);
        } catch (error) {
            console.error(error);
            // Fallback mock
            setCategories([
                { id: '1', name: '清洁服务', icon: '✨' },
                { id: '2', name: '接送服务', icon: '🚗' },
                { id: '3', name: '维修服务', icon: '🔧' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = async (cat: Category) => {
        setSelectedCategory(cat);
        setLoading(true);
        try {
            const res = await formTemplatesApi.getPublished('standard', cat.name);
            setTemplates(res.templates || []);
            setStep(2);
        } catch (error) {
            console.error(error);
            // Mock
            setTemplates([
                { id: 't1', name: `${cat.name} - 标准模板`, description: '通用服务模板' },
                { id: 't2', name: `${cat.name} - 详细模板`, description: '包含更多细节' }
            ]);
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (tmpl: Template) => {
        setSelectedTemplate(tmpl);
        setStep(3);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.price) {
            showToast('请填写完整信息', 'error');
            return;
        }

        setLoading(true);
        try {
            await submissionsApi.create({
                templateId: selectedTemplate?.id,
                submissionType: 'provider_listing',
                formData: {
                    ...formData,
                    type: 'standard_service_listing',
                    category_id: selectedCategory?.id,
                    category_name: selectedCategory?.name,
                    template_name: selectedTemplate?.name
                }
            });
            showToast('提交成功，等待审核', 'success');
            onSuccess();
        } catch (error) {
            console.error(error);
            showToast('提交失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[600px] min-h-[400px] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">
                        {step === 1 && '选择服务类目'}
                        {step === 2 && '选择服务模板'}
                        {step === 3 && '填写服务详情'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
                    ) : (
                        <>
                            {step === 1 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {categories.map(cat => (
                                        <div
                                            key={cat.id}
                                            onClick={() => handleCategorySelect(cat)}
                                            className="p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-all flex items-center justify-between group"
                                        >
                                            <span className="font-medium text-gray-700">{cat.name}</span>
                                            <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-500" />
                                        </div>
                                    ))}
                                    {categories.length === 0 && <div className="col-span-2 text-center text-gray-400">暂无获批的服务类目</div>}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-500 mb-2">已选类目: <span className="font-bold text-gray-800">{selectedCategory?.name}</span></div>
                                    {templates.map(tmpl => (
                                        <div
                                            key={tmpl.id}
                                            onClick={() => handleTemplateSelect(tmpl)}
                                            className="p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-all"
                                        >
                                            <h3 className="font-bold text-gray-800 mb-1">{tmpl.name}</h3>
                                            <p className="text-xs text-gray-500">{tmpl.description || '无描述'}</p>
                                        </div>
                                    ))}
                                    {templates.length === 0 && <div className="text-center text-gray-400 py-10">该类目下暂无可用模板</div>}
                                    <button onClick={() => setStep(1)} className="text-sm text-gray-500 mt-4 underline">返回上一步</button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    {/* System Field: Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="text-red-500">*</span> 服务标题
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="例如：专业机场接送"
                                        />
                                    </div>

                                    {/* Dynamic Fields from Template */}
                                    {selectedTemplate?.steps?.map((step: any, stepIdx: number) => (
                                        <div key={stepIdx} className="space-y-4">
                                            {step.title && <h3 className="font-medium text-gray-900 border-b pb-2 mb-4">{step.title}</h3>}
                                            {step.fields?.map((field: any, fieldIdx: number) => {
                                                const isPrice = field.key === 'price' || field.label === '价格' || field.label === '服务价格';

                                                return (
                                                    <div key={fieldIdx}>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {field.required && <span className="text-red-500 mr-1">*</span>}
                                                            {field.label}
                                                        </label>

                                                        {/* Text Input & Number & Phone */}
                                                        {(!field.type || field.type === 'text' || field.type === 'number' || field.type === 'phone') && (
                                                            <div className="relative">
                                                                {isPrice && <span className="absolute left-3 top-2 text-gray-500">¥</span>}
                                                                <input
                                                                    type={field.type === 'number' ? 'number' : 'text'}
                                                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${isPrice ? 'pl-7' : ''}`}
                                                                    placeholder={field.placeholder}
                                                                    required={field.required}
                                                                    value={isPrice ? formData.price : (formData[field.key] || '')}
                                                                    onChange={(e) => {
                                                                        if (isPrice) {
                                                                            setFormData({ ...formData, price: e.target.value });
                                                                        } else {
                                                                            setFormData((prev: any) => ({ ...prev, [field.key]: e.target.value }));
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Image Upload (Multiple) */}
                                                        {(field.type === 'image' || field.type === 'file') && (
                                                            <div>
                                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                                    {(Array.isArray(formData[field.key]) ? formData[field.key] : (formData[field.key] ? [formData[field.key]] : [])).map((img: string, imgIdx: number) => (
                                                                        <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                                            <img src={img} alt={`Uploaded ${imgIdx}`} className="w-full h-full object-cover" />
                                                                            <button
                                                                                onClick={() => {
                                                                                    const current = Array.isArray(formData[field.key]) ? formData[field.key] : [formData[field.key]];
                                                                                    const updated = current.filter((_: any, i: number) => i !== imgIdx);
                                                                                    setFormData((prev: any) => ({ ...prev, [field.key]: updated }));
                                                                                }}
                                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            >
                                                                                <X size={12} />
                                                                            </button>
                                                                        </div>
                                                                    ))}

                                                                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-gray-400 hover:text-emerald-500">
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            multiple
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                const files = Array.from(e.target.files || []);
                                                                                if (files.length === 0) return;

                                                                                files.forEach(file => {
                                                                                    if (file.size > 5 * 1024 * 1024) {
                                                                                        alert(`File ${file.name} is too large (max 5MB)`);
                                                                                        return;
                                                                                    }
                                                                                    const reader = new FileReader();
                                                                                    reader.onloadend = () => {
                                                                                        setFormData((prev: any) => {
                                                                                            const current = Array.isArray(prev[field.key]) ? prev[field.key] : (prev[field.key] ? [prev[field.key]] : []);
                                                                                            return { ...prev, [field.key]: [...current, reader.result] };
                                                                                        });
                                                                                    };
                                                                                    reader.readAsDataURL(file);
                                                                                });
                                                                            }}
                                                                        />
                                                                        <Camera size={24} className="mb-2" />
                                                                        <span className="text-xs">添加图片</span>
                                                                    </label>
                                                                </div>
                                                                <p className="text-xs text-gray-400">支持多张图片上传 (Max 5MB/张)</p>
                                                            </div>
                                                        )}

                                                        {/* Select */}
                                                        {field.type === 'select' && (
                                                            <select
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                                                onChange={(e) => setFormData((prev: any) => ({ ...prev, [field.key]: e.target.value }))}
                                                            >
                                                                <option value="">请选择</option>
                                                                {field.options?.map((opt: any, i: number) => (
                                                                    <option key={i} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </select>
                                                        )}

                                                        {/* Radio */}
                                                        {field.type === 'radio' && (
                                                            <div className="flex flex-wrap gap-4">
                                                                {field.options?.map((opt: any, i: number) => (
                                                                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={field.key}
                                                                            value={opt.value}
                                                                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                                                            onChange={(e) => setFormData((prev: any) => ({ ...prev, [field.key]: e.target.value }))}
                                                                        />
                                                                        <span className="text-sm text-gray-700">{opt.label}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Checkbox */}
                                                        {field.type === 'checkbox' && (
                                                            <div className="flex flex-wrap gap-4">
                                                                {field.options?.map((opt: any, i: number) => (
                                                                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            value={opt.value}
                                                                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                                                            onChange={(e) => {
                                                                                const current = formData[field.key] || [];
                                                                                let updated;
                                                                                if (e.target.checked) {
                                                                                    updated = [...current, opt.value];
                                                                                } else {
                                                                                    updated = current.filter((v: any) => v !== opt.value);
                                                                                }
                                                                                setFormData((prev: any) => ({ ...prev, [field.key]: updated }));
                                                                            }}
                                                                        />
                                                                        <span className="text-sm text-gray-700">{opt.label}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Address */}
                                                        {field.type === 'address' && (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="详细地址"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                                    onChange={(e) => setFormData((prev: any) => ({
                                                                        ...prev,
                                                                        [field.key]: { ...(prev[field.key] || {}), detail: e.target.value }
                                                                    }))}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="城市"
                                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                                        onChange={(e) => setFormData((prev: any) => ({
                                                                            ...prev,
                                                                            [field.key]: { ...(prev[field.key] || {}), city: e.target.value }
                                                                        }))}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="省份"
                                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                                        onChange={(e) => setFormData((prev: any) => ({
                                                                            ...prev,
                                                                            [field.key]: { ...(prev[field.key] || {}), province: e.target.value }
                                                                        }))}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}

                                    {/* Fallback Price if not in template */}
                                    {!selectedTemplate?.steps?.some((s: any) => s.fields?.some((f: any) => f.key === 'price' || f.label === '价格' || f.label === '服务价格')) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <span className="text-red-500">*</span> 价格
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2 text-gray-500">¥</span>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {step === 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium shadow-sm shadow-emerald-200"
                        >
                            {loading ? '提交中...' : '提交审核'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const ProviderDashboard = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('standard_mgmt');
    const [subTab, setSubTab] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showApplyCategoryModal, setShowApplyCategoryModal] = useState(false);
    const [providerProfile, setProviderProfile] = useState<any>(null);

    useEffect(() => {
        const user = getUserInfo();
        if (!user) {
            navigate('/login');
            return;
        }
        setUserInfo(user);
        fetchProviderProfile();
    }, [navigate]);

    const fetchProviderProfile = async () => {
        try {
            const res = await providersApi.getMyProfile();
            setProviderProfile(res.profile);
        } catch (error) {
            console.error('Failed to fetch provider profile', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SidebarItem = ({ id, label, icon: Icon, active = false }: any) => (
        <div
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm font-medium transition-colors ${active
                ? 'text-emerald-600 bg-emerald-50 border-r-2 border-emerald-600'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            onClick={() => setActiveTab(id)}
        >
            {Icon && <Icon size={18} />}
            {label}
        </div>
    );

    const SidebarSection = ({ title, children }: any) => (
        <div className="mb-6">
            <div className="px-4 mb-2 text-xs font-bold text-gray-400">{title}</div>
            {children}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                        优服佳
                    </h1>
                    <span className="text-sm text-gray-500 border-l border-gray-200 pl-4">服务商工作台</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                        语言: 中文 <ChevronDown size={14} />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-gray-800">你好，{userInfo?.name || '服务商'}</div>
                            <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-green-100">初级会员</div>
                        </div>
                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img src={userInfo?.avatar || "https://via.placeholder.com/40"} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 py-6 overflow-y-auto hidden md:block custom-scrollbar">
                    <SidebarSection title="业务统计">
                        <SidebarItem id="stats" label="营业额统计" icon={LayoutDashboard} active={activeTab === 'stats'} />
                        <SidebarItem id="task_hall" label="任务大厅" icon={ClipboardList} active={activeTab === 'task_hall'} />
                    </SidebarSection>

                    <SidebarSection title="标准服务">
                        <SidebarItem id="standard_mgmt" label="标准服务管理" icon={Box} active={activeTab === 'standard_mgmt'} />
                        <SidebarItem id="standard_orders" label="标准服务订单管理" icon={FileText} active={activeTab === 'standard_orders'} />
                    </SidebarSection>

                    <SidebarSection title="定制服务">
                        <SidebarItem id="custom_quotes" label="定制服务报价记录" icon={FileText} />
                        <SidebarItem id="custom_orders" label="定制服务订单管理" icon={FileText} />
                    </SidebarSection>

                    <SidebarSection title="互动与记录">
                        <SidebarItem id="inbox" label="收件箱" icon={MessageSquare} />
                        <SidebarItem id="transactions" label="交易记录" icon={CreditCard} />
                        <SidebarItem id="subscription" label="等级与订阅机制" icon={User} />
                        <SidebarItem id="reviews" label="收到的评论" icon={MessageSquare} />
                    </SidebarSection>

                    <SidebarSection title="账户设置">
                        <SidebarItem id="invoices" label="已开具发票" icon={FileText} />
                    </SidebarSection>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
                    {activeTab === 'standard_mgmt' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            {/* Tabs & Actions */}
                            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex gap-6 text-sm overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                                    {['全部', '仓库中(0)', '审核中(0)', '已上架(0)', '审核未通过(0)'].map((tab, idx) => (
                                        <div
                                            key={idx}
                                            className={`cursor-pointer pb-2 border-b-2 transition-colors whitespace-nowrap ${(idx === 0 && subTab === 'all') ? 'border-primary-500 text-primary-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                            onClick={() => setSubTab('all')}
                                        >
                                            {tab}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-1 text-emerald-600 font-medium hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                    >
                                        <Plus size={18} /> 创建标准服务
                                    </button>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-sm">
                                        <span className="text-gray-400">开始日期</span>
                                        <span className="text-gray-300">-</span>
                                        <span className="text-gray-400">结束日期</span>
                                    </div>
                                </div>
                            </div>

                            {/* Empty State */}
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 min-h-[400px]">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                    <Box size={48} strokeWidth={1} className="text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-500">暂无服务数据</p>
                                <p className="text-sm text-gray-400 max-w-xs text-center mb-2">您可以添加标准服务项目，审核通过后即可上架接单</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all font-bold flex items-center gap-2 transform hover:-translate-y-0.5"
                                >
                                    <Plus size={20} /> 创建标准服务
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'standard_orders' && (
                        <ProviderOrderManager />
                    )}

                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-gray-500 text-sm">总收入</p>
                                            <h3 className="text-2xl font-bold text-gray-900 mt-1">¥12,450.00</h3>
                                        </div>
                                        <div className="p-2 bg-emerald-50 rounded-lg">
                                            <div className="text-emerald-600 font-bold text-xs">+12%</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-gray-500 text-sm">待结算</p>
                                            <h3 className="text-2xl font-bold text-orange-500 mt-1">¥850.00</h3>
                                        </div>
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <div className="text-orange-600 font-bold text-xs">处理中</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-gray-500 text-sm">完成订单</p>
                                            <h3 className="text-2xl font-bold text-blue-600 mt-1">156 单</h3>
                                        </div>
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Check size={16} />
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">近期收支明细</h3>
                                    <button className="text-sm text-emerald-600 hover:text-emerald-700">查看全部</button>
                                </div>
                                <div>
                                    {[
                                        { id: 1, title: '家庭保洁服务 - 3小时', time: '2024-03-10 14:30', amount: '+150.00', status: '已到账' },
                                        { id: 2, title: '提现到银行卡 (尾号8888)', time: '2024-03-08 09:15', amount: '-2000.00', status: '处理中', isWithdraw: true },
                                        { id: 3, title: '空调清洗服务 - 立式', time: '2024-03-07 16:20', amount: '+120.00', status: '已到账' },
                                    ].map((item, i) => (
                                        <div key={item.id} className="px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.isWithdraw ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                    {item.isWithdraw ? <CreditCard size={18} /> : <Check size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.title}</p>
                                                    <p className="text-xs text-gray-500">{item.time}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${item.isWithdraw ? 'text-gray-900' : 'text-emerald-600'}`}>{item.amount}</p>
                                                <p className="text-xs text-gray-400">{item.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'task_hall' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
                            {/* Toolbar */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex gap-2">
                                    {['推荐', '最新', '高价', '距离最近'].map((filter, i) => (
                                        <button key={i} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="搜索订单..."
                                        className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm w-60 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                    <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                                </div>
                            </div>

                            {/* Task List */}
                            <div className="flex-1 p-4 grid grid-cols-1 gap-4">
                                {[
                                    { id: 101, title: '全屋深度保洁 - 120平米', price: '450', tags: ['保洁', '急单'], dist: '1.2km', loc: '静安区 - 中凯城市之光', date: '今天 14:00' },
                                    { id: 102, title: '立式空调清洗 + 检修', price: '180', tags: ['家电清洗'], dist: '2.5km', loc: '黄浦区 - 打浦桥', date: '明天 10:00' },
                                    { id: 103, title: '下水道疏通 - 厨房', price: '120', tags: ['维修', '简单'], dist: '3.0km', loc: '普陀区 - 长寿路', date: '今天 18:00' },
                                    { id: 104, title: '家庭日常保洁 - 4小时', price: '200', tags: ['保洁'], dist: '0.8km', loc: '静安区 - 达安花园', date: '后天 09:00' },
                                ].map(task => (
                                    <div key={task.id} className="border border-gray-100 rounded-xl p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group bg-gray-50/50 hover:bg-white">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                                                    <ClipboardList size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">{task.title}</h4>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {task.tags.map(tag => (
                                                            <span key={tag} className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded opacity-80">{tag}</span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1"><User size={14} /> {task.loc}</span>
                                                        <span className="flex items-center gap-1"><div className="w-1 h-1 bg-gray-300 rounded-full"></div> {task.dist}</span>
                                                        <span className="flex items-center gap-1"><div className="w-1 h-1 bg-gray-300 rounded-full"></div> {task.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-2xl font-bold text-red-500">¥{task.price}</div>
                                                <button className="mt-3 bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200">
                                                    立即抢单
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="p-4 border-t border-gray-100 flex justify-center">
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-50" disabled>&lt;</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded bg-emerald-600 text-white">1</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-600">2</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-600">3</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500">&gt;</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right Panel (Profile Card) */}
                    <div className="fixed right-6 top-24 w-80 hidden xl:block space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center border border-gray-100">
                            <div className="relative inline-block">
                                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-3 overflow-hidden border-4 border-white shadow-sm">
                                    <img src={userInfo?.avatar || "https://via.placeholder.com/80"} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-3 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{userInfo?.name || '严越杰'}</h3>
                            <span className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded mt-1 font-medium border border-blue-100">初级会员</span>

                            <div className="mt-6 bg-orange-50 text-orange-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-inner">
                                <span className="w-5 h-5 rounded-full border-2 border-orange-400 flex items-center justify-center text-[10px] bg-white">¥</span>
                                我的积分: 0
                            </div>

                            <div className="mt-6 text-left space-y-3 text-sm text-gray-600">
                                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                    <span className="text-gray-400">手机号码</span>
                                    <span className="font-medium text-gray-700">{userInfo?.phone || '未绑定'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                    <span className="text-gray-400">邮箱</span>
                                    <span className="font-medium text-gray-700 truncate max-w-[150px]" title={userInfo?.email}>{userInfo?.email}</span>
                                </div>

                                {/* Service Categories */}
                                <div className="pt-2 border-t border-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400">已开通服务</span>
                                        <button
                                            onClick={() => setShowApplyCategoryModal(true)}
                                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100"
                                        >
                                            + 申请
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {providerProfile?.service_categories?.length > 0 ? (
                                            providerProfile.service_categories.map((cat: string) => (
                                                <span key={cat} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200">
                                                    {cat}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">暂无开通业务</span>
                                        )}
                                    </div>
                                    {/* Show latest pending/rejected app status if any */}
                                    {providerProfile?.latest_application && providerProfile.latest_application.status !== 'approved' && (
                                        <div className={`mt-2 text-xs p-2 rounded ${providerProfile.latest_application.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            <div className="font-bold mb-1">
                                                {providerProfile.latest_application.status === 'pending' ? '申请审核中' : '申请已拒绝'}
                                            </div>
                                            {providerProfile.latest_application.status === 'rejected' && (
                                                <div>原因: {providerProfile.latest_application.reason || '无'}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={handleLogout} className="mt-6 w-full py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors">
                                <LogOut size={16} className="inline mr-2" />
                                退出登录
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                <h4 className="font-bold text-gray-800">帮助中心</h4>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">如有相关问题咨询，请联系客服人员，我们将竭诚为您服务。</p>
                            <div className="bg-emerald-50 text-emerald-600 py-3 rounded-lg text-center font-bold tracking-wide hover:bg-emerald-100 transition-colors cursor-pointer">
                                📞 400-888-8888
                            </div>
                        </div>
                    </div>
                    {activeTab === 'standard_orders' && <ProviderOrderManager />}
                </main>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateServiceModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => setShowCreateModal(false)}
                />
            )}
            {showApplyCategoryModal && (
                <ApplyCategoryModal
                    onClose={() => setShowApplyCategoryModal(false)}
                    onSuccess={() => {
                        setShowApplyCategoryModal(false);
                        fetchProviderProfile();
                    }}
                />
            )}
        </div>
    );
};

export default ProviderDashboard;

