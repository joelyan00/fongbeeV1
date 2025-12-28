
import React from 'react';
import { Search, ChevronDown, MapPin, Sparkles } from 'lucide-react';

interface HeaderProps {
  onSearchClick?: () => void;
  onLocationClick?: () => void;
  locationName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchClick,
  onLocationClick,
  locationName = "多伦多"
}) => {
  return (
    <div className="bg-white w-full border-b border-gray-50/50">
      <div className="max-w-7xl mx-auto pt-4 pb-2 px-4 md:px-8">

        {/* Row 1: Location & Title */}
        <div className="flex items-center justify-between mb-3 relative h-10">

          {/* Left: Location Selector */}
          <div
            className="flex items-center gap-1 cursor-pointer active:opacity-60 z-20"
            onClick={onLocationClick}
          >
            <MapPin size={20} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
            <span className="text-lg font-bold text-gray-900 truncate max-w-[120px]">{locationName}</span>
            <ChevronDown size={18} className="text-gray-600 mt-0.5 stroke-[2.5px] shrink-0" />
          </div>

          {/* Center: Title (Absolute Positioning) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <h1 className="text-2xl font-bold tracking-wide text-gray-900">优服佳</h1>
          </div>

          {/* Right: Desktop Navigation Buttons (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-4 z-20">
            <button className="text-gray-900 font-bold text-sm hover:text-emerald-600 transition-colors">
              登录
            </button>
            <button className="text-gray-900 font-bold text-sm hover:text-emerald-600 transition-colors">
              注册
            </button>
            <button className="bg-emerald-600 text-white font-bold text-sm px-4 py-1.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm active:scale-95">
              成为服务商
            </button>
          </div>

          {/* Mobile Right Spacer */}
          <div className="md:hidden w-8"></div>
        </div>

        {/* Row 2: Full Width Search Bar */}
        <div className="bg-[#f5f5f5] rounded-xl h-12 flex items-center relative z-10 shadow-sm transition-all overflow-hidden border border-transparent hover:border-gray-200 w-full">

          {/* Search Input Section */}
          <div
            className="flex-1 flex items-center px-4 gap-2 overflow-hidden cursor-pointer h-full"
            onClick={onSearchClick}
          >
            <Search size={20} className="text-gray-400 shrink-0" strokeWidth={2.5} />
            <span className="text-base text-gray-400 truncate font-medium w-full">输入需求...</span>
          </div>

          {/* AI Button */}
          <div
            className="mr-1.5 shrink-0 bg-emerald-600 text-white px-4 h-9 rounded-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform shadow-sm hover:bg-emerald-700"
            onClick={onSearchClick}
          >
            <Sparkles size={16} fill="currentColor" />
            <span className="text-base font-bold whitespace-nowrap">AI助手</span>
          </div>
        </div>

      </div>
    </div>
  );
};
