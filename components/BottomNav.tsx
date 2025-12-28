
import React from 'react';
import { Home, Grid, Headset, User } from 'lucide-react';

interface BottomNavProps {
  activeTab?: 'home' | 'standard' | 'custom' | 'profile';
  onTabChange?: (tab: 'home' | 'standard' | 'custom' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab = 'home', onTabChange }) => {
  const navItems = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'standard', icon: Grid, label: '标准服务' },
    { id: 'custom', icon: Headset, label: '定制服务' },
    { id: 'profile', icon: User, label: '我的' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)] pt-2 px-6 flex justify-between z-40 max-w-7xl mx-auto md:hidden">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <div 
            key={item.id} 
            className="flex flex-col items-center gap-1 p-1 w-16 cursor-pointer hover:bg-gray-50 rounded-lg"
            onClick={() => onTabChange?.(item.id as any)}
          >
            <item.icon 
              size={26} 
              className={`${isActive ? 'text-emerald-600 fill-emerald-600' : 'text-gray-400'}`} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={`text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
