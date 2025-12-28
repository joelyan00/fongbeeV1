
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

export const Banners = () => {
  const [banners, setBanners] = useState<any[]>([
    // Default fallback (Unified with H5)
    {
      gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #dc2626 100%)',
      badge: '✨ 双十二感恩季 ✨',
      prefix: '领',
      highlight: '165',
      suffix: '元维修补贴',
      cta: '立即领取'
    }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch banners from API
    const fetchBanners = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/banners/active');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setBanners(data);
          }
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
            style={{ background: currentBanner.gradient || 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            {currentBanner.badge && (
              <div className="absolute top-8 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
                {currentBanner.badge}
              </div>
            )}

            <div className="flex items-baseline gap-2 mb-8">
              {currentBanner.prefix && <span className="text-3xl md:text-4xl font-bold opacity-90">{currentBanner.prefix}</span>}
              {currentBanner.highlight && <span className="text-6xl md:text-7xl font-extrabold drop-shadow-lg">{currentBanner.highlight}</span>}
              {currentBanner.suffix && <span className="text-3xl md:text-4xl font-bold opacity-90">{currentBanner.suffix}</span>}
            </div>

            {currentBanner.cta && (
              <button className="bg-white text-emerald-800 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform">
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
