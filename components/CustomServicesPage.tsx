
import React from 'react';
import { ChevronLeft, Share2, Plus, MapPin, ArrowRight } from 'lucide-react';

interface CustomServicesPageProps {
  onBack: () => void;
  category: string;
}

export const CustomServicesPage: React.FC<CustomServicesPageProps> = ({ onBack, category }) => {
  // Generate a longer list for the full page
  const items = Array.from({ length: 12 }).map((_, i) => ({
    id: `c-${i}`,
    title: `${category} - 高端定制方案 ${i + 1}`,
    desc: '专业团队上门测量，免费出具设计方案，全程监理',
    price: '免费估价',
    image: `https://picsum.photos/300/200?random=${i}`,
    location: '多伦多全区'
  }));

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 px-4 h-14 flex items-center justify-between shadow-sm border-b border-gray-100">
         

        <button onClick={onBack} className="p-2 -ml-2 active:bg-gray-100 rounded-full">
          <ChevronLeft size={32} strokeWidth={3} className="text-black" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">定制服务 - {category}</h1>
        
        <button className="p-2 -mr-2 active:bg-gray-100 rounded-full">
          <Share2 size={24} className="text-gray-900" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="bg-emerald-600 text-white rounded-xl py-6 px-4 shadow-md text-center mb-6">
             <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide">
                全方位定制，满足您的个性化需求
             </h2>
             <p className="text-emerald-100 mt-2">专业团队 • 免费估价 • 品质保障</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                    <div className="h-48 bg-gray-200 relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/5"></div>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                            <MapPin size={12} /> {item.location}
                        </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                        <p className="text-gray-500 mt-2 text-sm line-clamp-2 leading-relaxed flex-1">{item.desc}</p>
                        
                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50">
                            <span className="text-red-500 font-bold text-lg">{item.price}</span>
                            <span className="text-emerald-600 font-bold text-sm flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
                                立即咨询 <ArrowRight size={14} />
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Custom Request Card at the end */}
            <div className="bg-emerald-50 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm border border-emerald-100 gap-5 min-h-[300px]">
                <p className="text-xl font-bold text-emerald-800 leading-relaxed px-2">
                    还没有找到合适的服务？
                </p>
                <button className="bg-emerald-600 text-white rounded-full px-8 py-3 flex items-center gap-2 text-lg font-bold shadow-sm active:scale-95 transition-transform hover:bg-emerald-700">
                    <Plus size={20} />
                    发布定制服务
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
