import React, { useState } from 'react';
import MobileHeader from '../components/MobileHeader';
import { Minus, Plus, AlertCircle, Image as ImageIcon, Circle, CheckCircle2 } from 'lucide-react';

interface CartItem {
    id: number;
    title: string;
    time?: string;
    price: number;
    count: number;
    image?: string;
    unavailable?: boolean;
}

export default function Cart() {
    const [items, setItems] = useState<CartItem[]>([
        { id: 1, title: '清洁打扫小时清洁打扫打扫清洁小时', time: '2025/06/24 18:00', price: 185.00, count: 1, image: 'https://images.unsplash.com/photo-1581578731117-1045293d2f24?w=200&h=200&fit=crop' },
        { id: 2, title: '清洁打扫3小时清洁打扫', time: '2025/06/24 18:00', price: 185.00, count: 1, image: 'https://images.unsplash.com/photo-1527515673510-813d3143c151?w=200&h=200&fit=crop' },
        { id: 3, title: '清洁打扫3小时清洁打扫打扫', price: 0, count: 1, unavailable: true },
        { id: 4, title: '清洁打扫3小时清洁打扫打扫', time: '2025/06/24 18:00', price: 185.00, count: 1, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=200&fit=crop' },
    ]);

    const [selectedIds, setSelectedIds] = useState<number[]>([2]);

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        const availableIds = items.filter(i => !i.unavailable).map(i => i.id);
        if (selectedIds.length === availableIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(availableIds);
        }
    };

    const updateCount = (id: number, delta: number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const newCount = Math.max(1, item.count + delta);
                return { ...item, count: newCount };
            }
            return item;
        }));
    };

    const totalPrice = items
        .filter(item => selectedIds.includes(item.id))
        .reduce((sum, item) => sum + item.price * item.count, 0);

    const isAllSelected = items.filter(i => !i.unavailable).length > 0 &&
        items.filter(i => !i.unavailable).every(i => selectedIds.includes(i.id));

    return (
        <div className="min-h-screen bg-gray-50 pb-32 pt-14">
            <MobileHeader title="购物车" />

            <div className="p-4 space-y-4">
                {items.map(item => (
                    <div key={item.id} className="bg-white rounded-xl p-4 flex gap-3 shadow-sm border border-gray-100">
                        {/* Checkbox */}
                        <div className="flex items-center">
                            <button
                                onClick={() => !item.unavailable && toggleSelect(item.id)}
                                disabled={item.unavailable}
                                className={`rounded-full transition-colors ${item.unavailable ? 'text-gray-200 cursor-not-allowed' : selectedIds.includes(item.id) ? 'text-primary-500' : 'text-gray-300'}`}
                            >
                                {selectedIds.includes(item.id) ? <CheckCircle2 className="w-6 h-6 fill-current" /> : <Circle className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                            {item.image ? (
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                            )}
                            {item.unavailable && (
                                <div className="absolute inset-0 bg-white/60 flex items-end justify-center pb-1">
                                    {/* Optional overlay */}
                                </div>
                            )}
                            {item.id === 1 && <span className="absolute bottom-1 right-1 text-primary-500"><AlertCircle className="w-4 h-4" /></span>}
                            {/* Trying to mimic screenshot icon overlay if any. Item 1 has warning icon in screenshot? No, Item 1 has check, Item 3 unavailable. 
                                Actually Item 3 has a picture placeholder icon at bottom right. */}
                            {item.unavailable && (<span className="absolute bottom-1 right-1 text-blue-400"><ImageIcon className="w-4 h-4" /></span>)}
                            {/* Item 1 has a blue i-circle info icon? */}
                            {item.id === 1 && <span className="absolute bottom-1 right-1 text-cyan-500"><AlertCircle className="w-4 h-4" /></span>}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className={`text-sm font-medium line-clamp-2 ${item.unavailable ? 'text-gray-400' : 'text-gray-800'}`}>
                                    {item.title}
                                </h3>
                                {item.unavailable ? (
                                    <p className="text-xs text-gray-400 mt-1">服务不可用</p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">预约时间: {item.time}</p>
                                )}
                            </div>

                            {!item.unavailable && (
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-orange-500 font-bold">${item.price.toFixed(2)}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateCount(item.id, -1)}
                                            className="w-7 h-7 flex items-center justify-center bg-cyan-500 text-white rounded text-lg font-medium active:bg-cyan-600"
                                        >-</button>
                                        <span className="w-8 text-center text-sm font-medium">{item.count}</span>
                                        <button
                                            onClick={() => updateCount(item.id, 1)}
                                            className="w-7 h-7 flex items-center justify-center bg-cyan-500 text-white rounded text-lg font-medium active:bg-cyan-600"
                                        >+</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Warning */}
            <div className="fixed bottom-16 left-0 right-0 bg-orange-100 text-orange-500 text-xs px-4 py-2">
                多个订单合并支付时，将生成多个订单
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-16 flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2" onClick={toggleSelectAll}>
                    <button className={`${isAllSelected ? 'text-primary-500' : 'text-gray-300'}`}>
                        {isAllSelected ? <CheckCircle2 className="w-6 h-6 fill-current" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <span className="text-sm text-gray-600">全选</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">合计: <span className="text-gray-900 font-bold">${totalPrice.toFixed(2)}</span></span>
                    <button className="bg-cyan-500 text-white px-8 py-2.5 rounded-full font-medium shadow-lg shadow-cyan-500/30">
                        结算({selectedIds.length})
                    </button>
                </div>
            </div>
        </div>
    );
}
