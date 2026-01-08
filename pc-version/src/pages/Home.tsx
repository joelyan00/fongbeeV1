import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Banners from '../components/Banners';
import ServiceGrid from '../components/ServiceGrid';
import PopularArticles from '../components/PopularArticles';
import { ArrowRight, Star, Shield, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { servicesApi, formTemplatesApi } from '../services/api';

export default function Home() {
    const navigate = useNavigate();
    const [city, setCity] = useState("多伦多");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Category-filtered services (when a category is clicked)
    const [standardServices, setStandardServices] = useState<any[]>([]);
    const [customTemplates, setCustomTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Hot services for homepage (aggregated from all categories)
    const [hotStandardServices, setHotStandardServices] = useState<any[]>([]);
    const [hotCustomTemplates, setHotCustomTemplates] = useState<any[]>([]);
    const [hotLoading, setHotLoading] = useState(true);

    // Fetch hot services on page load
    useEffect(() => {
        fetchHotServices();
    }, [city]);

    const fetchHotServices = async () => {
        setHotLoading(true);
        try {
            // Fetch all standard services (no category filter), limited to top items
            const standardRes = await servicesApi.getOfferings({ city });
            setHotStandardServices((standardRes.services || []).slice(0, 8));

            // Fetch all popular custom templates (is_popular = true)
            const customRes = await formTemplatesApi.getPublished();
            const popularTemplates = (customRes.templates || []).filter(
                (t: any) => t.is_popular && ['custom', 'complex'].includes(t.type)
            );
            setHotCustomTemplates(popularTemplates.slice(0, 8));
        } catch (error) {
            console.error('Failed to fetch hot services:', error);
        } finally {
            setHotLoading(false);
        }
    };

    // Fetch filtered services when category is selected
    useEffect(() => {
        if (selectedCategory) {
            fetchFilteredServices(selectedCategory, city);
        }
    }, [selectedCategory, city]);

    const fetchFilteredServices = async (category: string, cityName: string) => {
        setLoading(true);
        try {
            // Fetch standard services
            const standardRes = await servicesApi.getOfferings({ city: cityName, category });
            setStandardServices(standardRes.services || []);

            // Fetch custom templates for this category
            const customRes = await formTemplatesApi.getPublished(undefined, category);
            // Filter to only custom/complex types
            const filteredTemplates = (customRes.templates || []).filter(
                (t: any) => ['custom', 'complex'].includes(t.type) && t.status === 'published'
            );
            setCustomTemplates(filteredTemplates);
        } catch (error) {
            console.error('Failed to fetch filtered services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (categoryName: string) => {
        setSelectedCategory(categoryName);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearCategoryFilter = () => {
        setSelectedCategory(null);
        setStandardServices([]);
        setCustomTemplates([]);
    };

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
            <ServiceGrid onCategorySelect={handleCategorySelect} />

            {/* Filtered Results (When Category is Selected) */}
            {selectedCategory && (
                <div className="py-12 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Filter Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-primary-600 rounded-full"></div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedCategory}</h2>
                                <span className="text-gray-400 text-sm">· {city}</span>
                            </div>
                            <button
                                onClick={clearCategoryFilter}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                清除筛选
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-400">加载中...</div>
                        ) : (
                            <>
                                {/* Standard Services Section */}
                                <div className="mb-12">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-900">标准服务</h3>
                                        <span className="text-gray-400 text-sm ml-2">({standardServices.length} 个)</span>
                                    </div>

                                    {standardServices.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400">
                                            该分类暂无标准服务
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {standardServices.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => navigate(`/service/${item.id}`)}
                                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 border border-gray-100 group cursor-pointer hover:-translate-y-1"
                                                >
                                                    <div className="h-40 overflow-hidden relative bg-gray-100">
                                                        {item.images?.[0] ? (
                                                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🛠️</div>
                                                        )}
                                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
                                                            {item.category || selectedCategory}
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-primary-700 transition-colors">{item.title}</h3>
                                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                            <span className="text-red-500 font-extrabold text-xl">${item.price}</span>
                                                            <button className="bg-gray-50 text-gray-900 p-2 rounded-full group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                                                                <ArrowRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Custom Services Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-900">定制服务</h3>
                                        <span className="text-gray-400 text-sm ml-2">({customTemplates.length} 个)</span>
                                    </div>

                                    {customTemplates.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400">
                                            该分类暂无定制服务模板
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {customTemplates.map((template: any) => (
                                                <div
                                                    key={template.id}
                                                    onClick={() => navigate(`/request/${template.id}`)}
                                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer group text-center"
                                                >
                                                    <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-4 transition-colors">
                                                        <div className="text-3xl">📝</div>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{template.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {template.type === 'complex' ? '复杂定制' : '快速发布'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Default Homepage: Hot Services Sections (when no category selected) */}
            {!selectedCategory && (
                <div className="py-12 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {hotLoading ? (
                            <div className="text-center py-12 text-gray-400">加载中...</div>
                        ) : (
                            <>
                                {/* Hot Standard Services Section */}
                                <div className="mb-12">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                            <h2 className="text-2xl font-bold text-gray-900">热门标准服务</h2>
                                        </div>
                                        <button
                                            onClick={() => navigate('/standard')}
                                            className="text-gray-500 hover:text-primary-600 font-medium flex items-center gap-1 transition-colors group"
                                        >
                                            更多服务 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>

                                    {hotStandardServices.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400">
                                            暂无热门标准服务
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {hotStandardServices.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => navigate(`/service/${item.id}`)}
                                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 border border-gray-100 group cursor-pointer hover:-translate-y-1"
                                                >
                                                    <div className="h-40 overflow-hidden relative bg-gray-100">
                                                        {item.images?.[0] ? (
                                                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🛠️</div>
                                                        )}
                                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
                                                            {item.category}
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-primary-700 transition-colors">{item.title}</h3>
                                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                            <span className="text-red-500 font-extrabold text-xl">${item.price}</span>
                                                            <button className="bg-gray-50 text-gray-900 p-2 rounded-full group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                                                                <ArrowRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Hot Custom Services Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                                            <h2 className="text-2xl font-bold text-gray-900">热门定制服务</h2>
                                        </div>
                                        <button
                                            onClick={() => navigate('/custom')}
                                            className="text-gray-500 hover:text-primary-600 font-medium flex items-center gap-1 transition-colors group"
                                        >
                                            更多服务 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>

                                    {hotCustomTemplates.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400">
                                            暂无热门定制服务
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {hotCustomTemplates.map((template: any) => (
                                                <div
                                                    key={template.id}
                                                    onClick={() => navigate(`/request/${template.id}`)}
                                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer group text-center"
                                                >
                                                    <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-4 transition-colors">
                                                        <div className="text-3xl">📝</div>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{template.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {template.type === 'complex' ? '复杂定制' : '快速发布'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Popular Articles */}
            <PopularArticles />

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-20 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* QR Code Section */}
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-2xl p-8 mb-12 border border-gray-700/50">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">欢迎加入优服佳，手机扫码更方便</h3>
                            <p className="text-gray-400 text-sm">使用微信或浏览器扫描二维码，即可快速注册</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-12">
                            <div className="text-center">
                                <div className="bg-white p-4 rounded-xl shadow-lg mb-3">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://fongbee-v1-h5.vercel.app/#/pages/index/index?register=user')}`}
                                        alt="用户注册二维码"
                                        className="w-28 h-28"
                                    />
                                </div>
                                <p className="text-primary-400 font-bold text-sm">普通用户注册</p>
                                <p className="text-gray-500 text-xs mt-1">享受优质家庭服务</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-white p-4 rounded-xl shadow-lg mb-3">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://fongbee-v1-h5.vercel.app/#/pages/index/index?register=provider')}`}
                                        alt="服务商注册二维码"
                                        className="w-28 h-28"
                                    />
                                </div>
                                <p className="text-orange-400 font-bold text-sm">服务商注册</p>
                                <p className="text-gray-500 text-xs mt-1">开启赚钱之旅</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-12">
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
                </div>
                <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-600 text-sm">
                    © 2025 YouFuJia Home Services. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
