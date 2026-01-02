import React, { useState } from 'react';
import MobileHeader from '../components/MobileHeader';
import { Star, ChevronRight } from 'lucide-react';

export default function Reviews() {
    const [activeTab, setActiveTab] = useState<'standard' | 'custom'>('standard');

    const reviews = [
        {
            id: 1,
            rating: 4.5,
            content: '这是一段超级长的评价内容,这是一段超级长的评价内容,这是一段超级长的评价内容,这是一段超级长的评价内容,这是一段超级长的评价内容',
            images: [
                'https://images.unsplash.com/photo-1549488398-6f68bb0dd756?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1517639493569-5666a780fd6c?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1544256718-3bcf237f3782?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop'
            ],
            serviceName: '标准服务11',
            date: '2025-08-02 11:00'
        },
        {
            id: 2,
            rating: 4.5,
            content: '这是一段超级长的评价内容,这是一段超级长的评价内容,这是一段超级长的评价内容,这是一段超级长的评价内容,这是一段超级长的评价内容',
            images: [
                'https://images.unsplash.com/photo-1549488398-6f68bb0dd756?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1517639493569-5666a780fd6c?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop'
            ],
            serviceName: '标准服务11',
            date: '2025-08-02 11:00'
        }
    ];

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="relative w-4 h-4">
                        <Star className="w-4 h-4 text-gray-200 fill-current absolute top-0 left-0" strokeWidth={0} />
                        <div style={{ width: star <= rating ? '100%' : star - 0.5 === rating ? '50%' : '0%' }} className="overflow-hidden absolute top-0 left-0">
                            <Star className="w-4 h-4 text-cyan-500 fill-current" strokeWidth={0} />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-14">
            <MobileHeader title="我的评价" />

            {/* Tabs */}
            <div className="bg-white px-4 border-b border-gray-100 flex sticky top-14 z-40">
                <button
                    onClick={() => setActiveTab('standard')}
                    className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'standard' ? 'text-cyan-500' : 'text-gray-600'}`}
                >
                    标准服务
                    {activeTab === 'standard' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-cyan-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('custom')}
                    className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'custom' ? 'text-cyan-500' : 'text-gray-600'}`}
                >
                    定制服务
                    {activeTab === 'custom' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-cyan-500 rounded-full" />}
                </button>
            </div>

            <div className="p-4 space-y-4">
                {reviews.map(review => (
                    <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-3">
                            <span className="text-sm font-medium text-gray-700">评分</span>
                            {renderStars(review.rating)}
                        </div>

                        <div className="text-sm text-gray-600 mb-3 leading-relaxed">
                            <span className="font-medium text-gray-700 mr-2">内容</span>
                            {review.content}
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {review.images.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 rounded px-2 py-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{review.serviceName}</span>
                            <button className="text-xs text-gray-500 flex items-center hover:text-cyan-500">
                                查看详情 <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="text-right mt-2 text-xs text-gray-400">
                            {review.date}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
