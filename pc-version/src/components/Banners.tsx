import { useState, useEffect } from 'react';
import axios from 'axios';

interface BannersProps {
    city?: string;
}

export default function Banners({ city = "多伦多" }: BannersProps) {
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
        {
            cities: ['多伦多', '万锦', '列治文山'],
            image_url: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?q=80&w=2074&auto=format&fit=crop', // Toronto vibe
            badge: '多伦多专属',
            prefix: 'GTA',
            highlight: '开荒保洁',
            suffix: '8折起',
            cta: '预约保洁'
        },
        {
            cities: ['温哥华'],
            image_url: 'https://images.unsplash.com/photo-1568282920275-c08126b8686f?q=80&w=2070&auto=format&fit=crop', // Vancouver vibe
            badge: '温哥华特惠',
            prefix: '雨季',
            highlight: '屋顶检修',
            suffix: '免费上门',
            cta: '立即咨询'
        }
    ];

    const [banners, setBanners] = useState<any[]>(ALL_BANNERS);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter banners when city changes
    useEffect(() => {
        const filtered = ALL_BANNERS.filter(b =>
            !b.cities || b.cities.includes('all') || b.cities.some(c => city.includes(c))
        );
        setBanners(filtered.length > 0 ? filtered : ALL_BANNERS.slice(0, 1));
        setCurrentIndex(0);
    }, [city]);

    useEffect(() => {
        // Fetch banners from API
        const fetchBanners = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/banners/active');
                if (res.data && res.data.length > 0) {
                    setBanners(res.data);
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
