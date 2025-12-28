import { useNavigate } from 'react-router-dom';
import {
    Scissors, Banknote, Building2, Car, Plane, Ticket,
    CarTaxiFront, Sparkles, Droplets, Zap, Hammer, LayoutGrid
} from 'lucide-react';

export default function ServiceGrid() {
    const navigate = useNavigate();

    const CATEGORIES = [
        { name: '美容美发', icon: Scissors, link: '/standard' },
        { name: '房屋贷款', icon: Banknote, link: '/standard' },
        { name: '房产交易', icon: Building2, link: '/standard' },
        { name: '汽车交易', icon: Car, link: '/standard' },
        { name: '顺心旅游', icon: Plane, link: '/standard' },
        { name: '机票购买', icon: Ticket, link: '/standard' },
        { name: '接机服务', icon: CarTaxiFront, link: '/standard' },
        { name: '家庭清洁', icon: Sparkles, link: '/standard' },
        { name: '水管维修', icon: Droplets, link: '/custom' },
        { name: '电路维修', icon: Zap, link: '/custom' },
        { name: '室内维修', icon: Hammer, link: '/custom' },
        { name: '全部服务', icon: LayoutGrid, link: '/standard' },
    ];

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
                    {CATEGORIES.map((cat, idx) => (
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
