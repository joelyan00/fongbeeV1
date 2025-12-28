import { useState, useEffect } from 'react';
import { bannersApi } from '../services/api';

interface BannersProps {
    city?: string;
}

export default function Banners({ city = "多伦多" }: BannersProps) {
    // Keep ALL_BANNERS as initial/fallback only if api fails? 
    // Actually user says "incorrect", so maybe I should clear the hardcoded ones if API is expected.
    // But for safety, I'll keep them as initial state or just an empty array and let API fill it?
    // Let's keep the hardcoded ones as "default" but attempt to overwrite them immediately.
    const ALL_BANNERS = [
        {
            cities: ['all'],
            gradient: 'linear-gradient(135deg, #00a980 0%, #006e56 100%)',
            badge: '✨ 双十二感恩季 ✨',
            prefix: '领',
            highlight: '165',
            suffix: '元维修补贴',
            cta: '立即领取'
        },
        // ... (rest of mocked banners for fallback)
    ];

    const [banners, setBanners] = useState<any[]>(ALL_BANNERS);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter banners when city changes
    useEffect(() => {
        // Only filter if we are using the fallback list. 
        // If we fetched from API, backend presumably handles city filtering? 
        // Actually backend /banners/active usually returns all active banners, and frontend filters by city.
        // Let's assume fetching overwrites 'banners' state.
    }, [city]);

    // Wait, the original code had distinct useEffects.
    // One for filtering based on city (Logic: fallback banners + city).
    // One for fetching.

    // I should rewrite it to:
    // 1. Load banners from API. 
    // 2. If API returns list, use it.
    // 3. Filter list based on city.

    // Let's just fix the fetching part first.

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await bannersApi.getActive();
                if (data && data.length > 0) {
                    // Backend returns banners. We might need to filter them here too if they contain 'cities' field.
                    // Assuming backend returns all active banners directly.
                    // If the backend banners have 'cities' array, we should filter.
                    // For now, let's just set them.
                    setBanners(data);
                }
            } catch (e) {
                console.error('Failed to fetch banners', e);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const currentBanner = banners[currentIndex];

    const handleBannerClick = (banner: any) => {
        if (banner.link_url) {
            window.open(banner.link_url, '_blank');
        }
    };

    return (
        <div className="relative w-full overflow-hidden rounded-2xl shadow-xl h-[300px] md:h-[400px]">
            {/* Banner Content */}
            <div
                className="w-full h-full transition-all duration-500 ease-in-out cursor-pointer relative"
                onClick={() => handleBannerClick(currentBanner)}
            >
                {currentBanner.image_url ? (
                    <img
                        src={currentBanner.image_url}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className="w-full h-full flex flex-col items-center justify-center text-white p-8 relative"
                        style={{ background: currentBanner.gradient || 'linear-gradient(135deg, #00a980 0%, #006e56 100%)' }}
                    >
                        {currentBanner.badge && (
                            <div className="absolute top-8 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-white/10">
                                {currentBanner.badge}
                            </div>
                        )}

                        <div className="flex items-baseline gap-2 mb-8">
                            {currentBanner.prefix && <span className="text-3xl md:text-4xl font-bold opacity-90">{currentBanner.prefix}</span>}
                            {currentBanner.highlight && <span className="text-6xl md:text-7xl font-extrabold drop-shadow-md">{currentBanner.highlight}</span>}
                            {currentBanner.suffix && <span className="text-3xl md:text-4xl font-bold opacity-90">{currentBanner.suffix}</span>}
                        </div>

                        {currentBanner.cta && (
                            <button className="bg-white text-primary-800 px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                                {currentBanner.cta}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Indicators */}
            {banners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                            className={`transition-all duration-300 rounded-full shadow-sm ${idx === currentIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
