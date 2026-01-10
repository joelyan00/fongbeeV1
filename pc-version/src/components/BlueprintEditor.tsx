import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    ChevronLeft,
    FileText,
    List,
    HelpCircle,
    DollarSign,
    Image,
    Eye,
    Copy
} from 'lucide-react';
import { blueprintsApi } from '../services/api';
import type { Blueprint } from '../services/api';

interface BlueprintEditorProps {
    category: 'standard_service' | 'simple_custom' | 'complex_custom';
    categoryLabel: string;
}

const BlueprintEditor: React.FC<BlueprintEditorProps> = ({ category, categoryLabel }) => {
    const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'sop' | 'faq' | 'pricing'>('content');

    // Form state
    const [formData, setFormData] = useState<Partial<Blueprint>>({
        name: '',
        description: '',
        category: category,
        pre_filled_content: {
            title: '',
            subtitle: '',
            service_description: '',
            highlights: [],
            included_items: [],
            excluded_items: [],
            duration_estimate: '',
            price_range: { min: 0, max: 0, unit: 'per_service' }
        },
        sop_content: '',
        faq_content: [],
        pricing_guide: { base_price: 0, price_factors: [], commission_rate: 0.1 },
        images: [],
        status: 'draft'
    });

    useEffect(() => {
        fetchBlueprints();
    }, [category]);

    const fetchBlueprints = async () => {
        setLoading(true);
        try {
            const res = await blueprintsApi.getAll({ category });
            setBlueprints(res.blueprints || []);
        } catch (error) {
            console.error('Failed to fetch blueprints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedBlueprint(null);
        setFormData({
            name: '',
            description: '',
            category: category,
            pre_filled_content: {
                title: '',
                subtitle: '',
                service_description: '',
                highlights: [],
                included_items: [],
                excluded_items: [],
                duration_estimate: '',
                price_range: { min: 0, max: 0, unit: 'per_service' }
            },
            sop_content: '',
            faq_content: [],
            pricing_guide: { base_price: 0, price_factors: [], commission_rate: 0.1 },
            images: [],
            status: 'draft'
        });
        setIsEditing(true);
        setActiveTab('content');
    };

    const handleEdit = (blueprint: Blueprint) => {
        setSelectedBlueprint(blueprint);
        setFormData(blueprint);
        setIsEditing(true);
        setActiveTab('content');
    };

    const handleSave = async () => {
        try {
            if (selectedBlueprint) {
                await blueprintsApi.update(selectedBlueprint.id, formData);
            } else {
                await blueprintsApi.create(formData);
            }
            fetchBlueprints();
            setIsEditing(false);
            setSelectedBlueprint(null);
        } catch (error) {
            console.error('Failed to save blueprint:', error);
            alert('保存失败');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除这个模版吗？')) return;
        try {
            await blueprintsApi.delete(id);
            fetchBlueprints();
        } catch (error) {
            console.error('Failed to delete blueprint:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedBlueprint(null);
    };

    // Helper for updating nested pre_filled_content
    const updatePreFilledContent = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            pre_filled_content: {
                ...prev.pre_filled_content,
                [key]: value
            }
        }));
    };

    // Helper for updating array items (highlights, included_items, etc.)
    const updateArrayField = (field: string, index: number, value: string) => {
        const currentArray = (formData.pre_filled_content as any)?.[field] || [];
        const newArray = [...currentArray];
        newArray[index] = value;
        updatePreFilledContent(field, newArray);
    };

    const addArrayItem = (field: string) => {
        const currentArray = (formData.pre_filled_content as any)?.[field] || [];
        updatePreFilledContent(field, [...currentArray, '']);
    };

    const removeArrayItem = (field: string, index: number) => {
        const currentArray = (formData.pre_filled_content as any)?.[field] || [];
        updatePreFilledContent(field, currentArray.filter((_: any, i: number) => i !== index));
    };

    // FAQ handlers
    const addFaq = () => {
        setFormData(prev => ({
            ...prev,
            faq_content: [...(prev.faq_content || []), { question: '', answer: '' }]
        }));
    };

    const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
        const newFaqs = [...(formData.faq_content || [])];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        setFormData(prev => ({ ...prev, faq_content: newFaqs }));
    };

    const removeFaq = (index: number) => {
        setFormData(prev => ({
            ...prev,
            faq_content: (prev.faq_content || []).filter((_, i) => i !== index)
        }));
    };

    if (isEditing) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-gray-800">
                            {selectedBlueprint ? '编辑模版' : '新建模版'}
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                        >
                            <Save size={16} />
                            保存
                        </button>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-700 mb-4">基本信息</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">模版名称</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="例如：深度清洁服务"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">状态</label>
                            <select
                                value={formData.status || 'draft'}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="draft">草稿</option>
                                <option value="published">已发布</option>
                                <option value="archived">已归档</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">模版描述</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-20"
                                placeholder="简要描述这个模版的用途"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    {[
                        { id: 'content', label: '预填内容', icon: FileText },
                        { id: 'sop', label: 'SOP 流程', icon: List },
                        { id: 'faq', label: 'FAQ 问答', icon: HelpCircle },
                        { id: 'pricing', label: '定价指南', icon: DollarSign }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">服务标题</label>
                                    <input
                                        type="text"
                                        value={formData.pre_filled_content?.title || ''}
                                        onChange={e => updatePreFilledContent('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="例如：专业深度清洁"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">副标题</label>
                                    <input
                                        type="text"
                                        value={formData.pre_filled_content?.subtitle || ''}
                                        onChange={e => updatePreFilledContent('subtitle', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="例如：让您的家焕然一新"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">服务描述</label>
                                <textarea
                                    value={formData.pre_filled_content?.service_description || ''}
                                    onChange={e => updatePreFilledContent('service_description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
                                    placeholder="详细描述服务内容..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">预计时长</label>
                                <input
                                    type="text"
                                    value={formData.pre_filled_content?.duration_estimate || ''}
                                    onChange={e => updatePreFilledContent('duration_estimate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="例如：3-4小时"
                                />
                            </div>

                            {/* Highlights */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-600">服务亮点</label>
                                    <button
                                        onClick={() => addArrayItem('highlights')}
                                        className="text-primary-600 text-sm flex items-center gap-1"
                                    >
                                        <Plus size={14} /> 添加
                                    </button>
                                </div>
                                {(formData.pre_filled_content?.highlights || []).map((item, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={e => updateArrayField('highlights', index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="输入亮点"
                                        />
                                        <button
                                            onClick={() => removeArrayItem('highlights', index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Included Items */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-600">包含项目</label>
                                    <button
                                        onClick={() => addArrayItem('included_items')}
                                        className="text-primary-600 text-sm flex items-center gap-1"
                                    >
                                        <Plus size={14} /> 添加
                                    </button>
                                </div>
                                {(formData.pre_filled_content?.included_items || []).map((item, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={e => updateArrayField('included_items', index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="输入包含项"
                                        />
                                        <button
                                            onClick={() => removeArrayItem('included_items', index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Excluded Items */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-600">不包含项目</label>
                                    <button
                                        onClick={() => addArrayItem('excluded_items')}
                                        className="text-primary-600 text-sm flex items-center gap-1"
                                    >
                                        <Plus size={14} /> 添加
                                    </button>
                                </div>
                                {(formData.pre_filled_content?.excluded_items || []).map((item, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={e => updateArrayField('excluded_items', index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="输入不包含项"
                                        />
                                        <button
                                            onClick={() => removeArrayItem('excluded_items', index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'sop' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">标准操作流程 (SOP)</label>
                            <p className="text-xs text-gray-400 mb-2">支持 Markdown 格式</p>
                            <textarea
                                value={formData.sop_content || ''}
                                onChange={e => setFormData({ ...formData, sop_content: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-80 font-mono text-sm"
                                placeholder={`## 服务流程\n1. 确认服务范围\n2. 准备工具材料\n3. 执行服务\n4. 验收检查`}
                            />
                        </div>
                    )}

                    {activeTab === 'faq' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-600">常见问题 (FAQ)</label>
                                <button
                                    onClick={addFaq}
                                    className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm flex items-center gap-1"
                                >
                                    <Plus size={14} /> 添加问题
                                </button>
                            </div>
                            <div className="space-y-4">
                                {(formData.faq_content || []).map((faq, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs text-gray-400">问题 {index + 1}</span>
                                            <button
                                                onClick={() => removeFaq(index)}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={faq.question}
                                            onChange={e => updateFaq(index, 'question', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                            placeholder="输入问题"
                                        />
                                        <textarea
                                            value={faq.answer}
                                            onChange={e => updateFaq(index, 'answer', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
                                            placeholder="输入回答"
                                        />
                                    </div>
                                ))}
                                {(formData.faq_content || []).length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                        点击"添加问题"开始创建 FAQ
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">最低价格</label>
                                    <input
                                        type="number"
                                        value={formData.pre_filled_content?.price_range?.min || 0}
                                        onChange={e => updatePreFilledContent('price_range', {
                                            ...formData.pre_filled_content?.price_range,
                                            min: Number(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">最高价格</label>
                                    <input
                                        type="number"
                                        value={formData.pre_filled_content?.price_range?.max || 0}
                                        onChange={e => updatePreFilledContent('price_range', {
                                            ...formData.pre_filled_content?.price_range,
                                            max: Number(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">计价单位</label>
                                    <select
                                        value={formData.pre_filled_content?.price_range?.unit || 'per_service'}
                                        onChange={e => updatePreFilledContent('price_range', {
                                            ...formData.pre_filled_content?.price_range,
                                            unit: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="per_service">每次服务</option>
                                        <option value="per_hour">每小时</option>
                                        <option value="per_sqft">每平方英尺</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{categoryLabel}</h3>
                    <p className="text-sm text-gray-500">管理和编辑服务模版，服务商可克隆这些模版快速发布服务</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                >
                    <Plus size={18} />
                    新建模版
                </button>
            </div>

            {/* Blueprint List */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">加载中...</div>
            ) : blueprints.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-gray-300" />
                    </div>
                    <h4 className="text-gray-600 font-medium mb-2">暂无模版</h4>
                    <p className="text-gray-400 text-sm mb-4">点击"新建模版"创建第一个服务蓝图</p>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        新建模版
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {blueprints.map(blueprint => (
                        <div
                            key={blueprint.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-800">{blueprint.name}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${blueprint.status === 'published'
                                            ? 'bg-green-100 text-green-700'
                                            : blueprint.status === 'archived'
                                                ? 'bg-gray-100 text-gray-500'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {blueprint.status === 'published' ? '已发布' : blueprint.status === 'archived' ? '已归档' : '草稿'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">{blueprint.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        {blueprint.pre_filled_content?.price_range && (
                                            <span>
                                                💰 ${blueprint.pre_filled_content.price_range.min} - ${blueprint.pre_filled_content.price_range.max}
                                            </span>
                                        )}
                                        {blueprint.faq_content && (
                                            <span>❓ {blueprint.faq_content.length} 条FAQ</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(blueprint)}
                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                        title="编辑"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(blueprint.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        title="删除"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlueprintEditor;
