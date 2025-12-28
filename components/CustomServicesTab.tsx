
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { AppIcon } from './Icons';
import { categoriesApi, formTemplatesApi, type Category, type FormTemplate } from '../services/api';

// Icon color mapping for database categories
const ICON_COLORS: Record<string, string> = {
    'truck': 'text-blue-500',
    'car': 'text-indigo-500',
    'plane': 'text-purple-500',
    'home': 'text-teal-500',
    'spray': 'text-cyan-500',
    'tool': 'text-slate-600',
    'sun': 'text-yellow-500',
    'dollar-sign': 'text-green-500',
    'key': 'text-amber-500',
    'droplet': 'text-blue-400',
    'zap': 'text-orange-500',
    'grid': 'text-gray-500',
    'sparkles': 'text-amber-500',
};

// Static categories that are always shown
const STATIC_CATEGORIES = [
    { name: '热门服务', icon: 'sparkles', color: 'text-amber-500' },
    { name: '全部服务', icon: 'grid', color: 'text-emerald-500' },
];

// Fallback hardcoded categories (used when API fails)
const FALLBACK_CATEGORIES = [
    { name: '搬家服务', icon: 'truck', color: 'text-blue-500' },
    { name: '接送服务', icon: 'car', color: 'text-indigo-500' },
    { name: '家庭清洁', icon: 'home', color: 'text-teal-500' },
    { name: '水管维修', icon: 'droplet', color: 'text-blue-400' },
    { name: '电路维修', icon: 'zap', color: 'text-orange-500' },
];

// Fallback for categories without specific data
const DEFAULT_SERVICES = [
    { name: '杂工', icon: 'hammer', color: 'text-slate-600' },
    { name: '搬家', icon: 'truck', color: 'text-blue-500' },
    { name: '水管维修', icon: 'droplet', color: 'text-cyan-500' },
    { name: '暖气空调', icon: 'wind', color: 'text-orange-500' },
    { name: '屋顶瓦片', icon: 'home', color: 'text-gray-600' },
    { name: '景观美化', icon: 'sprout', color: 'text-green-500' },
    { name: '家庭清洁', icon: 'sparkles', color: 'text-teal-400' },
    { name: '安装地板', icon: 'grid', color: 'text-amber-600' },
    { name: '家庭电路', icon: 'zap', color: 'text-yellow-500' },
];

export const CustomServicesTab: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('热门服务');
    const [categoryItems, setCategoryItems] = useState<Array<{ name: string; icon: string; color: string }>>(STATIC_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [publishedTemplates, setPublishedTemplates] = useState<FormTemplate[]>([]);

    // Load categories from API
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const response = await categoriesApi.getAll();
                const dbCategories = (response.categories || []).map((cat: Category) => ({
                    name: cat.name,
                    icon: cat.icon || 'grid',
                    color: ICON_COLORS[cat.icon] || 'text-gray-500',
                }));

                // Combine static categories with database categories
                setCategoryItems([...STATIC_CATEGORIES, ...dbCategories]);
            } catch (error) {
                console.error('Failed to load categories:', error);
                // Use fallback categories if API fails
                setCategoryItems([...STATIC_CATEGORIES, ...FALLBACK_CATEGORIES]);
            } finally {
                setLoading(false);
            }
        };

        const loadTemplates = async () => {
            try {
                const response = await formTemplatesApi.getPublished();
                setPublishedTemplates(response.templates || []);
            } catch (error) {
                console.error('Failed to load templates:', error);
            }
        };

        loadCategories();
        loadTemplates();
    }, []);

    const currentServices = DEFAULT_SERVICES;

    return (
        <div className="flex flex-col h-screen bg-[#f5f6fa] pb-24">
            {/* Header - White Background, Black Text, No Rounding */}
            <div className="bg-white pt-2 pb-2 px-4 shrink-0 z-10 shadow-sm sticky top-0">
                <h1 className="text-gray-900 text-2xl font-bold tracking-wide text-center mb-2">定制服务</h1>
                <div className="bg-gray-100 rounded-full flex items-center px-4 py-2.5 border border-transparent focus-within:border-emerald-500 transition-colors">
                    <Search size={20} className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="搜索定制服务"
                        className="flex-1 ml-2 outline-none bg-transparent text-gray-900 placeholder-gray-400 text-base"
                    />
                </div>
            </div>

            {/* Main Content Area - Single Scroll View */}
            <div className="flex-1 overflow-y-auto no-scrollbar">

                {/* Categories Grid (4 Columns with Icons) */}
                <div className="p-4 bg-white mb-2">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">服务分类</h2>
                    {loading ? (
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="w-[4.5rem] h-[4.5rem] rounded-[1.4rem] bg-gray-100 animate-pulse" />
                                    <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-4">
                            {categoryItems.map(cat => {
                                const isActive = activeCategory === cat.name;
                                return (
                                    <div
                                        key={cat.name}
                                        onClick={() => setActiveCategory(cat.name)}
                                        className="flex flex-col items-center gap-2 cursor-pointer group"
                                    >
                                        {/* Icon Container - Matching Standard Services Size (4.5rem) */}
                                        <div className={`w-[4.5rem] h-[4.5rem] rounded-[1.4rem] flex items-center justify-center transition-all duration-300 ${isActive
                                            ? 'bg-emerald-50 ring-2 ring-emerald-500'
                                            : 'bg-gray-50 group-hover:bg-gray-100'
                                            }`}>
                                            <AppIcon
                                                name={cat.icon}
                                                size={42}
                                                className={`transition-colors duration-300 ${cat.color}`}
                                            />
                                        </div>
                                        {/* Font Size matching Standard Services (text-xl) */}
                                        <span className={`text-xl font-bold transition-colors duration-300 whitespace-nowrap tracking-tight ${isActive ? 'text-emerald-600' : 'text-gray-800'
                                            }`}>
                                            {cat.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Services Grid (3 Columns with Large Icons) */}
                <div className="p-4 pt-2">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
                        <h2 className="text-lg font-bold text-gray-900">{activeCategory}</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {currentServices.map((service, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-xl p-5 flex flex-col items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
                            >
                                {/* Icon Container */}
                                <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center shadow-sm">
                                    <AppIcon name={service.icon} size={48} className={`${service.color} stroke-[2.5px]`} />
                                </div>
                                {/* Font Size */}
                                <span className="text-xl font-bold text-gray-800">{service.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

