

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { AppIcon } from './Icons';
import { categoriesApi, Category } from '../services/api';

// Fallback colors for dynamic categories
const COLORS = [
  'text-pink-500', 'text-emerald-600', 'text-teal-600', 'text-blue-600',
  'text-sky-500', 'text-red-500', 'text-blue-500', 'text-teal-400',
  'text-cyan-500', 'text-amber-500', 'text-orange-500', 'text-slate-600'
];

interface UICategory extends Category {
  color: string;
  iconName: string;
}

// Mock Data for specific sections (keep as placeholders for now until backend supports "Featured Services")
const SECTIONS = [
  {
    title: '家庭清洁',
    items: [
      { id: 4, title: '日常保洁 (2小时)', desc: '表面除尘，拖地，整理', price: '$100', image: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80' },
      { id: 5, title: '深度保洁套餐', desc: '厨房油污，卫生间水垢', price: '$350', image: 'https://images.unsplash.com/photo-1528740561666-dc24705f08a7?auto=format&fit=crop&w=300&q=80' },
      { id: 6, title: '退房保洁', desc: '通过房东验收标准', price: '$280', image: 'https://images.unsplash.com/photo-1527513060488-19fbf2695977?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    title: '机场接车',
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
      { id: 14, title: '女士剪发+造型', desc: '包含洗剪吹', price: '$68', image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=300&q=80' },
      { id: 15, title: '美甲护理', desc: '手部基础护理+单色', price: '$50', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80' }
    ]
  }
];

interface StandardServicesPageProps {
  onCategorySelect?: (category: string) => void;
}

export const StandardServicesPage: React.FC<StandardServicesPageProps> = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState<UICategory[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        // Transform backend categories to UI format
        const uiCategories = (data.categories || []).map((cat, index) => ({
          ...cat,
          iconName: cat.icon || 'grid', // Default fallback
          color: COLORS[index % COLORS.length] // Cycle colors
        }));
        setCategories(uiCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const ITEMS_PER_PAGE = 8;
  const pages = [];
  // Use fetched categories
  const displayCategories = categories.length > 0 ? categories : [];

  for (let i = 0; i < displayCategories.length; i += ITEMS_PER_PAGE) {
    pages.push(displayCategories.slice(i, i + ITEMS_PER_PAGE));
  }


  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }

    if (isRightSwipe && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-24">
      {/* Header Area - White Background, Black Text */}
      <div className="bg-white pt-4 pb-2 px-4 shadow-sm">
        <h1 className="text-gray-900 text-2xl font-bold tracking-wide text-center mb-2">标准服务</h1>

        {/* Search Bar */}
        <div className="bg-gray-100 rounded-full flex items-center px-4 py-3 border border-transparent focus-within:border-emerald-500 transition-colors">
          <Search size={20} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="搜索服务内容"
            className="flex-1 ml-2 outline-none bg-transparent text-gray-900 placeholder-gray-400 text-base"
          />
        </div>
      </div>

      {/* Categories Grid (Swipeable) */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[280px]">

          <div
            className="overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentPage * 100}%)` }}
            >
              {pages.map((pageItems, pageIndex) => (
                <div key={pageIndex} className="min-w-full grid grid-cols-4 gap-y-4 gap-x-1">
                  {pageItems.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1 cursor-pointer active:opacity-70"
                      onClick={() => onCategorySelect?.(cat.name)}
                    >
                      {/* Icon Container matching ServiceGrid style (4.5rem) */}
                      <div className="w-[4.5rem] h-[4.5rem] rounded-[1.4rem] bg-gray-50 flex items-center justify-center shadow-sm">
                        <AppIcon name={cat.iconName} size={42} className={cat.color} />
                      </div>
                      {/* Font size text-xl */}
                      <span className="text-xl font-bold text-gray-800 text-center leading-tight tracking-tight px-0.5 whitespace-nowrap">
                        {cat.name}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-6 gap-1.5">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`transition-all duration-300 rounded-full h-1.5 ${currentPage === index ? 'w-5 bg-emerald-600' : 'w-1.5 bg-gray-200'
                  }`}
              />
            ))}
          </div>

        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section, idx) => (
        <div key={idx} className="mt-6">
          {/* Section Header */}
          <div className="px-6 flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
            <button
              className="text-gray-400 font-bold flex items-center gap-1 text-sm active:text-gray-600"
              onClick={() => onCategorySelect?.(section.title)}
            >
              更多 <ChevronRight size={16} />
            </button>
          </div>

          {/* Vertical List (1 item per row) with Horizontal Card Layout */}
          <div className="flex flex-col px-4 gap-3">
            {section.items.map((item) => (
              <div
                key={item.id}
                className="w-full bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100 flex active:scale-[0.98] transition-transform cursor-pointer"
                onClick={() => onCategorySelect?.(section.title)}
              >
                {/* Horizontal Card Layout */}
                <div className="w-32 h-24 bg-gray-200 relative shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/5"></div>
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.desc}</p>
                  </div>
                  <div className="mt-1">
                    <span className="text-red-500 font-bold text-lg">{item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
