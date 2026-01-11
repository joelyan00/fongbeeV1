/**
 * Service Detail Page
 * Displays full service information with horizontal image, messaging, and direct order
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { servicesApi, isLoggedIn } from '../services/api';
import { ArrowLeft, MessageCircle, ShoppingCart, User, Star, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ServiceDetail() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();

    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [message, setMessage] = useState('');
    const [orderNote, setOrderNote] = useState('');

    useEffect(() => {
        loadService();
    }, [id]);

    const loadService = async () => {
        setLoading(true);
        try {
            // Always try to fetch from API first to get full service details
            try {
                const res = await servicesApi.getOfferingById(id!);
                if (res.service) {
                    setService(res.service);
                    setLoading(false);
                    return;
                }
            } catch (apiError) {
                console.log('API fetch failed, falling back to URL params');
            }

            // Fallback: Use URL params if API fails (for static/demo services)
            const title = searchParams.get('title');
            const price = searchParams.get('price');
            const image = searchParams.get('image');
            const description = searchParams.get('description');
            const providerName = searchParams.get('providerName');
            const providerId = searchParams.get('providerId');
            const category = searchParams.get('category');

            if (title && price) {
                setService({
                    id,
                    title: decodeURIComponent(title),
                    price,
                    image: image ? decodeURIComponent(image) : null,
                    description: description ? decodeURIComponent(description) : '',
                    category: category ? decodeURIComponent(category) : '',
                    provider: {
                        id: providerId,
                        name: providerName ? decodeURIComponent(providerName) : 'Provider'
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load service:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDirectOrder = () => {
        if (!isLoggedIn()) {
            // Redirect to login with return URL
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }

        const params = new URLSearchParams({
            serviceId: service.id,
            providerId: service.provider?.id || '',
            name: service.title,
            price: String(service.price).replace(/[^0-9.]/g, ''),
            depositRate: '30',
            isStandard: 'true',
            ...(orderNote && { orderNote: encodeURIComponent(orderNote) }),
            ...(message && { message: encodeURIComponent(message) })
        });

        navigate(`/checkout?${params.toString()}`);
    };

    const handleSendMessage = () => {
        if (!isLoggedIn()) {
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        // TODO: Implement messaging API
        alert('消息功能开发中...');
    };

    // Get images array
    const getImages = () => {
        if (!service) return [];
        if (service.images && Array.isArray(service.images)) return service.images;
        if (service.image) return [service.image];
        return [];
    };

    const images = getImages();
    const hasMultipleImages = images.length > 1;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Helper to get service mode label
    const getServiceModeLabel = (mode: string) => {
        const map: Record<string, string> = { offline: '上门服务', remote: '远程服务', store: '到店服务' };
        return map[mode] || mode;
    };

    // Helper to get cancellation policy label
    const getCancellationLabel = (policy: string) => {
        const map: Record<string, string> = { flexible: '灵活取消', moderate: '中等限制', strict: '严格' };
        return map[policy] || policy;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-24 flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                    <p className="text-lg">服务不存在或已下架</p>
                    <button
                        onClick={() => navigate('/standard')}
                        className="mt-4 text-emerald-600 hover:underline"
                    >
                        返回服务列表
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="pt-20">
                {/* Back Button */}
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>返回</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="max-w-5xl mx-auto px-4 pb-32">
                    {/* Horizontal Image Banner */}
                    <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gray-200 rounded-2xl overflow-hidden mb-8">
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={images[currentImageIndex]}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                />
                                {hasMultipleImages && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                        {/* Dots Indicator */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {images.map((_: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-6xl">📷</span>
                            </div>
                        )}
                    </div>

                    {/* Service Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full mb-2">
                                    {service.category || '标准服务'}
                                </span>
                                <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-red-500">
                                    ${String(service.price).replace(/[^0-9.]/g, '')}
                                </div>
                                <div className="text-sm text-gray-500">/{service.unit || '次'}</div>
                            </div>
                        </div>

                        {service.description && (
                            <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
                        )}

                        {/* Provider Card */}
                        <div
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => navigate(`/provider/${service.provider?.id}`)}
                        >
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center overflow-hidden">
                                {service.provider?.avatar ? (
                                    <img src={service.provider.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={28} className="text-emerald-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{service.provider?.name || '服务商'}</div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                    <span>5.0</span>
                                    <span className="text-gray-300">|</span>
                                    <span>已服务 100+ 次</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Consulting / Message */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageCircle size={20} className="text-emerald-600" />
                            咨询
                        </h3>
                        <div className="flex flex-col gap-3">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="请输入您想对服务商说的话，例如特殊要求、时间偏好等..."
                                className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSendMessage}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                >
                                    发送
                                </button>
                            </div>
                        </div>
                    </div>



                    {/* Service Details & Order Notes Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Service Mode & Booking Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock size={20} className="text-emerald-600" />
                                服务信息
                            </h3>
                            <div className="space-y-3">
                                {service.serviceMode && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">服务方式</span>
                                        <span className="font-medium text-gray-900">
                                            {getServiceModeLabel(service.serviceMode)}
                                        </span>
                                    </div>
                                )}
                                {service.depositRatio != null && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">定金比例</span>
                                        <span className="font-medium text-gray-900">{service.depositRatio}%</span>
                                    </div>
                                )}
                                {service.advanceBooking && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">需提前预约</span>
                                        <span className="font-medium text-gray-900">{service.advanceBooking} 小时</span>
                                    </div>
                                )}
                                {service.cancellationPolicy && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">取消政策</span>
                                        <span className="font-medium text-gray-900">
                                            {getCancellationLabel(service.cancellationPolicy)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Notes (Moved here) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <ShoppingCart size={20} className="text-emerald-600" />
                                订单备注
                            </h3>
                            <textarea
                                value={orderNote}
                                onChange={(e) => setOrderNote(e.target.value)}
                                placeholder="输入订单备注（可选）"
                                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Inclusions */}
                    {service.inclusions && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 text-emerald-700">✓ 服务包含</h3>
                            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{service.inclusions}</div>
                        </div>
                    )}


                    {/* Exclusions & Extra Fees */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {service.exclusions && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 text-red-600">✗ 不包含</h3>
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{service.exclusions}</div>
                            </div>
                        )}
                        {service.extraFees && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 text-orange-600">💰 额外费用说明</h3>
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{service.extraFees}</div>
                            </div>
                        )}
                    </div>

                    {/* Client Requirements */}
                    {service.clientRequirements && (
                        <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 p-6 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-4 text-amber-700">📋 客户准备事项</h3>
                            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{service.clientRequirements}</div>
                        </div>
                    )}

                    {/* Add-ons */}
                    {service.addOns && Array.isArray(service.addOns) && service.addOns.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-4">🎁 附加服务</h3>
                            <div className="space-y-3">
                                {service.addOns.map((addon: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="font-medium text-gray-900">{addon.name}</span>
                                            {addon.description && <p className="text-sm text-gray-500 mt-1">{addon.description}</p>}
                                        </div>
                                        <span className="text-emerald-600 font-bold">+${addon.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Fixed Bottom Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
                    <div className="max-w-5xl mx-auto flex items-center justify-end gap-4">

                        <button
                            onClick={handleDirectOrder}
                            className="flex-1 max-w-md bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-emerald-200"
                        >
                            直接下单
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}
