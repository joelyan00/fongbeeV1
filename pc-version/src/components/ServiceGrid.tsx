import { useNavigate } from 'react-router-dom';
import {
    Scissors, Banknote, Building2, Car, Plane, Ticket,
    CarTaxiFront, Sparkles, Droplets, Zap, Hammer, LayoutGrid,
    Sprout, FileText, Globe, Snowflake, Disc, HelpCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { categoriesApi } from '../services/api';

// Icon and Link Mapping
const CATEGORY_CONFIG: Record<string, { icon: any }> = {
    '美容美发': { icon: Scissors },
    '房屋贷款': { icon: Banknote },
    '房产交易': { icon: Building2 },
    '汽车交易': { icon: Car },
    '顺心旅游': { icon: Plane },
    '机票购买': { icon: Ticket },
    '接机服务': { icon: CarTaxiFront },
    '家庭清洁': { icon: Sparkles },
    '日常保洁': { icon: Sparkles },
    '水管维修': { icon: Droplets },
    '电路维修': { icon: Zap },
    '室内维修': { icon: Hammer },
    '房屋保证': { icon: Hammer },
    '庭院维护': { icon: Sprout },
    '税务理财': { icon: FileText },
    '网站开发': { icon: Globe },
    '冬季扫雪': { icon: Snowflake },
    '更换轮胎': { icon: Disc },
    '其他服务': { icon: LayoutGrid },
};

export default function ServiceGrid() {
    const navigate = useNavigate();
    const [displayCategories, setDisplayCategories] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch both types of categories based on visibility
            const [standardRes, customRes] = await Promise.all([
                categoriesApi.getAll({ service_type: 'standard' }),
                categoriesApi.getAll({ service_type: 'custom' })
            ]);

            const stdCats = standardRes.categories || [];
            const custCats = customRes.categories || [];

            // Merge logic:
            // 1. Create a map to hold unique categories by name
            // 2. Prioritize Standard (so if in both, link goes to /standard)
            const unifiedMap = new Map();

            // First add Custom (link: /custom)
            custCats.forEach((cat: any) => {
                unifiedMap.set(cat.name, {
                    name: cat.name,
                    icon: CATEGORY_CONFIG[cat.name]?.icon || HelpCircle,
                    link: '/custom'
                });
            });

            // Then add/overwrite with Standard (link: /standard)
            stdCats.forEach((cat: any) => {
                unifiedMap.set(cat.name, {
                    name: cat.name,
                    icon: CATEGORY_CONFIG[cat.name]?.icon || HelpCircle,
                    link: '/standard'
                });
            });

            // Convert map to array
            const merged = Array.from(unifiedMap.values());

            // Always add 'All Services' at the end
            merged.push({ name: '全部服务', icon: LayoutGrid, link: '/standard' });

            setDisplayCategories(merged);

        } catch (error) {
            console.error("Failed to load categories for home grid", error);
        }
    };

    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">服务分类</h2>
                    <a href="/standard" className="text-sm font-medium text-gray-400 hover:text-primary-600 transition-colors flex items-center gap-1 group">
                        查看全部
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </a>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-10">
                    {displayCategories.map((cat, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(cat.link)}
                            className="flex flex-col items-center gap-5 cursor-pointer group"
                        >
                            <div className="w-20 h-20 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:shadow-[0_8px_25px_-6px_rgba(0,169,128,0.2)] group-hover:-translate-y-1.5 transition-all duration-300 ease-out border border-transparent group-hover:border-primary-100">
                                <cat.icon className="w-9 h-9" strokeWidth={1.5} />
                            </div>
                            <span className="text-sm font-semibold text-gray-600 group-hover:text-primary-700 transition-colors tracking-wide">
                                {cat.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
