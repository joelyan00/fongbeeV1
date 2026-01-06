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
    Camera,
    Trash2,
    Pencil,
    Copy,
    MoreVertical,
    Archive,
    ArchiveRestore,
    Calendar
} from 'lucide-react';
import { getUserInfo, logout, providersApi, categoriesApi, formTemplatesApi, submissionsApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ProviderOrderManager from './ProviderOrderManager';
import WorkingHoursField from '../components/WorkingHoursField';

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
                                                        {(!field.type || field.type === 'text' || field.type === 'number' || field.type === 'phone' || field.type === 'currency') && (
                                                            <div className="relative">
                                                                {(isPrice || field.type === 'currency') && <span className="absolute left-3 top-2 text-gray-500">{field.currency || '¥'}</span>}
                                                                <input
                                                                    type={field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
                                                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${(isPrice || field.type === 'currency') ? 'pl-7' : ''}`}
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

                                                        {/* Date & Time */}
                                                        {(field.type === 'date' || field.type === 'time') && (
                                                            <input
                                                                type={field.type}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                                required={field.required}
                                                                value={formData[field.key] || ''}
                                                                onChange={(e) => setFormData((prev: any) => ({ ...prev, [field.key]: e.target.value }))}
                                                            />
                                                        )}

                                                        {/* Textarea */}
                                                        {(field.type === 'textarea' || field.type === 'long_text') && (
                                                            <textarea
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-24"
                                                                placeholder={field.placeholder}
                                                                required={field.required}
                                                                value={formData[field.key] || ''}
                                                                onChange={(e) => setFormData((prev: any) => ({ ...prev, [field.key]: e.target.value }))}
                                                            />
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

                                                        {/* Working Hours */}
                                                        {field.type === 'working_hours' && (
                                                            <WorkingHoursField
                                                                value={formData[field.key]}
                                                                onChange={(val) => setFormData((prev: any) => ({ ...prev, [field.key]: val }))}
                                                                required={field.required}
                                                            />
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
    const [myServices, setMyServices] = useState<any[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: string; service: any } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const user = getUserInfo();
        if (!user) {
            navigate('/login');
            return;
        }
        setUserInfo(user);
        fetchProviderProfile();
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'standard_mgmt') {
            fetchMyServices();
        }
    }, [activeTab]);

    const fetchMyServices = async () => {
        setLoadingServices(true);
        try {
            const res = await submissionsApi.getMySubmissions({ type: 'provider_listing' });
            setMyServices(res.submissions || []);
        } catch (error) {
            console.error('Failed to fetch my services', error);
        } finally {
            setLoadingServices(false);
        }
    };

    // Compute counts for each status
    const serviceCounts = {
        all: myServices.length,
        draft: myServices.filter(s => s.status === 'draft').length, // 编辑中
        unlisted: myServices.filter(s => s.listing_status === 'pending' && s.status !== 'draft').length, // 未上架 (submitted but not approved)
        pending: myServices.filter(s => s.listing_status === 'pending').length, // 审核中
        approved: myServices.filter(s => s.listing_status === 'approved').length, // 已上架
        rejected: myServices.filter(s => s.listing_status === 'rejected').length, // 审核未通过
    };

    // Filter services based on subTab
    const filteredServices = myServices.filter(s => {
        switch (subTab) {
            case 'draft': return s.status === 'draft';
            case 'unlisted': return s.listing_status !== 'approved' && s.listing_status !== 'rejected' && s.status !== 'draft';
            case 'pending': return s.listing_status === 'pending';
            case 'approved': return s.listing_status === 'approved';
            case 'rejected': return s.listing_status === 'rejected';
            default: return true; // 'all'
        }
    });

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

    // Service Action Handlers
    const handleUnlistService = async (service: any) => {
        setActionLoading(true);
        try {
            await submissionsApi.update(service.id, { listing_status: 'unlisted' });
            showToast('服务已下架', 'success');
            fetchMyServices();
        } catch (error: any) {
            showToast(error.message || '操作失败', 'error');
        } finally {
            setActionLoading(false);
            setConfirmAction(null);
        }
    };

    const handleRelistService = async (service: any) => {
        setActionLoading(true);
        try {
            // Resubmit for approval
            await submissionsApi.update(service.id, { listing_status: 'pending' });
            showToast('已重新提交审核', 'success');
            fetchMyServices();
        } catch (error: any) {
            showToast(error.message || '操作失败', 'error');
        } finally {
            setActionLoading(false);
            setConfirmAction(null);
        }
    };

    const handleEditService = (service: any) => {
        setEditingService(service);
        setShowEditModal(true);
        setActiveActionMenu(null);
    };

    const handleDuplicateService = async (service: any) => {
        setActionLoading(true);
        try {
            // Create a copy with new status
            const duplicateData = {
                form_template_id: service.template_id,
                data: {
                    ...service.form_data,
                    title: `${service.form_data?.title || '服务'} (副本)`
                },
                status: 'draft',
                submission_type: 'provider_listing',
                listing_status: 'pending'
            };
            await submissionsApi.create(duplicateData);
            showToast('服务已复制，请编辑后提交审核', 'success');
            fetchMyServices();
        } catch (error: any) {
            showToast(error.message || '复制失败', 'error');
        } finally {
            setActionLoading(false);
            setActiveActionMenu(null);
        }
    };

    const handleDeleteService = async (service: any) => {
        setActionLoading(true);
        try {
            await submissionsApi.delete(service.id);
            showToast('服务已删除', 'success');
            fetchMyServices();
        } catch (error: any) {
            showToast(error.message || '删除失败', 'error');
        } finally {
            setActionLoading(false);
            setConfirmAction(null);
        }
    };

    const executeConfirmAction = () => {
        if (!confirmAction) return;
        switch (confirmAction.type) {
            case 'unlist':
                handleUnlistService(confirmAction.service);
                break;
            case 'relist':
                handleRelistService(confirmAction.service);
                break;
            case 'delete':
                handleDeleteService(confirmAction.service);
                break;
        }
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

                {/* Main Content - needs right padding on xl screens for fixed right sidebar */}
                <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden bg-gray-50 xl:pr-[360px]">
                    {activeTab === 'standard_mgmt' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            {/* Tabs & Actions */}
                            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex gap-6 text-sm overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                                    {[
                                        { key: 'all', label: '全部', count: serviceCounts.all },
                                        { key: 'draft', label: '编辑中', count: serviceCounts.draft },
                                        { key: 'unlisted', label: '未上架', count: serviceCounts.unlisted },
                                        { key: 'pending', label: '审核中', count: serviceCounts.pending },
                                        { key: 'approved', label: '已上架', count: serviceCounts.approved },
                                        { key: 'rejected', label: '审核未通过', count: serviceCounts.rejected },
                                    ].map((tab) => (
                                        <div
                                            key={tab.key}
                                            className={`cursor-pointer pb-2 border-b-2 transition-colors whitespace-nowrap ${subTab === tab.key
                                                ? 'border-primary-500 text-primary-600 font-bold'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                            onClick={() => setSubTab(tab.key)}
                                        >
                                            {tab.label}({tab.count})
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


                            {/* Content or Empty State */}
                            {loadingServices ? (
                                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                </div>
                            ) : filteredServices.length > 0 ? (
                                <div className="flex-1 overflow-y-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">服务名称</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">类目</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">价格</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">创建时间</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredServices.map((svc) => {
                                                // Determine display status
                                                let statusLabel = '审核中';
                                                let statusClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';

                                                if (svc.status === 'draft') {
                                                    statusLabel = '编辑中';
                                                    statusClass = 'bg-gray-50 text-gray-600 border-gray-200';
                                                } else if (svc.listing_status === 'approved') {
                                                    statusLabel = '已上架';
                                                    statusClass = 'bg-green-50 text-green-700 border-green-200';
                                                } else if (svc.listing_status === 'rejected') {
                                                    statusLabel = '审核未通过';
                                                    statusClass = 'bg-red-50 text-red-700 border-red-200';
                                                } else if (svc.listing_status === 'pending') {
                                                    statusLabel = '审核中';
                                                    statusClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
                                                } else {
                                                    statusLabel = '未上架';
                                                    statusClass = 'bg-blue-50 text-blue-700 border-blue-200';
                                                }

                                                return (
                                                    <tr key={svc.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-gray-900">{svc.form_data?.title || svc.form_templates?.name || '未命名服务'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{svc.service_category || svc.form_data?.category_name || '-'}</td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">¥{svc.form_data?.price || '0.00'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>
                                                                {statusLabel}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(svc.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right relative">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {/* Quick Actions */}
                                                                {svc.listing_status === 'approved' && (
                                                                    <button
                                                                        onClick={() => setConfirmAction({ type: 'unlist', service: svc })}
                                                                        className="text-xs px-2 py-1 text-orange-600 hover:bg-orange-50 rounded transition-colors flex items-center gap-1"
                                                                        title="下架"
                                                                    >
                                                                        <Archive size={14} /> 下架
                                                                    </button>
                                                                )}
                                                                {(svc.listing_status === 'unlisted' || svc.listing_status === 'rejected') && (
                                                                    <button
                                                                        onClick={() => setConfirmAction({ type: 'relist', service: svc })}
                                                                        className="text-xs px-2 py-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors flex items-center gap-1"
                                                                        title="重新上架"
                                                                    >
                                                                        <ArchiveRestore size={14} /> 重新提交
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleEditService(svc)}
                                                                    className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                                                                    title="编辑"
                                                                >
                                                                    <Pencil size={14} /> 编辑
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDuplicateService(svc)}
                                                                    className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                                                                    title="复制"
                                                                >
                                                                    <Copy size={14} /> 复制
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmAction({ type: 'delete', service: svc })}
                                                                    className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                                                                    title="删除"
                                                                >
                                                                    <Trash2 size={14} /> 删除
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
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
                            )}
                        </div>
                    )}

                    {activeTab === 'standard_orders' && (
                        <ProviderOrderManager />
                    )}

                    {activeTab === 'custom_quotes' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            {/* Tabs & Filters */}
                            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex gap-6 text-sm">
                                    {[
                                        { key: 'all', label: '全部' },
                                        { key: 'quoted', label: '已报价' },
                                        { key: 'ignored', label: '被忽略' },
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            className={`pb-2 border-b-2 transition-colors ${tab.key === 'all'
                                                ? 'border-cyan-500 text-cyan-600 font-medium'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {tab.label}(0)
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" placeholder="开始日期" />
                                        <span className="text-gray-400">至</span>
                                        <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" placeholder="结束日期" />
                                    </div>
                                </div>
                            </div>

                            {/* Quote List */}
                            <div className="flex-1 p-4">
                                {/* Mock Data - Quote Items */}
                                <div className="space-y-4">
                                    {[
                                        {
                                            id: 1,
                                            projectName: '高端任务',
                                            time: '2025/07/28 17:40',
                                            location: '世贸路1131号门厅',
                                            status: 'pending',
                                            statusText: '待定',
                                            amount: 25000,
                                            result: 'failed',
                                            resultText: '用户已选择其他服务商，已失败'
                                        },
                                        {
                                            id: 2,
                                            projectName: '复杂任务',
                                            time: '2025/07/28 17:40',
                                            location: '世贸路1131号门厅',
                                            status: 'pending',
                                            statusText: '待定',
                                            amount: 25000,
                                            result: 'active',
                                            resultText: ''
                                        },
                                    ].map(quote => (
                                        <div key={quote.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-gray-500 text-sm">项目名称</span>
                                                        <a href="#" className="text-cyan-600 hover:underline font-medium">({quote.projectName})</a>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">发布时间：</span>
                                                            <span className="text-gray-700">{quote.time}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">所在位置：</span>
                                                            <span className="text-gray-700">{quote.location}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-cyan-600">{quote.statusText}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="text-gray-500 text-sm">报价金额：</span>
                                                        <span className="text-pink-500 font-bold">¥ {quote.amount.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {quote.result === 'failed' ? (
                                                        <span className="text-gray-400 text-sm">{quote.resultText}</span>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button className="px-4 py-1.5 text-gray-600 text-sm hover:text-gray-800">
                                                                取消报价
                                                            </button>
                                                            <button
                                                                className="px-4 py-1.5 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600"
                                                                onClick={() => navigate(`/provider/submission/${quote.id}`)}
                                                            >
                                                                查看详情
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                                    <span>共2条</span>
                                    <select className="border border-gray-200 rounded px-2 py-1">
                                        <option>10条/页</option>
                                        <option>20条/页</option>
                                        <option>50条/页</option>
                                    </select>
                                    <div className="flex items-center gap-1">
                                        <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">&lt;</button>
                                        <button className="px-3 py-1 bg-cyan-500 text-white rounded">1</button>
                                        <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">&gt;</button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>前往</span>
                                        <input type="number" className="w-12 border border-gray-200 rounded px-2 py-1 text-center" defaultValue={1} />
                                        <span>页</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'custom_orders' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            {/* Tabs & Filters */}
                            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex gap-4 text-sm overflow-x-auto">
                                    {[
                                        { key: 'all', label: '全部', count: 11 },
                                        { key: 'pending_payment', label: '待客户待付款', count: 6 },
                                        { key: 'pending_visit', label: '待上门', count: 1 },
                                        { key: 'in_service', label: '服务中', count: 1 },
                                        { key: 'pending_acceptance', label: '待验收', count: 1 },
                                        { key: 'completed', label: '已完成', count: 1 },
                                        { key: 'after_sales', label: '售后', count: 1 },
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            className={`pb-2 border-b-2 transition-colors whitespace-nowrap ${tab.key === 'all'
                                                ? 'border-cyan-500 text-cyan-600 font-medium'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {tab.label}({tab.count})
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3">
                                    <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-500">
                                        <option>按时间</option>
                                    </select>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" placeholder="开始日期" />
                                        <span className="text-gray-400">至</span>
                                        <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" placeholder="结束日期" />
                                    </div>
                                </div>
                            </div>

                            {/* Order List */}
                            <div className="flex-1 p-4">
                                <div className="space-y-4">
                                    {[
                                        {
                                            id: 1,
                                            projectName: '简单任务',
                                            paymentType: 'simple',
                                            time: '2025/07/28 17:40',
                                            location: '世博路1131号门厅',
                                            amount: 25000,
                                            status: 'pending_payment',
                                            statusText: '用户待付款',
                                            hasReview: true
                                        },
                                        {
                                            id: 2,
                                            projectName: '定金支付',
                                            paymentType: 'deposit',
                                            time: '2025/07/28 17:40',
                                            location: '世博路1131号门厅',
                                            amount: 25000,
                                            status: 'submitted',
                                            statusText: '用户已提交订单',
                                            hasReview: true
                                        },
                                        {
                                            id: 3,
                                            projectName: '定金支付',
                                            paymentType: 'deposit',
                                            time: '2025/07/28 17:40',
                                            location: '世博路1131号门厅',
                                            amount: 25000,
                                            status: 'pending_contract',
                                            statusText: '用户待签章',
                                            hasReview: true
                                        },
                                        {
                                            id: 4,
                                            projectName: '担保支付',
                                            paymentType: 'escrow',
                                            time: '2025/07/28 17:40',
                                            location: '世博路1131号门厅',
                                            amount: 25000,
                                            status: 'contracted',
                                            statusText: '用户已签章',
                                            hasReview: true
                                        },
                                        {
                                            id: 5,
                                            projectName: '担保支付',
                                            paymentType: 'escrow',
                                            time: '2025/07/28 17:40',
                                            location: '世博路1131号门厅',
                                            amount: 25000,
                                            status: 'submitted',
                                            statusText: '用户已提交订单',
                                            hasReview: true
                                        },
                                        {
                                            id: 6,
                                            projectName: '担保支付',
                                            paymentType: 'escrow',
                                            time: '2025/07/28 17:40',
                                            location: '世博路1131号门厅',
                                            amount: 25000,
                                            status: 'pending_contract',
                                            statusText: '用户待签章',
                                            hasReview: true
                                        },
                                    ].map(order => {
                                        // Determine payment type tag color
                                        let tagColor = 'bg-orange-100 text-orange-600';
                                        let amountColor = 'text-orange-500';
                                        if (order.paymentType === 'deposit') {
                                            tagColor = 'bg-cyan-100 text-cyan-600';
                                            amountColor = 'text-cyan-500';
                                        } else if (order.paymentType === 'escrow') {
                                            tagColor = 'bg-orange-100 text-orange-600';
                                            amountColor = 'text-orange-500';
                                        }

                                        return (
                                            <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-gray-500 text-sm">项目名称</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${tagColor}`}>
                                                                {order.projectName}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                            <div>
                                                                <span className="text-gray-500">发布时间：</span>
                                                                <span className="text-gray-700">{order.time}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">所在位置：</span>
                                                                <span className="text-gray-700">{order.location}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="text-gray-500 text-sm">服务金额：</span>
                                                            <span className={`font-bold ${amountColor}`}>¥ {order.amount.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="text-cyan-600 text-sm">{order.statusText}</span>
                                                        <div className="flex gap-2">
                                                            <button className="px-4 py-1.5 text-gray-500 text-sm hover:text-gray-700">
                                                                查看评情
                                                            </button>
                                                            <button
                                                                className="px-4 py-1.5 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600"
                                                                onClick={() => navigate(`/provider/submission/${order.id}`)}
                                                            >
                                                                查看详情
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                                    <span>共6条</span>
                                    <select className="border border-gray-200 rounded px-2 py-1">
                                        <option>10条/页</option>
                                        <option>20条/页</option>
                                        <option>50条/页</option>
                                    </select>
                                    <div className="flex items-center gap-1">
                                        <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">&lt;</button>
                                        <button className="px-3 py-1 bg-cyan-500 text-white rounded">1</button>
                                        <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">&gt;</button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>前往</span>
                                        <input type="number" className="w-12 border border-gray-200 rounded px-2 py-1 text-center" defaultValue={1} />
                                        <span>页</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="space-y-6 max-w-full overflow-hidden">
                            {/* Top Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-5 rounded-xl text-white shadow-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-cyan-100 text-sm mb-1">本月成交额</p>
                                            <h3 className="text-2xl font-bold">¥ 200000</h3>
                                            <p className="text-cyan-200 text-xs mt-2">本月成交数: 28</p>
                                        </div>
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Check size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">本月报价数</p>
                                            <h3 className="text-2xl font-bold text-gray-900">30</h3>
                                        </div>
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <FileText size={20} className="text-amber-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-5 rounded-xl text-white shadow-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-orange-100 text-sm mb-1">本月提金</p>
                                            <h3 className="text-2xl font-bold">¥ 180000</h3>
                                        </div>
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <CreditCard size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-5 rounded-xl text-white shadow-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-pink-100 text-sm mb-1">本月支出</p>
                                            <h3 className="text-2xl font-bold">¥ 2000</h3>
                                        </div>
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <CreditCard size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sub Tabs */}
                            <div className="flex gap-4 border-b border-gray-200">
                                <button
                                    onClick={() => setSubTab('schedule')}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${subTab === 'schedule' || subTab === 'all'
                                        ? 'border-cyan-500 text-cyan-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    日程安排
                                </button>
                                <button
                                    onClick={() => setSubTab('revenue')}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${subTab === 'revenue'
                                        ? 'border-cyan-500 text-cyan-600 bg-cyan-50 rounded-t-lg'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    营业额
                                </button>
                            </div>

                            {/* Schedule Tab Content */}
                            {(subTab === 'schedule' || subTab === 'all') && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    {/* Calendar Header */}
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {new Date().getFullYear()} 年 {new Date().getMonth() + 1} 月
                                        </h3>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">上个月</button>
                                            <button className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">今天</button>
                                            <button className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">下个月</button>
                                        </div>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {/* Week days header */}
                                        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                                            <div key={day} className="text-center py-3 text-sm font-medium text-gray-500">
                                                {day}
                                            </div>
                                        ))}
                                        {/* Calendar days - simplified mock data */}
                                        {Array.from({ length: 35 }, (_, i) => {
                                            const dayNum = i - 3; // Offset for month start
                                            const isCurrentMonth = dayNum >= 1 && dayNum <= 31;
                                            const isToday = dayNum === new Date().getDate();
                                            const hasEvent = [5, 6, 8, 9, 10].includes(dayNum);

                                            return (
                                                <div
                                                    key={i}
                                                    className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ${!isCurrentMonth ? 'text-gray-300' :
                                                        isToday ? 'bg-cyan-500 text-white font-bold' :
                                                            hasEvent ? 'bg-cyan-100 text-cyan-700' :
                                                                'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {isCurrentMonth ? dayNum : (dayNum <= 0 ? 31 + dayNum : dayNum - 31)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Revenue Tab Content */}
                            {subTab === 'revenue' && (
                                <div className="space-y-6">
                                    {/* Order Statistics */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-800">订单统计报表</h3>
                                            <div className="flex gap-2 text-sm text-gray-500">
                                                <span>近一周订单统计</span>
                                                <button className="text-cyan-600 hover:underline">本月</button>
                                            </div>
                                        </div>

                                        <div className="flex gap-8 mb-6">
                                            <div>
                                                <span className="text-gray-500 text-sm">本月订单总数</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-gray-900">30</span>
                                                    <span className="text-xs text-red-500">10% 相比上月</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-sm">本周订单总数</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-gray-900">10</span>
                                                    <span className="text-xs text-red-500">10% 相比上周</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Simple Line Chart Placeholder */}
                                        <div className="h-48 bg-gradient-to-t from-cyan-50 to-white rounded-lg flex items-end justify-between px-4 pb-4 pt-8 relative border border-gray-100">
                                            {/* Y-axis labels */}
                                            <div className="absolute left-2 top-0 h-full flex flex-col justify-between text-xs text-gray-400 py-4">
                                                <span>20</span>
                                                <span>15</span>
                                                <span>10</span>
                                                <span>5</span>
                                                <span>0</span>
                                            </div>
                                            {/* Chart line simulation */}
                                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                                                <polyline
                                                    fill="none"
                                                    stroke="#06b6d4"
                                                    strokeWidth="2"
                                                    points="40,130 100,120 160,80 220,60 280,70 340,50 380,55"
                                                />
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                                                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                <polygon
                                                    fill="url(#gradient)"
                                                    points="40,130 100,120 160,80 220,60 280,70 340,50 380,55 380,150 40,150"
                                                />
                                            </svg>
                                            {/* X-axis labels */}
                                            <div className="absolute bottom-0 left-10 right-4 flex justify-between text-xs text-gray-400 pb-1">
                                                <span>07-12 周一</span>
                                                <span>07-13 周二</span>
                                                <span>07-14 周三</span>
                                                <span>07-15 周四</span>
                                                <span>07-16 周五</span>
                                                <span>07-17 周六</span>
                                                <span>07-18 周日</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Statistics */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-800">成交额统计报表</h3>
                                            <div className="flex gap-2 text-sm text-gray-500">
                                                <span>近一周订单统计</span>
                                                <button className="text-cyan-600 hover:underline">本月</button>
                                            </div>
                                        </div>

                                        <div className="flex gap-8 mb-6">
                                            <div>
                                                <span className="text-gray-500 text-sm">本月成交额</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-gray-900">¥ 20000</span>
                                                    <span className="text-xs text-red-500">10% 相比上月</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-sm">本周成交额</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-gray-900">¥ 1500</span>
                                                    <span className="text-xs text-emerald-500">10% 相比上周</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bar Chart Placeholder */}
                                        <div className="h-48 bg-gray-50 rounded-lg flex items-end justify-between gap-4 px-8 pb-8 pt-4 relative">
                                            {/* Y-axis */}
                                            <div className="absolute left-2 top-0 h-full flex flex-col justify-between text-xs text-gray-400 py-4">
                                                <span>20</span>
                                                <span>15</span>
                                                <span>10</span>
                                                <span>5</span>
                                                <span>0</span>
                                            </div>
                                            {/* Bars */}
                                            {[40, 60, 80, 50, 70, 90, 45].map((height, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-sm"
                                                        style={{ height: `${height}%` }}
                                                    ></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                    <div key={task.id} className="border border-gray-100 rounded-xl p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group bg-gray-50/50 hover:bg-white" onClick={() => navigate(`/provider/submission/${task.id}`)}>
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
                                                <button
                                                    className="mt-3 bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/provider/submission/${task.id}`); }}
                                                >
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
                </main>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateServiceModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchMyServices();
                    }}
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

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {confirmAction.type === 'delete' ? '确认删除' :
                                confirmAction.type === 'unlist' ? '确认下架' : '确认重新提交'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {confirmAction.type === 'delete'
                                ? `确定要删除服务「${confirmAction.service.form_data?.title || '未命名服务'}」吗？此操作无法撤销。`
                                : confirmAction.type === 'unlist'
                                    ? `确定要下架服务「${confirmAction.service.form_data?.title || '未命名服务'}」吗？下架后用户将无法看到此服务。`
                                    : `确定要重新提交服务「${confirmAction.service.form_data?.title || '未命名服务'}」进行审核吗？`
                            }
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={actionLoading}
                            >
                                取消
                            </button>
                            <button
                                onClick={executeConfirmAction}
                                disabled={actionLoading}
                                className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2 ${confirmAction.type === 'delete'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : confirmAction.type === 'unlist'
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        处理中...
                                    </>
                                ) : (
                                    confirmAction.type === 'delete' ? '删除' :
                                        confirmAction.type === 'unlist' ? '下架' : '提交审核'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;

