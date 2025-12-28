

import React, { useState, useEffect } from 'react';
import { AppIcon } from './Icons';
import { categoriesApi, Category } from '../services/api';

interface ServiceGridProps {
  onCategorySelect?: (categoryName: string) => void;
  selectedCategory?: string;
}

// Fallback colors for dynamic categories
const COLORS = [
  'text-cyan-500', 'text-amber-500', 'text-orange-500', 'text-slate-600',
  'text-blue-500', 'text-emerald-500', 'text-indigo-500', 'text-purple-500',
  'text-pink-500', 'text-emerald-600', 'text-teal-600', 'text-blue-600',
  'text-sky-500', 'text-red-500', 'text-blue-500', 'text-teal-400',
  'text-sky-300', 'text-zinc-600'
];

interface UICategory extends Category {
  color: string;
  iconName: string;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ onCategorySelect, selectedCategory }) => {
  const [categories, setCategories] = useState<UICategory[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        console.log('ServiceGrid fetched categories:', data);
        // Transform
        const uiCategories = (data.categories || []).map((cat, index) => ({
          ...cat,
          iconName: cat.icon || 'grid', // Default fallback
          color: COLORS[index % COLORS.length]
        }));
        setCategories(uiCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // 8 items per page for Mobile
  const ITEMS_PER_PAGE = 8;
  const PAGES = [];
  const displayItems = categories.length > 0 ? categories : [];

  for (let i = 0; i < displayItems.length; i += ITEMS_PER_PAGE) {
    PAGES.push(displayItems.slice(i, i + ITEMS_PER_PAGE));
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

    if (isLeftSwipe && currentPage < PAGES.length - 1) {
      setCurrentPage(prev => prev + 1);
    }

    if (isRightSwipe && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const renderItem = (item: UICategory) => {
    const isSelected = selectedCategory === item.name;
    return (
      <div
        key={item.id}
        className="flex flex-col items-center gap-1 cursor-pointer py-1 hover:opacity-80 transition-opacity"
        onClick={() => onCategorySelect?.(item.name)}
      >
        {/* Icon Container - Neutral Background to let colors pop */}
        <div
          className={`w-[4.5rem] h-[4.5rem] md:w-24 md:h-24 rounded-[1.4rem] md:rounded-[2rem] bg-gray-50 flex items-center justify-center shadow-sm transition-all duration-200 active:scale-95 ${isSelected ? 'ring-2 ring-emerald-600 ring-offset-2' : ''
            }`}
        >
          <AppIcon name={item.iconName} size={42} className={`md:scale-125 transition-transform ${item.color}`} />
        </div>
        {/* Text Size: text-xl on mobile, text-2xl on desktop */}
        <span className={`text-xl md:text-2xl font-bold text-center leading-tight tracking-tight px-0.5 whitespace-nowrap ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>
          {item.name}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl mx-4 mt-2 px-1 pt-4 pb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 min-h-[280px] md:mx-8">

      {/* HEADER TITLE SECTION */}
      <div className="px-4 mb-4">
        <div className="bg-emerald-600 text-white py-2.5 px-4 rounded-xl text-center shadow-sm cursor-pointer hover:bg-emerald-700 transition-colors"
          onClick={() => onCategorySelect?.('标准服务')}
        >
          <h3 className="text-xl font-extrabold tracking-wide">
            标准服务，省时，省心
          </h3>
        </div>
      </div>

      {/* MOBILE VIEW: Swipeable Pages */}
      <div
        className="overflow-hidden md:hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {PAGES.map((pageItems, pageIndex) => (
            <div key={pageIndex} className="min-w-full grid grid-cols-4 gap-y-4 gap-x-1">
              {pageItems.map(renderItem)}
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE PAGINATION DOTS */}
      <div className="flex justify-center mt-4 gap-1.5 md:hidden">
        {PAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={`transition-all duration-300 rounded-full h-1.5 ${currentPage === index ? 'w-5 bg-emerald-600' : 'w-1.5 bg-gray-200'
              }`}
          />
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-6 gap-y-10 gap-x-6 p-8">
        {displayItems.map(renderItem)}
      </div>

    </div>
  );
};
