import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Search, MapPin, Star, Shield, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formTemplatesApi, categoriesApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
    '热门服务': { icon: '🔥', color: 'bg-orange-100 text-orange-600' },
    '全部服务': { icon: '📑', color: 'bg-gray-100 text-gray-600' },
    '日常保洁': { icon: '🧹', color: 'bg-green-100 text-green-600' },
    '维修安装': { icon: '🔧', color: 'bg-blue-100 text-blue-600' },
    '宠物服务': { icon: '🐾', color: 'bg-yellow-100 text-yellow-600' },
    '搬家货运': { icon: '🚚', color: 'bg-cyan-100 text-cyan-600' },
    '搬家服务': { icon: '📦', color: 'bg-orange-100 text-orange-600' },
    '接送服务': { icon: '🚗', color: 'bg-blue-100 text-blue-600' },
    '家庭清洁': { icon: '✨', color: 'bg-emerald-100 text-emerald-600' },
    '房屋保证': { icon: '🏠', color: 'bg-slate-100 text-slate-600' },
    '庭院维护': { icon: '🌳', color: 'bg-lime-100 text-lime-600' },
    '税务理财': { icon: '💰', color: 'bg-amber-100 text-amber-600' },
    '房屋租赁': { icon: '🔑', color: 'bg-indigo-100 text-indigo-600' },
    '汽车服务': { icon: '🚗', color: 'bg-blue-100 text-blue-600' },
    '水管维修': { icon: '💧', color: 'bg-cyan-100 text-cyan-600' },
    '电路维修': { icon: '⚡', color: 'bg-yellow-100 text-yellow-600' },
    '其他服务': { icon: '📋', color: 'bg-gray-100 text-gray-600' },
};

export default function CustomServices() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [publishedTemplates, setPublishedTemplates] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Fixed categories that always show at top
    const FIXED_CATEGORIES = [
        { name: '热门服务', icon: '🔥', color: 'bg-orange-100 text-orange-600' },
        { name: '全部服务', icon: '📑', color: 'bg-gray-100 text-gray-600' },
    ];

    useEffect(() => {
        loadCategories();
        loadTemplates();
    }, []);

    // Load categories enabled for custom services
    const loadCategories = async () => {
        try {
            const res = await categoriesApi.getAll({ service_type: 'custom' });
            const cats = (res.categories || []).map((cat: any) => {
                const iconInfo = CATEGORY_ICONS[cat.name] || { icon: '📋', color: 'bg-gray-100 text-gray-600' };
                return {
                    id: cat.id,
                    name: cat.name,
                    icon: iconInfo.icon,
                    color: iconInfo.color,
                };
            });
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const loadTemplates = async () => {
        try {
            const res = await formTemplatesApi.getPublished();
            // Only show 'is_popular' templates in the Grid
            setPublishedTemplates((res.templates || []).filter((t: any) => t.is_popular));
        } catch (error) {
            console.error(error);
        }
    };

    const handleTemplateClick = (templateId: string) => {
        navigate(`/request/${templateId}`);
    };

    const PROVIDERS = [
        {
            id: 1,
            name: '张师傅水电维修',
            desc: '15年经验，专业水电维修，24小时上门',
            category: '水管维修',
            distance: '2.5km',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
            rating: 4.9,
            reviews: 128
        },
        {
            id: 2,
            name: '李师傅搬家服务',
            desc: '安全高效，价格透明，自带包装材料',
            category: '搬家服务',
            distance: '3.2km',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
            rating: 4.8,
            reviews: 85
        },
        {
            id: 3,
            name: '王师傅杂工服务',
            desc: '家具安装、挂画、小维修、灯具更换',
            category: '杂工服务',
            distance: '1.8km',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
            rating: 5.0,
            reviews: 42
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">定制服务</h1>

                    <div className="flex gap-8 items-start">

                        {/* Sidebar Categories */}
                        <div className="w-64 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">服务分类</h3>
                            <div className="space-y-1">
                                {[...FIXED_CATEGORIES, ...categories].map((cat: any, idx: number) => (
                                    <div
                                        key={cat.id || idx}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${cat.color} group-hover:scale-110 transition-transform`}>
                                            {cat.icon}
                                        </div>
                                        <span className="font-medium text-gray-700">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">

                            {/* Hot Services Grid */}
                            <div className="mb-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                    <h2 className="text-xl font-bold text-gray-900">热门需求模板</h2>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {publishedTemplates
                                        .filter(t => ['custom', 'complex'].includes(t.type))
                                        .map((template) => (
                                            <div
                                                key={template.id}
                                                onClick={() => handleTemplateClick(template.id)}
                                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer group text-center"
                                            >
                                                <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 group-hover:bg-emerald-50 flex items-center justify-center mb-4 transition-colors">
                                                    <div className="text-3xl" style={{ color: template.color }}>
                                                        {/* Simple icon logic based on name or category */}
                                                        {template.name.includes('搬家') ? '🚚' :
                                                            template.name.includes('清洁') ? '🧹' :
                                                                template.name.includes('维修') ? '🔧' : '📋'}
                                                    </div>
                                                </div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{template.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {template.type === 'complex' ? '复杂定制' : '快速发布'}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Providers List */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                        <h2 className="text-xl font-bold text-gray-900">推荐服务商</h2>
                                    </div>
                                    <button className="text-gray-500 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium">
                                        查看更多 <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {PROVIDERS.map((provider) => (
                                        <div key={provider.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-start gap-6">
                                            <img src={provider.avatar} alt={provider.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                            {provider.name}
                                                            <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded border border-emerald-100">已认证</span>
                                                        </h3>
                                                        <p className="text-gray-500 text-sm mt-1">{provider.desc}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 text-emerald-500 font-bold">
                                                            <Star className="w-4 h-4 fill-emerald-500" />
                                                            {provider.rating}
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-0.5">{provider.reviews} 条评价</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Shield className="w-3.5 h-3.5" /> 平台担保
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <MapPin className="w-3.5 h-3.5" /> {provider.distance}
                                                    </span>
                                                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                                                        {provider.category}
                                                    </span>

                                                    <div className="ml-auto flex gap-2">
                                                        <button className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">联系</button>
                                                        <button className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-100">雇佣</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
