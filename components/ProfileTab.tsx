
import React from 'react';
import { AppIcon } from './Icons';
import { ChevronRight, Settings, Headphones } from 'lucide-react';

export const ProfileTab: React.FC = () => {
  
  const renderOrderGrid = (items: Array<{ label: string; icon: string; color: string }>) => (
    <div className="grid grid-cols-4 gap-y-6 gap-x-2">
        {items.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer active:opacity-70 group">
                {/* Container matching Standard Services: 4.5rem (approx 72px) */}
                <div className="w-[4.5rem] h-[4.5rem] rounded-[1.4rem] bg-gray-50 flex items-center justify-center shadow-sm transition-transform group-active:scale-95 border border-transparent hover:border-gray-100">
                    <AppIcon name={item.icon} size={42} className={item.color} />
                </div>
                {/* Text matching Standard Services: Larger and Bold */}
                <span className="text-lg font-bold text-gray-800 whitespace-nowrap tracking-tight">{item.label}</span>
            </div>
        ))}
    </div>
  );

  const menuItems = [
      { label: '我的购物车', icon: 'shopping-cart', color: 'text-orange-500' },
      { label: '地址管理', icon: 'map-pin', color: 'text-emerald-500' },
      { label: '收件箱', icon: 'truck', color: 'text-blue-500' }, // Using truck/mail placeholder
      { label: '我的评价', icon: 'sparkles', color: 'text-yellow-500' }, // Star placeholder
      { label: '我的积分', icon: 'wallet', color: 'text-purple-500' },
      { label: '开具发票', icon: 'file-text', color: 'text-gray-600' },
      { label: '付款方式', icon: 'banknote', color: 'text-green-600' },
      { label: '设置', icon: 'settings', color: 'text-gray-700' },
      { label: '服务中心', icon: 'headphones', color: 'text-blue-400' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-24">
      {/* Header Area - Green Gradient */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 pt-12 pb-16 px-6 relative overflow-hidden">
        <div className="flex justify-end gap-4 mb-4 text-white/90">
            <Headphones size={24} />
            <Settings size={24} />
        </div>

        <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full border-2 border-white/50 overflow-hidden bg-gray-200 shadow-md">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="text-white">
                <h2 className="text-xl font-bold mb-1">我是用户名称</h2>
                <p className="text-white/80 text-sm">186****1245</p>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-10 relative z-20 space-y-4">
        
        {/* Points Card */}
        <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-4 flex items-center justify-between shadow-sm border border-orange-100">
            <div className="flex items-center gap-2">
                <div className="bg-orange-500 text-white p-1.5 rounded-lg shadow-sm">
                    <AppIcon name="wallet" size={18} />
                </div>
                <span className="text-orange-900 font-bold text-base">我的积分 <span className="text-2xl ml-1 text-orange-600">100</span></span>
            </div>
        </div>

        {/* Standard Service Orders */}
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-xl">标准服务订单</h3>
                <span className="text-sm font-bold text-gray-400 flex items-center hover:text-gray-600 cursor-pointer">全部 <ChevronRight size={16} /></span>
            </div>
            {renderOrderGrid([
                { label: '待付款', icon: 'wallet', color: 'text-orange-500' },
                { label: '待上门', icon: 'calendar', color: 'text-blue-500' },
                { label: '服务中', icon: 'clock', color: 'text-emerald-500' },
                { label: '待接单', icon: 'clipboard', color: 'text-indigo-500' },
                { label: '退款/售后', icon: 'rotate-ccw', color: 'text-red-500' },
            ])}
        </div>

        {/* Custom Service Orders */}
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-xl">定制服务订单</h3>
                <span className="text-sm font-bold text-gray-400 flex items-center hover:text-gray-600 cursor-pointer">全部 <ChevronRight size={16} /></span>
            </div>
            {renderOrderGrid([
                { label: '寻找中', icon: 'search', color: 'text-sky-500' },
                { label: '服务中', icon: 'clipboard', color: 'text-emerald-500' },
                { label: '已完成', icon: 'check-circle', color: 'text-green-600' },
                { label: '退款/售后', icon: 'rotate-ccw', color: 'text-red-500' },
            ])}
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] mt-2">
            {menuItems.map((item, idx) => (
                <div key={idx} className="flex items-center  justify-between p-4 border-b border-gray-50 active:bg-gray-50 cursor-pointer last:border-0">
                    <div className="flex items-center gap-3">
                        <AppIcon name={item.icon} size={22} className={item.color} />
                        <span className="text-xl font-bold text-gray-800">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </div>
            ))}
        </div>

        {/* Provider Section */}
        <div className="bg-emerald-600 rounded-xl p-4 pb-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between active:bg-gray-50 cursor-pointer mb-6">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <AppIcon name="building" size={18} className="text-emerald-600" />
                </div>
                <span className="text-xl font-bold text-black">我是服务商</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
        </div>

      </div>
    </div>
  );
};
