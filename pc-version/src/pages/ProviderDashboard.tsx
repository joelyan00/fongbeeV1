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
    Calendar,
    Crown,
    MapPin,
    Clock,
    Lock
} from 'lucide-react';
import { getUserInfo, logout, providersApi, categoriesApi, formTemplatesApi, submissionsApi, citiesApi, aiApi } from '../services/api';
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


const CreateServiceModal = ({ onClose, onSuccess, service, readOnly = false, onEdit }: { onClose: () => void, onSuccess: () => void, service?: any, readOnly?: boolean, onEdit?: () => void }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Data Sources
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<{ id: string, name: string }[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        categoryId: '',
        categoryName: '',
        title: '',
        description: '',
        price: '',
        priceUnit: 'per_service',
        additionalRate: '',
        taxIncluded: false,
        inclusions: '',
        exclusions: '',
        materialsPolicy: 'client_provides',
        extraFees: '',
        duration: '',

        serviceMode: 'offline', // offline, remote, store
        serviceCity: [] as string[], // Unified naming with backend
        advanceBooking: '24',
        clientRequirements: '',
        cancellationPolicy: 'flexible',

        isLicensed: false,
        hasInsurance: false,
        depositRatio: 20, // Default 20%
        addOns: [] as { name: string; price: string }[],
        images: [] as string[],
    });

    // AI Edit State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiField, setAiField] = useState('');
    const [aiContent, setAiContent] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    // Populate form data when service is provided (Edit Mode)
    useEffect(() => {
        if (service && service.form_data) {
            const data = service.form_data;
            setFormData(prev => ({
                ...prev,
                categoryId: data.categoryId || data.category_id || '',
                title: data.title || '',
                description: data.description || '',
                price: String(data.price || ''),
                priceUnit: data.priceUnit || data.price_unit || 'per_service',
                additionalRate: String(data.additionalRate || data.additional_rate || ''),
                taxIncluded: data.taxIncluded || data.tax_included || false,
                inclusions: data.inclusions || '',
                exclusions: data.exclusions || '',
                materialsPolicy: data.materialsPolicy || data.materials_policy || 'client_provides',
                extraFees: data.extraFees || data.extra_fees || '',
                duration: String(data.duration || ''),
                serviceMode: data.serviceMode || data.service_mode || 'offline',
                serviceCity: data.serviceCity || data.service_city || [],
                advanceBooking: String(data.advanceBooking || data.advance_booking || '24'),
                clientRequirements: data.clientRequirements || data.client_requirements || '',
                cancellationPolicy: data.cancellationPolicy || data.cancellation_policy || 'flexible',
                isLicensed: data.isLicensed || data.is_licensed || false,
                hasInsurance: data.hasInsurance || data.has_insurance || false,
                depositRatio: data.depositRatio || data.deposit_ratio || 20,
                addOns: data.addOns || data.add_ons || [],
                images: data.images || [],
            }));
        }
    }, [service]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [catRes, cityRes] = await Promise.all([
                categoriesApi.getAll(),
                citiesApi.getActive()
            ]);
            setCategories(catRes.categories || []);
            setCities(Array.isArray(cityRes) ? cityRes : []);
        } catch (error) {
            console.error(error);
            showToast('加载数据失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAiRewrite = async (field: string, context: string) => {
        const text = (formData as any)[field];
        if (!text || text.length < 10) {
            showToast('请输入至少10个字以便AI优化', 'error');
            return;
        }

        setAiField(field);
        setAiContent('');
        setShowAiModal(true);
        setAiLoading(true);

        try {
            const res = await aiApi.rewrite(text, context);
            setAiContent(res.enhanced);
        } catch (error) {
            console.error(error);
            showToast('AI服务暂时不可用', 'error');
            setShowAiModal(false);
        } finally {
            setAiLoading(false);
        }
    };

    const confirmAiContent = () => {
        setFormData(prev => ({ ...prev, [aiField]: aiContent }));
        setShowAiModal(false);
        showToast('内容已优化', 'success');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (formData.images.length + files.length > 5) {
            showToast('最多上传5张图片', 'error');
            return;
        }

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                showToast(`文件 ${file.name} 超过5MB`, 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result as string]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.price || !formData.categoryId || formData.serviceCity.length === 0) {
            showToast('请填写必填项 (标题、价格、类目、服务区域)', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const category = categories.find(c => c.id === formData.categoryId);

            await providersApi.createService({
                ...formData,
                category: category?.name || '',
                price: parseFloat(formData.price),
                additionalRate: formData.additionalRate ? parseFloat(formData.additionalRate) : undefined,
                duration: formData.duration ? parseInt(formData.duration) : null,
                serviceMode: formData.serviceMode,
                advanceBooking: formData.advanceBooking ? parseInt(formData.advanceBooking) : 24,
                serviceCity: formData.serviceMode === 'remote' ? [] : formData.serviceCity,
                depositRatio: formData.depositRatio,
                addOns: formData.addOns.filter(a => a.name && a.price)

            });

            showToast('服务已提交审核', 'success');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            showToast(error.message || '提交失败', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{readOnly ? '查看标准服务' : '创建标准服务'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {readOnly && (
                        <style>{`
                            fieldset[disabled] input:not([type="checkbox"]), 
                            fieldset[disabled] textarea, 
                            fieldset[disabled] select {
                                border: none !important;
                                background-color: transparent !important;
                                box-shadow: none !important;
                                padding: 0 !important;
                                resize: none;
                                cursor: text;
                                color: #111827 !important; /* text-gray-900 */
                                font-weight: 500;
                            }
                            fieldset[disabled] select {
                                -webkit-appearance: none;
                                appearance: none;
                                background-image: none !important;
                                padding-right: 0 !important;
                            }
                            fieldset[disabled] .bg-white {
                                background-color: transparent !important;
                            }
                            /* Hide asterisk in read-only */
                            fieldset[disabled] .text-red-500 {
                                display: none;
                            }
                            /* Fix Currency Symbol Position */
                            fieldset[disabled] .relative {
                                display: flex !important;
                                align-items: center !important;
                            }
                            fieldset[disabled] .relative span.absolute.text-gray-500 {
                                position: static !important;
                                transform: none !important;
                                color: #111827 !important;
                                margin-right: 4px !important;
                                display: inline-block !important;
                            }
                            fieldset[disabled] input.pl-7 {
                                padding-left: 0 !important;
                            }
                        `}</style>
                    )}
                    <fieldset disabled={readOnly} className="w-full">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Left Column -> Main Column */}
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FileText size={18} className="text-emerald-600" />
                                        基本信息
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <span className="text-red-500">*</span> 服务类目
                                            </label>
                                            <select
                                                value={formData.categoryId}
                                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                            >
                                                <option value="">请选择类目</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <span className="text-red-500">*</span> 服务方式
                                            </label>
                                            <div className="flex gap-2">
                                                {[
                                                    { v: 'offline', l: '上门服务' },
                                                    { v: 'remote', l: '远程服务' },
                                                    { v: 'store', l: '到店/律所' }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.v}
                                                        onClick={() => setFormData({ ...formData, serviceMode: opt.v })}
                                                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${formData.serviceMode === opt.v
                                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                            : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                                                            }`}
                                                    >
                                                        {opt.l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>



                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <span className="text-red-500">*</span> 服务标题
                                            </label>
                                            <input

                                                type="text"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                placeholder="例如：专业深度保洁"
                                                maxLength={50}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    <span className="text-red-500">*</span> 服务描述
                                                </label>
                                                {formData.description.length >= 10 && (
                                                    <button
                                                        onClick={() => handleAiRewrite('description', 'service_description')}
                                                        className="text-xs text-purple-600 flex items-center gap-1 hover:bg-purple-50 px-2 py-0.5 rounded transition-colors"
                                                    >
                                                        <Crown size={12} /> AI 辅助编辑
                                                    </button>
                                                )}
                                            </div>
                                            <textarea
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none"
                                                placeholder="请详细描述提供的服务内容、特点等..."
                                                maxLength={500}
                                            />
                                            <p className="text-xs text-gray-400 text-right">{formData.description.length}/500</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Service Area & Requirements */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <MapPin size={18} className="text-emerald-600" />
                                        服务范围与要求
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <span className="text-red-500">*</span> 服务覆盖{formData.serviceMode === 'remote' ? ' (远程服务可不选)' : '城市'}
                                            </label>
                                            {formData.serviceMode !== 'remote' && (
                                                <>
                                                    <div className="flex flex-wrap gap-2 mb-2">

                                                        {formData.serviceCity.map((city: string) => (
                                                            <span key={city} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                                                                {city}
                                                                <button
                                                                    onClick={() => setFormData(prev => ({
                                                                        ...prev,
                                                                        serviceCity: prev.serviceCity.filter((c: string) => c !== city)
                                                                    }))}
                                                                    className="hover:text-emerald-900"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <select
                                                        onChange={e => {
                                                            const selectedCity = e.target.value;
                                                            if (selectedCity && !formData.serviceCity.includes(selectedCity)) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    serviceCity: [...prev.serviceCity, selectedCity]
                                                                }));
                                                            }
                                                            e.target.value = '';
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                                    >
                                                        <option value="">添加城市...</option>
                                                        {cities.map(c => (
                                                            <option key={c.id} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">预计时长 (小时)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.duration}
                                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">提前预约 (小时)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.advanceBooking}
                                                        onChange={e => setFormData({ ...formData, advanceBooking: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-sm font-medium text-gray-700">客户须知 / 准备事项</label>
                                                    {formData.clientRequirements.length >= 10 && !readOnly && (
                                                        <button
                                                            onClick={() => handleAiRewrite('clientRequirements', 'client_requirements')}
                                                            className="text-xs text-purple-600 flex items-center gap-1 hover:bg-purple-50 px-2 py-0.5 rounded transition-colors"
                                                        >
                                                            <Crown size={12} /> AI 辅助编辑
                                                        </button>
                                                    )}
                                                </div>
                                                <textarea
                                                    value={formData.clientRequirements}
                                                    onChange={e => setFormData({ ...formData, clientRequirements: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none"
                                                    placeholder="例如：需提供水电、车位..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column -> Continued below */}
                                <div className="space-y-6">
                                    {/* Pricing */}
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <CreditCard size={18} className="text-emerald-600" />
                                            价格与政策
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        <span className="text-red-500">*</span> 价格 (CAD)
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                                        <input
                                                            type="number"
                                                            value={formData.price}
                                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        <span className="text-red-500">*</span> 计价单位
                                                    </label>
                                                    <select
                                                        value={formData.priceUnit}
                                                        onChange={e => setFormData({ ...formData, priceUnit: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                                    >
                                                        <option value="per_service">每次</option>
                                                        <option value="per_hour">每小时</option>
                                                        <option value="per_sqft">每平方英尺</option>
                                                        <option value="per_unit">每单位</option>
                                                        <option value="per_room">每房间</option>
                                                        <option value="per_unit">每单位</option>
                                                        <option value="per_room">每房间</option>
                                                        <option value="per_person">每人</option>
                                                        <option value="per_case">每案/每单</option>
                                                        <option value="base_plus_hourly">起步价+超时费</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {formData.priceUnit === 'base_plus_hourly' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">超时费率 ($/小时)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.additionalRate}
                                                        onChange={e => setFormData({ ...formData, additionalRate: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="taxIncluded"
                                                    checked={formData.taxIncluded}
                                                    onChange={e => setFormData({ ...formData, taxIncluded: e.target.checked })}
                                                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                                />
                                                <label htmlFor="taxIncluded" className="text-sm text-gray-700">价格已含税 (GST/HST)</label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">定金比例 (%)</label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={formData.depositRatio}
                                                        onChange={e => {
                                                            let val = parseInt(e.target.value);
                                                            if (val < 0) val = 0;
                                                            if (val > 100) val = 100;
                                                            setFormData({ ...formData, depositRatio: val });
                                                        }}
                                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        {[20, 30, 50, 100].map(ratio => (
                                                            <button
                                                                key={ratio}
                                                                onClick={() => setFormData({ ...formData, depositRatio: ratio })}
                                                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${formData.depositRatio === ratio
                                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium'
                                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'
                                                                    }`}
                                                            >
                                                                {ratio}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">客户预订时需支付的定金比例，剩余费用线下结算。</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">材料/耗材政策</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { v: 'included', l: '已包含' },
                                                        { v: 'client_provides', l: '客户提供' },
                                                        { v: 'charged_separately', l: '费用另计' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.v}
                                                            onClick={() => setFormData({ ...formData, materialsPolicy: opt.v })}
                                                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${formData.materialsPolicy === opt.v
                                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                                : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                                                                }`}
                                                        >
                                                            {opt.l}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">取消政策</label>
                                                <select
                                                    value={formData.cancellationPolicy}
                                                    onChange={e => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                                >
                                                    <option value="flexible">灵活 (24小时前全退)</option>
                                                    <option value="moderate">适中 (48小时前全退)</option>
                                                    <option value="strict">严格 (7天前全退)</option>
                                                    <option value="non_refundable">不可退款</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Images */}
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <Camera size={18} className="text-emerald-600" />
                                            服务图片
                                        </h3>

                                        <div className="grid grid-cols-4 gap-2">
                                            {formData.images.map((img, idx) => (
                                                <div key={idx} className="aspect-square relative group rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    {!readOnly && (
                                                        <button
                                                            onClick={() => setFormData(prev => ({
                                                                ...prev,
                                                                images: prev.images.filter((_, i) => i !== idx)
                                                            }))}
                                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {formData.images.length < 5 && !readOnly && (
                                                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 text-gray-400 hover:text-emerald-500 transition-colors">
                                                    <Plus size={24} />
                                                    <span className="text-xs mt-1">上传</span>
                                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                                </label>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">最多5张，展示您的服务效果</p>
                                    </div>
                                </div>
                            </div>

                            {/* Add-ons Section (Always visible at bottom) */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Plus size={18} className="text-emerald-600" />
                                    附加服务 (Add-ons)
                                </h3>

                                <div className="space-y-3">
                                    {formData.addOns.map((addon, idx) => (
                                        <div key={idx} className="flex gap-4 items-center">
                                            <input
                                                type="text"
                                                placeholder="服务名称"
                                                value={addon.name}
                                                onChange={e => {
                                                    const newAddons = [...formData.addOns];
                                                    newAddons[idx].name = e.target.value;
                                                    setFormData({ ...formData, addOns: newAddons });
                                                }}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                            <div className="relative w-32">
                                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                                <input
                                                    type="number"
                                                    placeholder="价格"
                                                    value={addon.price}
                                                    onChange={e => {
                                                        const newAddons = [...formData.addOns];
                                                        newAddons[idx].price = e.target.value;
                                                        setFormData({ ...formData, addOns: newAddons });
                                                    }}
                                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                            {!readOnly && (
                                                <button
                                                    onClick={() => {
                                                        const newAddons = [...formData.addOns];
                                                        newAddons.splice(idx, 1);
                                                        setFormData({ ...formData, addOns: newAddons });
                                                    }}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {!readOnly && (
                                        <button
                                            onClick={() => setFormData({ ...formData, addOns: [...formData.addOns, { name: '', price: '' }] })}
                                            className="flex items-center gap-2 text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors font-medium border border-dashed border-emerald-300 w-full justify-center"
                                        >
                                            <Plus size={18} /> 添加新项
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-xl">
                    {readOnly && (
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 font-medium flex items-center gap-2"
                        >
                            <span className="text-lg">✎</span> 编辑
                        </button>
                    )}
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        {readOnly ? '关闭' : '取消'}
                    </button>
                    {!readOnly && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium shadow-sm shadow-emerald-200"
                        >
                            {submitting ? '提交中...' : '提交审核'}
                        </button>
                    )}
                </div>
            </div >

            {/* AI Edit Modal */}
            {
                showAiModal && (
                    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-purple-600 p-4 flex justify-between items-center text-white">
                                <h3 className="font-bold flex items-center gap-2"><Crown size={18} /> AI 智能优化</h3>
                                <button onClick={() => setShowAiModal(false)}><X size={18} /></button>
                            </div>
                            <div className="p-6">
                                {aiLoading ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mb-4"></div>
                                        <p>AI 正在思考优化方案...</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-500 mb-3">为您生成的优化建议：</p>
                                        <textarea
                                            className="w-full h-40 p-3 bg-purple-50 border border-purple-100 rounded-lg text-gray-800 text-sm resize-none focus:outline-none"
                                            value={aiContent}
                                            onChange={(e) => setAiContent(e.target.value)}
                                        />
                                    </>
                                )}
                            </div>
                            <div className="p-4 border-t border-gray-100 flex gap-3 justify-end">
                                <button onClick={() => setShowAiModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">取消</button>
                                <button onClick={confirmAiContent} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">确认使用</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
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
    const [readOnly, setReadOnly] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: string; service: any } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
    const [subscriptionTab, setSubscriptionTab] = useState<'credits' | 'membership'>('credits');
    const [selectedTier, setSelectedTier] = useState(0);
    const [selectedDuration, setSelectedDuration] = useState(0);
    const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
    const [creditAmount, setCreditAmount] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
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
            const [submissionsRes, servicesRes] = await Promise.all([
                submissionsApi.getMySubmissions({ type: 'provider_listing' }),
                providersApi.getMyServices()
                    .catch(e => {
                        console.error('Failed to fetch provider services:', e);
                        return { services: [] };
                    })
            ]);

            const submissionList = submissionsRes.submissions || [];

            // console.log('DEBUG: Raw Provider Services:', servicesRes.services);

            // Map provider_services to match submission structure
            const serviceList = (servicesRes.services || []).map(s => {
                // console.log('DEBUG: Mapping Service:', s.id, 'Category:', s.category);
                return {
                    id: s.id,
                    source: 'provider_services', // Tag source
                    status: 'completed', // Simulate submission workflow status
                    listing_status: s.status, // Map real status (pending/approved/rejected)
                    created_at: s.created_at,
                    // Mock template structure
                    template_id: null,
                    form_templates: { name: s.category || '标准服务' },
                    service_category: s.category, // Map directly to service_category for display
                    form_data: {
                        title: s.title,
                        description: s.description,
                        price: s.price,
                        priceUnit: s.price_unit,
                        serviceCity: s.service_city,
                        images: s.images,
                        categoryId: s.category_id,
                        service_mode: s.service_mode,
                        // Preserve other fields
                        ...s
                    }
                }
            });
            // console.log('DEBUG: Mapped List:', serviceList);

            // Merge lists. (Ideally custom deduplication if needed, but assuming disjoint for now)
            // Show new services first
            setMyServices([...serviceList, ...submissionList]);
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
            if (service.source === 'provider_services') {
                await providersApi.updateService(service.id, { listing_status: 'unlisted' });
            } else {
                await submissionsApi.update(service.id, { listing_status: 'unlisted' });
            }
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
            if (service.source === 'provider_services') {
                await providersApi.updateService(service.id, { listing_status: 'pending' });
            } else {
                // Resubmit for approval
                await submissionsApi.update(service.id, { listing_status: 'pending' });
            }
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
        if (service.listing_status === 'approved') {
            showToast('已上架的服务无法直接编辑，请先下架', 'error');
            return;
        }
        setEditingService(service);
        setReadOnly(false);
        setShowCreateModal(true); // Reuse the create modal
        setActiveActionMenu(null);
    };

    const handleViewService = (service: any) => {
        setEditingService(service);
        setReadOnly(true);
        setShowCreateModal(true);
        setActiveActionMenu(null);
    };

    const handleEditFromView = () => {
        // Check if service is listed (approved)
        if (editingService.listing_status === 'approved') {
            showToast('请先下架该服务后才能进行编辑', 'error');
            return;
        }
        setReadOnly(false);
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
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
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
                        <SidebarItem id="contracts" label="合同管理" icon={FileText} />
                        <SidebarItem id="service_area" label="服务区域管理" icon={MapPin} />
                        <SidebarItem id="service_time" label="服务时间管理" icon={Clock} />
                        <SidebarItem id="payment_methods" label="收款方式" icon={CreditCard} />
                        <SidebarItem id="change_password" label="修改密码" icon={Lock} />
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
                                        onClick={() => { setReadOnly(false); setEditingService(null); setShowCreateModal(true); }}
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
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">服务ID</th>
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
                                                            <div className="font-mono text-xs text-gray-500">{svc.service_identity_id || '-'}</div>
                                                        </td>
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
                                                                    className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${svc.listing_status === 'approved'
                                                                        ? 'text-gray-400 cursor-not-allowed'
                                                                        : 'text-blue-600 hover:bg-blue-50'
                                                                        }`}
                                                                    title={svc.listing_status === 'approved' ? "请先下架服务再编辑" : "编辑"}
                                                                    disabled={svc.listing_status === 'approved'}
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
                                                                <button
                                                                    onClick={() => handleViewService(svc)}
                                                                    className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                                                                    title="查看"
                                                                >
                                                                    <FileText size={14} /> 查看
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
                                        onClick={() => { setReadOnly(false); setEditingService(null); setShowCreateModal(true); }}
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
                                                ? 'border-emerald-500 text-emerald-600 font-medium'
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
                                                        <a href="#" className="text-emerald-600 hover:underline font-medium">({quote.projectName})</a>
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
                                                            <span className="text-emerald-600">{quote.statusText}</span>
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
                                                                className="px-4 py-1.5 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600"
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
                                        <button className="px-3 py-1 bg-emerald-500 text-white rounded">1</button>
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

                    {activeTab === 'inbox' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            {/* Header with count and filters */}
                            <div className="bg-emerald-500 text-white px-6 py-4 rounded-t-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-lg font-bold">收件箱(0)</h2>
                                <div className="flex flex-wrap items-center gap-3">
                                    <select className="bg-white text-gray-700 text-sm px-3 py-1.5 rounded border-none outline-none">
                                        <option value="all">全部</option>
                                        <option value="unread">未读</option>
                                        <option value="read">已读</option>
                                        <option value="system">系统通知</option>
                                        <option value="order">订单消息</option>
                                    </select>
                                    <div className="flex items-center gap-2 text-white">
                                        <input
                                            type="date"
                                            className="bg-white text-gray-700 text-sm px-3 py-1.5 rounded border-none outline-none"
                                            placeholder="开始日期"
                                        />
                                        <span>至</span>
                                        <input
                                            type="date"
                                            className="bg-white text-gray-700 text-sm px-3 py-1.5 rounded border-none outline-none"
                                            placeholder="结束日期"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Message List or Empty State */}
                            <div className="flex-1 p-6 flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">暂无消息</p>
                                    <p className="text-sm mt-2">当有新消息时，将在这里显示</p>
                                </div>
                            </div>

                            {/* Mock Messages - Hidden for now, will show when there are messages */}
                            {false && (
                                <div className="flex-1 divide-y divide-gray-100">
                                    {[
                                        { id: 1, type: 'order', title: '新订单通知', preview: '您有一个新的订单需要处理...', time: '10分钟前', read: false },
                                        { id: 2, type: 'system', title: '系统通知', preview: '您的账户信息已更新...', time: '1小时前', read: true },
                                        { id: 3, type: 'message', title: '客户留言', preview: '请问明天可以上门服务吗？', time: '2小时前', read: false },
                                    ].map(msg => (
                                        <div key={msg.id} className={`p-4 hover:bg-gray-50 cursor-pointer flex items-start gap-4 ${!msg.read ? 'bg-emerald-50/50' : ''}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${msg.type === 'order' ? 'bg-green-500' :
                                                msg.type === 'system' ? 'bg-blue-500' : 'bg-pink-500'
                                                }`}>
                                                {msg.type === 'order' ? '订' : msg.type === 'system' ? '系' : '消'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className={`font-medium truncate ${!msg.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {msg.title}
                                                        {!msg.read && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block"></span>}
                                                    </h4>
                                                    <span className="text-xs text-gray-400 shrink-0">{msg.time}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 truncate mt-1">{msg.preview}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            {/* Header with count and filters */}
                            <div className="bg-emerald-500 text-white px-6 py-4 rounded-t-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-lg font-bold">交易记录</h2>
                                <div className="flex flex-wrap items-center gap-3">
                                    <select className="bg-white text-gray-700 text-sm px-3 py-1.5 rounded border-none outline-none">
                                        <option value="all">全部</option>
                                        <option value="income">收入</option>
                                        <option value="expense">支出</option>
                                        <option value="withdraw">提现</option>
                                    </select>
                                    <div className="flex items-center gap-2 text-white">
                                        <input
                                            type="date"
                                            className="bg-white text-gray-700 text-sm px-3 py-1.5 rounded border-none outline-none"
                                            placeholder="开始日期"
                                        />
                                        <span>至</span>
                                        <input
                                            type="date"
                                            className="bg-white text-gray-700 text-sm px-3 py-1.5 rounded border-none outline-none"
                                            placeholder="结束日期"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Transaction List or Empty State */}
                            <div className="flex-1 p-6 flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">暂无交易记录</p>
                                    <p className="text-sm mt-2">当有交易时，将在这里显示</p>
                                </div>
                            </div>

                            {/* Mock Transactions - Hidden for now, will show when there are transactions */}
                            {false && (
                                <div className="flex-1">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 text-sm text-gray-500 font-medium border-b border-gray-100">
                                        <span>交易时间</span>
                                        <span>交易类型</span>
                                        <span>订单编号</span>
                                        <span>交易金额</span>
                                        <span>状态</span>
                                    </div>
                                    {/* Table Body */}
                                    <div className="divide-y divide-gray-100">
                                        {[
                                            { id: 1, time: '2025/07/28 17:40', type: '订单收入', orderNo: 'YF202507280001', amount: '+¥450.00', status: '已完成' },
                                            { id: 2, time: '2025/07/27 14:20', type: '提现', orderNo: '-', amount: '-¥1,000.00', status: '处理中' },
                                            { id: 3, time: '2025/07/26 10:00', type: '订单收入', orderNo: 'YF202507260002', amount: '+¥180.00', status: '已完成' },
                                        ].map(tx => (
                                            <div key={tx.id} className="grid grid-cols-5 gap-4 px-6 py-4 text-sm hover:bg-gray-50">
                                                <span className="text-gray-600">{tx.time}</span>
                                                <span className="text-gray-800">{tx.type}</span>
                                                <span className="text-gray-500">{tx.orderNo}</span>
                                                <span className={tx.amount.startsWith('+') ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                                                    {tx.amount}
                                                </span>
                                                <span className={tx.status === '已完成' ? 'text-gray-500' : 'text-orange-500'}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            {/* Tabs */}
                            <div className="border-b border-gray-100 px-6">
                                <div className="flex gap-8">
                                    <button
                                        className={`py-4 text-sm font-medium border-b-2 transition-colors ${subscriptionTab === 'credits'
                                            ? 'text-emerald-600 border-emerald-500'
                                            : 'text-gray-500 border-transparent hover:text-gray-700'
                                            }`}
                                        onClick={() => setSubscriptionTab('credits')}
                                    >
                                        购买积分
                                    </button>
                                    <button
                                        className={`py-4 text-sm font-medium border-b-2 transition-colors ${subscriptionTab === 'membership'
                                            ? 'text-emerald-600 border-emerald-500'
                                            : 'text-gray-500 border-transparent hover:text-gray-700'
                                            }`}
                                        onClick={() => setSubscriptionTab('membership')}
                                    >
                                        成为会员
                                    </button>
                                </div>
                            </div>

                            {/* Credits Tab Content */}
                            {subscriptionTab === 'credits' && (
                                <div className="p-6 space-y-6">
                                    {/* Current Credits */}
                                    <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-gray-500">我的积分</div>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-4xl font-bold text-emerald-600">200</span>
                                                <span className="text-sm text-gray-500">可兑换抵扣次数：10次</span>
                                            </div>
                                        </div>
                                        <button
                                            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium"
                                            onClick={() => setShowBuyCreditsModal(true)}
                                        >
                                            购买积分
                                        </button>
                                    </div>

                                    {/* Sub-tabs */}
                                    <div className="flex gap-4 border-b border-gray-200">
                                        <button className="pb-2 text-sm font-medium text-emerald-600 border-b-2 border-emerald-500">自动充值</button>
                                        <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">积分记录</button>
                                    </div>

                                    {/* Auto Recharge Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-600">自动购买积分</span>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="autoBuy" className="text-emerald-500" />
                                                <span className="text-sm">开启</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="autoBuy" defaultChecked className="text-emerald-500" />
                                                <span className="text-sm text-emerald-600">关闭</span>
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                placeholder="请输入积分"
                                                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                            <span className="text-sm text-gray-500">请输入100的整数倍，最低购买100</span>
                                        </div>

                                        <div className="border-t border-gray-100 pt-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className="text-gray-600">积分赠送</span>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="giftCredits" className="text-emerald-500" />
                                                    <span className="text-sm">开启</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="giftCredits" defaultChecked className="text-emerald-500" />
                                                    <span className="text-sm text-emerald-600">关闭</span>
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    placeholder="请输入积分"
                                                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                                <span className="text-sm text-gray-500">用户分享并成功下单后，可赠送积分</span>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button className="w-full py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium">
                                                保存
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Membership Tab Content */}
                            {subscriptionTab === 'membership' && (
                                <div className="p-6 space-y-6">
                                    {/* Membership Tiers */}
                                    <div>
                                        <h3 className="text-gray-700 font-medium mb-4">选择会员等级</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { level: '初级会员', color: 'from-purple-600 to-purple-800', benefits: ['积分获赠：每月100', '报价次数：每月5次', '等级权益：...'] },
                                                { level: '中级会员', color: 'from-emerald-500 to-blue-600', benefits: ['积分获赠：每月赠送500', '报价次数：每月10次', '等级权益：...'] },
                                                { level: '高级会员', color: 'from-amber-500 to-orange-600', benefits: ['积分获赠：每月赠送1000', '报价次数：不限次数', '等级权益：...'] },
                                            ].map((tier, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`relative rounded-xl p-5 text-white bg-gradient-to-br ${tier.color} cursor-pointer hover:shadow-lg transition-shadow ${selectedTier === idx ? 'ring-2 ring-offset-2 ring-emerald-400' : ''
                                                        }`}
                                                    onClick={() => setSelectedTier(idx)}
                                                >
                                                    <div className="absolute top-3 right-3">
                                                        <Crown size={24} className="text-white/80" />
                                                    </div>
                                                    <h4 className="text-lg font-bold mb-3">{tier.level}</h4>
                                                    <ul className="space-y-1 text-sm text-white/90">
                                                        {tier.benefits.map((b, i) => (
                                                            <li key={i}>{b}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Duration Selection */}
                                    <div>
                                        <h3 className="text-gray-700 font-medium mb-4">选择开通时长</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { duration: '1个月', price: 200 },
                                                { duration: '3个月', price: 560 },
                                                { duration: '12个月', price: 1600 },
                                            ].map((option, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${selectedDuration === idx
                                                        ? 'border-emerald-500 bg-emerald-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    onClick={() => setSelectedDuration(idx)}
                                                >
                                                    <div className="text-gray-700">{option.duration}</div>
                                                    <div className="text-xl font-bold text-pink-500 mt-1">¥{option.price}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Continuous Subscription */}
                                    <div>
                                        <h3 className="text-gray-700 font-medium mb-4">连续开通时长</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { duration: '连续开通1个月', price: 1600 },
                                                { duration: '连续开通3个月', price: 1600 },
                                                { duration: '连续开通12个月', price: 1600 },
                                            ].map((option, idx) => (
                                                <div
                                                    key={idx}
                                                    className="border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-gray-300"
                                                >
                                                    <div className="text-gray-600 text-sm">{option.duration}</div>
                                                    <div className="text-lg font-bold text-pink-500 mt-1">¥{option.price}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Footer */}
                                    <div className="flex items-center justify-end gap-6 pt-4 border-t border-gray-100">
                                        <div className="text-right">
                                            <span className="text-gray-500">确认待支付</span>
                                            <span className="text-3xl font-bold text-pink-500 ml-2">¥200</span>
                                        </div>
                                        <button className="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium">
                                            立即购买
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 text-right">开通服务即阅读《会员协议》《服务条款》</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contracts Management */}
                    {activeTab === 'contracts' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">合同管理</h2>
                            </div>
                            <div className="flex gap-4 px-4 pt-4 text-sm">
                                {['全部', '服务合同', '框架协议', '保密协议'].map((tab, i) => (
                                    <button
                                        key={i}
                                        className={`pb-2 border-b-2 ${i === 0 ? 'border-emerald-500 text-emerald-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 p-4">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-500 border-b">
                                            <th className="pb-3 font-medium">合同编号</th>
                                            <th className="pb-3 font-medium">合同名称</th>
                                            <th className="pb-3 font-medium">类型</th>
                                            <th className="pb-3 font-medium">签订日期</th>
                                            <th className="pb-3 font-medium">到期日期</th>
                                            <th className="pb-3 font-medium">状态</th>
                                            <th className="pb-3 font-medium">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 text-sm text-gray-600">CT20240101001</td>
                                            <td className="py-4 text-sm text-gray-800 font-medium">家政服务合作协议</td>
                                            <td className="py-4 text-sm text-gray-600">服务合同</td>
                                            <td className="py-4 text-sm text-gray-600">2024-01-01</td>
                                            <td className="py-4 text-sm text-gray-600">2025-01-01</td>
                                            <td className="py-4"><span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">生效中</span></td>
                                            <td className="py-4">
                                                <button className="text-emerald-600 text-sm hover:text-cyan-700 mr-3">查看</button>
                                                <button className="text-gray-500 text-sm hover:text-gray-700">下载</button>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 text-sm text-gray-600">CT20231201002</td>
                                            <td className="py-4 text-sm text-gray-800 font-medium">平台服务框架协议</td>
                                            <td className="py-4 text-sm text-gray-600">框架协议</td>
                                            <td className="py-4 text-sm text-gray-600">2023-12-01</td>
                                            <td className="py-4 text-sm text-gray-600">2024-12-01</td>
                                            <td className="py-4"><span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">生效中</span></td>
                                            <td className="py-4">
                                                <button className="text-emerald-600 text-sm hover:text-cyan-700 mr-3">查看</button>
                                                <button className="text-gray-500 text-sm hover:text-gray-700">下载</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Service Area Management */}
                    {activeTab === 'service_area' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">服务区域管理</h2>
                                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2 text-sm">
                                    <Plus size={16} />
                                    添加服务区域
                                </button>
                            </div>
                            <div className="flex-1 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="border border-gray-200 rounded-xl p-4 hover:border-emerald-500 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-emerald-500" />
                                                <span className="font-medium text-gray-800">上海市黄浦区</span>
                                            </div>
                                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded">已启用</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">覆盖范围：全区</p>
                                        <div className="flex gap-2">
                                            <button className="text-sm text-emerald-600 hover:text-cyan-700">编辑</button>
                                            <button className="text-sm text-red-500 hover:text-red-600">删除</button>
                                        </div>
                                    </div>
                                    <div className="border border-gray-200 rounded-xl p-4 hover:border-emerald-500 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-emerald-500" />
                                                <span className="font-medium text-gray-800">上海市静安区</span>
                                            </div>
                                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded">已启用</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">覆盖范围：全区</p>
                                        <div className="flex gap-2">
                                            <button className="text-sm text-emerald-600 hover:text-cyan-700">编辑</button>
                                            <button className="text-sm text-red-500 hover:text-red-600">删除</button>
                                        </div>
                                    </div>
                                    <div className="border border-gray-200 rounded-xl p-4 hover:border-emerald-500 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-emerald-500" />
                                                <span className="font-medium text-gray-800">上海市普陀区</span>
                                            </div>
                                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded">已启用</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">覆盖范围：全区</p>
                                        <div className="flex gap-2">
                                            <button className="text-sm text-emerald-600 hover:text-cyan-700">编辑</button>
                                            <button className="text-sm text-red-500 hover:text-red-600">删除</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Service Time Management */}
                    {activeTab === 'service_time' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">服务时间管理</h2>
                            </div>
                            <div className="flex-1 p-6">
                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-emerald-500" />
                                            常规工作时间
                                        </h3>
                                        <div className="space-y-3">
                                            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, i) => (
                                                <div key={day} className="flex items-center gap-4">
                                                    <div className="w-16 text-gray-700">{day}</div>
                                                    <label className="flex items-center gap-2">
                                                        <input type="checkbox" defaultChecked={i < 6} className="rounded text-emerald-500" />
                                                        <span className="text-sm text-gray-600">可接单</span>
                                                    </label>
                                                    <input type="time" defaultValue="09:00" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                                                    <span className="text-gray-400">至</span>
                                                    <input type="time" defaultValue="18:00" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">保存设置</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Methods */}
                    {activeTab === 'payment_methods' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">收款方式</h2>
                                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2 text-sm">
                                    <Plus size={16} />
                                    添加收款方式
                                </button>
                            </div>
                            <div className="flex-1 p-6">
                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <span className="text-green-600 font-bold text-lg">微</span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">微信收款</div>
                                                <div className="text-sm text-gray-500">已绑定：张*明</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-1 text-xs bg-cyan-100 text-emerald-600 rounded">默认</span>
                                            <button className="text-sm text-emerald-600 hover:text-cyan-700">编辑</button>
                                            <button className="text-sm text-red-500 hover:text-red-600">删除</button>
                                        </div>
                                    </div>
                                    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <span className="text-blue-600 font-bold text-lg">支</span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">支付宝收款</div>
                                                <div className="text-sm text-gray-500">已绑定：138****1234</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="text-sm text-gray-500 hover:text-gray-700">设为默认</button>
                                            <button className="text-sm text-emerald-600 hover:text-cyan-700">编辑</button>
                                            <button className="text-sm text-red-500 hover:text-red-600">删除</button>
                                        </div>
                                    </div>
                                    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                                <CreditCard className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">银行卡</div>
                                                <div className="text-sm text-gray-500">招商银行 尾号 8888</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="text-sm text-gray-500 hover:text-gray-700">设为默认</button>
                                            <button className="text-sm text-emerald-600 hover:text-cyan-700">编辑</button>
                                            <button className="text-sm text-red-500 hover:text-red-600">删除</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Change Password */}
                    {activeTab === 'change_password' && (
                        <div className="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-gray-100">
                            <div className="p-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800">修改密码</h2>
                            </div>
                            <div className="flex-1 p-6">
                                <div className="max-w-md">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">当前密码</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    placeholder="请输入当前密码"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">新密码</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    placeholder="请输入新密码"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">密码长度为8-20位，必须包含数字和字母</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">确认新密码</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    placeholder="请再次输入新密码"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button className="w-full py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium">
                                                确认修改
                                            </button>
                                        </div>
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
                                                ? 'border-emerald-500 text-emerald-600 font-medium'
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
                                            tagColor = 'bg-cyan-100 text-emerald-600';
                                            amountColor = 'text-emerald-500';
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
                                                        <span className="text-emerald-600 text-sm">{order.statusText}</span>
                                                        <div className="flex gap-2">
                                                            <button className="px-4 py-1.5 text-gray-500 text-sm hover:text-gray-700">
                                                                查看评情
                                                            </button>
                                                            <button
                                                                className="px-4 py-1.5 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600"
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
                                        <button className="px-3 py-1 bg-emerald-500 text-white rounded">1</button>
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
                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 rounded-xl text-white shadow-lg">
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
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    日程安排
                                </button>
                                <button
                                    onClick={() => setSubTab('revenue')}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${subTab === 'revenue'
                                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50 rounded-t-lg'
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
                                                        isToday ? 'bg-emerald-500 text-white font-bold' :
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
                                                <button className="text-emerald-600 hover:underline">本月</button>
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
                                        <div className="h-48 bg-gradient-to-t from-emerald-50 to-white rounded-lg flex items-end justify-between px-4 pb-4 pt-8 relative border border-gray-100">
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
                                                <button className="text-emerald-600 hover:underline">本月</button>
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
                                                        className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm"
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
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingService(null);
                        setReadOnly(false);
                    }}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        setEditingService(null);
                        fetchMyServices();
                        setReadOnly(false);
                    }}
                    service={editingService}
                    readOnly={readOnly}
                    onEdit={handleEditFromView}
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

            {/* Buy Credits Modal */}
            {showBuyCreditsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">购买积分</h3>
                            <button
                                onClick={() => setShowBuyCreditsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">积分数量</label>
                                <input
                                    type="number"
                                    placeholder="输入积分数量"
                                    value={creditAmount}
                                    onChange={(e) => setCreditAmount(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">请输入100的整数倍，最低购买100</p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">支付金额</label>
                                <input
                                    type="text"
                                    placeholder="输入支付金额"
                                    value={creditAmount ? `¥${parseInt(creditAmount) || 0}` : ''}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-600"
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="w-4 h-4 text-emerald-500 rounded"
                                />
                                <span className="text-sm text-gray-600">
                                    已阅读并同意 <span className="text-emerald-600 hover:underline cursor-pointer">《积分购买协议》</span>
                                </span>
                            </label>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowBuyCreditsModal(false)}
                                className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                关闭
                            </button>
                            <button
                                onClick={() => {
                                    if (!agreedToTerms) {
                                        showToast('请先同意积分购买协议', 'error');
                                        return;
                                    }
                                    if (!creditAmount || parseInt(creditAmount) < 100) {
                                        showToast('请输入至少100积分', 'error');
                                        return;
                                    }
                                    // TODO: Implement payment logic
                                    showToast('正在跳转支付...', 'success');
                                    setShowBuyCreditsModal(false);
                                }}
                                className="flex-1 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium"
                            >
                                去支付
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;

