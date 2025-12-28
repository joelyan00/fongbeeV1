import { useState, useMemo } from 'react';
import Header from '../components/Header';
import Banners from '../components/Banners';
import ServiceGrid from '../components/ServiceGrid';
import PopularArticles from '../components/PopularArticles';
import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    const [city, setCity] = useState("多伦多");

    // All services with city availability
    const ALL_SERVICES = [
        { id: 1, cities: ['all'], title: '日常保洁 (2小时)', desc: '表面除尘，拖地，整理', price: '$100', image: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80', tag: '家庭清洁' },
        { id: 2, cities: ['多伦多', '万锦', '列治文山'], title: '深度保洁套餐', desc: '厨房油污，卫生间水垢', price: '$350', image: 'https://images.unsplash.com/photo-1528740561666-dc24705f08a7?auto=format&fit=crop&w=300&q=80', tag: '家庭清洁' },
        { id: 3, cities: ['多伦多', '万锦'], title: '多伦多皮尔逊送机', desc: 'Markham出发', price: '$60', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=300&q=80', tag: '接机服务' },
        { id: 4, cities: ['all'], title: '上门剪发 (男士)', desc: '专业理发师上门服务', price: '$35', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80', tag: '美容美发' },
        { id: 5, cities: ['温哥华', '列治文', '本拿比'], title: '温哥华机场接送', desc: 'Richmond/Burnaby往返', price: '$50', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=300&q=80', tag: '接机服务' },
        { id: 6, cities: ['温哥华', '列治文'], title: '屋顶青苔清理', desc: '去除雨季滋生青苔', price: '$200', image: 'https://images.unsplash.com/photo-1632759972778-5a415053c8e7?auto=format&fit=crop&w=300&q=80', tag: '房屋维护' },
        { id: 7, cities: ['卡尔加里'], title: '除雪服务 (包季)', desc: '车道清理，撒盐', price: '$500', image: 'https://images.unsplash.com/photo-1483827598803-b0e6df273650?auto=format&fit=crop&w=300&q=80', tag: '庭院维护' }
    ];

    const displayServices = useMemo(() => {
        // Simple inclusion check. If a service has 'all' or one of its cities matches part of the current city string.
        return ALL_SERVICES.filter(s =>
            s.cities.includes('all') || s.cities.some(c => city.includes(c))
        ).slice(0, 4);
    }, [city]);

    return (
        <div className="min-h-screen bg-white font-sans">
            <Header onCityChange={setCity} />

            <div className="pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Big Banners */}
                    <div className="flex-1">
                        <Banners city={city} />
                    </div>

                    {/* Right: Quick Features / Trust Signals (Visible on PC) */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
                        <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl border border-primary-100 shadow-sm h-full flex flex-col justify-center text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">服务无忧保障</h3>
                            <p className="text-sm text-gray-500 mb-6 font-medium">平台全程托管 · 不满意包赔付</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                                    <Shield className="w-6 h-6 text-primary-600" />
                                    <span className="text-xs font-bold text-gray-700">实名认证</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                                    <Star className="w-6 h-6 text-primary-600" />
                                    <span className="text-xs font-bold text-gray-700">好评优选</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                                    <Clock className="w-6 h-6 text-primary-600" />
                                    <span className="text-xs font-bold text-gray-700">准时上门</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                                    <div className="text-primary-600 font-black text-lg">¥</div>
                                    <span className="text-xs font-bold text-gray-700">透明定价</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Categories Grid */}
            <ServiceGrid />

            {/* Recommended Standard Services */}
            <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-1.5 h-6 bg-primary-600 rounded-full"></div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">推荐服务</h2>
                            </div>
                            <p className="text-gray-500 font-medium ml-4.5">严选标准服务，明码标价，省心放心</p>
                        </div>
                        <button onClick={() => navigate('/standard')} className="text-gray-500 hover:text-primary-600 font-medium flex items-center gap-1 transition-colors group">
                            更多服务 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayServices.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 border border-gray-100 group cursor-pointer hover:-translate-y-1">
                                <div className="h-52 overflow-hidden relative">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
                                        {item.tag}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-primary-700 transition-colors">{item.title}</h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-1">{item.desc}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <span className="text-red-500 font-extrabold text-2xl tracking-tight">{item.price}</span>
                                        <button className="bg-gray-50 text-gray-900 p-2.5 rounded-full group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Articles (CMS) */}
            <PopularArticles />

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-20 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-primary-900/20">Y</div>
                            <span className="text-2xl font-bold tracking-tight">优服佳</span>
                        </div>
                        <p className="text-gray-400 max-w-sm leading-relaxed text-sm">
                            优服佳是北美领先的一站式家庭服务平台。我们致力于通过技术连接优质服务者与用户，提供安全、便捷、透明的生活服务体验。
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-8 text-white">平台服务</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><a href="#" className="hover:text-primary-400 transition-colors">标准服务</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">定制服务</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">成为服务商</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">服务保障</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-8 text-white">联系我们</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li>客服热线: 1-800-YOU-FUJIA</li>
                            <li>电子邮箱: support@youfujia.ca</li>
                            <li className="pb-4">工作时间: 周一至周日 9:00 - 21:00</li>
                            <li>
                                <button className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-full font-bold transition-all w-full shadow-lg shadow-primary-900/20 hover:-translate-y-0.5">在线客服</button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-600 text-sm">
                    © 2025 YouFuJia Home Services. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
