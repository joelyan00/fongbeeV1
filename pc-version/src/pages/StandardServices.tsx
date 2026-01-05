import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Search, ArrowRight } from 'lucide-react';
import { servicesApi } from '../services/api';

export default function StandardServices() {
    const navigate = useNavigate();

    const CATEGORIES = [
        { name: '美容美发', icon: '✂️', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
        { name: '房屋贷款', icon: '💵', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
        { name: '房产交易', icon: '🏢', bgColor: 'bg-teal-50', textColor: 'text-teal-600' },
        { name: '汽车交易', icon: '🚗', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
        { name: '顺心旅游', icon: '✈️', bgColor: 'bg-red-50', textColor: 'text-red-600' },
        { name: '机票购买', icon: '🎫', bgColor: 'bg-violet-50', textColor: 'text-violet-600' },
        { name: '家庭清洁', icon: '🧹', bgColor: 'bg-green-50', textColor: 'text-green-600' },
        { name: '水管维修', icon: '💧', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600' },
    ];

    const [sections, setSections] = useState<any[]>([]);

    const STATIC_SECTIONS = [
        {
            title: '家庭清洁',
            items: [
                { id: 4, title: '日常保洁 (2小时)', desc: '表面除尘，拖地，整理', price: '$100', image: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80' },
                { id: 5, title: '深度保洁套餐', desc: '厨房油污，卫生间水垢', price: '$350', image: 'https://images.unsplash.com/photo-1528740561666-dc24705f08a7?auto=format&fit=crop&w=300&q=80' },
                { id: 6, title: '退房保洁', desc: '通过房东验收标准', price: '$280', image: 'https://images.unsplash.com/photo-1527513060488-19fbf2695977?auto=format&fit=crop&w=300&q=80' }
            ]
        },
        {
            title: '接机服务',
            items: [
                { id: 10, title: '多伦多皮尔逊送机', desc: 'Markham/Richmond Hill出发', price: '$60', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=300&q=80' },
                { id: 11, title: '机场接机服务', desc: '举牌接机，免费等待60分钟', price: '$70', image: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=300&q=80' },
                { id: 12, title: '瀑布一日游包车', desc: '10小时包车，中文司机', price: '$300', image: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&w=300&q=80' }
            ]
        },
        {
            title: '美容美发',
            items: [
                { id: 13, title: '上门剪发 (男士)', desc: '专业理发师上门服务', price: '$35', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80' },
                { id: 14, title: '女士剪发+造型', desc: '包含洗剪吹', price: '$68', image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=300&q=80' }
            ]
        }
    ];

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const res = await servicesApi.getOfferings();
            const dynamicServices = res.services || [];

            // Group dynamic services by category
            const groupedDiv: Record<string, any[]> = {};
            dynamicServices.forEach(svc => {
                const cat = svc.category || '其他服务';
                if (!groupedDiv[cat]) groupedDiv[cat] = [];
                groupedDiv[cat].push({
                    id: svc.id, // submissionId / listingId
                    isDynamic: true,
                    title: svc.title,
                    desc: svc.description || '暂无描述',
                    price: `${svc.price}`, // Handle format later
                    image: svc.image || 'https://via.placeholder.com/300',
                    provider: svc.provider,
                    original: svc // Keep raw data for checkout params
                });
            });

            // Merge with static sections
            let finalSections = [...STATIC_SECTIONS];

            // For each dynamic group, find existing section or add new
            Object.keys(groupedDiv).forEach(catName => {
                const exIdx = finalSections.findIndex(s => s.title === catName || s.title.includes(catName) || catName.includes(s.title));

                if (exIdx !== -1) {
                    // Prepend or Append? Let's append to existing section
                    finalSections[exIdx].items = [...finalSections[exIdx].items, ...groupedDiv[catName]];
                } else {
                    // Create new section
                    finalSections.push({
                        title: catName,
                        items: groupedDiv[catName]
                    });
                }
            });

            setSections(finalSections);
        } catch (error) {
            console.error('Failed to load services', error);
            setSections(STATIC_SECTIONS);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">标准服务</h1>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
                        {CATEGORIES.map((cat, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${cat.bgColor}`}>
                                    {cat.icon}
                                </div>
                                <span className="font-medium text-gray-700 text-sm">{cat.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Sections */}
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="mb-12">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                    {section.title}
                                </h2>
                                <button className="text-gray-500 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium">
                                    查看更多 <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {section.items.map((item: any) => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            // Navigate to detail page with service data
                                            const params = new URLSearchParams({
                                                title: item.title,
                                                price: String(item.price).replace(/[^0-9.]/g, ''),
                                                ...(item.image && { image: item.image }),
                                                ...(item.desc && { description: item.desc }),
                                                ...(item.provider?.name && { providerName: item.provider.name }),
                                                ...(item.provider?.id && { providerId: item.provider.id }),
                                                ...(section.title && { category: section.title })
                                            });
                                            navigate(`/service/${item.id}?${params.toString()}`);
                                        }}
                                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group cursor-pointer flex"
                                    >
                                        <div className="w-1/3 relative">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4 w-2/3 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{item.title}</h3>
                                                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.desc}</p>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-red-500 font-bold text-xl">{item.price}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (item.isDynamic) {
                                                            // Dynamic navigation
                                                            const providerId = item.provider?.id;
                                                            const serviceId = item.id;
                                                            const price = String(item.price).replace(/[^0-9.]/g, '');
                                                            navigate(`/checkout?serviceId=${serviceId}&providerId=${providerId}&name=${encodeURIComponent(item.title)}&price=${price}&depositRate=30&isStandard=true`);
                                                        } else {
                                                            // Existing static navigation
                                                            navigate(`/checkout?serviceId=${item.id}&providerId=${item.id === 13 ? 'e4b8a1c9-3d2f-4e5a-8f6b-1a2b3c4d5e6f' : 'f7a8b9c0-1d2e-3f4a-5b6c-7d8e9f0a1b2c'}&name=${encodeURIComponent(item.title)}&price=${String(item.price).replace('$', '')}&depositRate=30`);
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-gray-900 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    立即预订
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}
