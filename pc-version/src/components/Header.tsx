import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, User, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

import { citiesApi, getUserInfo, clearAuth, AUTH_CHANGE_EVENT } from '../services/api';

interface HeaderProps {
    onCityChange?: (city: string) => void;
}

export default function Header({ onCityChange }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(getUserInfo());

    useEffect(() => {
        const handleAuthChange = () => setUser(getUserInfo());
        window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
        return () => window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    }, []);

    const handleLogout = () => {
        clearAuth();
        navigate('/');
    };
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentCity, setCurrentCity] = useState("定位中...");
    const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [supportedCities, setSupportedCities] = useState<string[]>(["多伦多", "温哥华", "蒙特利尔", "渥太华", "卡尔加里", "列治文山", "万锦"]);

    // Notify parent whenever city changes
    useEffect(() => {
        if (currentCity !== "定位中..." && onCityChange) {
            onCityChange(currentCity);
        }
    }, [currentCity, onCityChange]);

    // Fetch active cities on mount
    useEffect(() => {
        const loadCities = async () => {
            try {
                const res = await citiesApi.getActive();
                if (res && res.length > 0) {
                    setSupportedCities(res.map(c => c.name));
                }
            } catch (e) {
                console.error("Failed to load cities", e);
            }
        };
        loadCities();
    }, []);

    // Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Geolocation Effect (Run once)
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Using a free API for demo purposes. In production, use your own backend or Google Maps API using the apiKey.
                    // Request English name to avoid translation ambiguity
                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await response.json();

                    if (data.city || data.locality) {
                        const englishCity = data.city || data.locality;
                        // Mapping dictionary: English -> System Chinese Name
                        const CITY_MAPPING: Record<string, string> = {
                            'Guelph': '圭尔夫',
                            'Toronto': '多伦多',
                            'Markham': '万锦',
                            'Richmond Hill': '列治文山',
                            'Mississauga': '密西沙加',
                            'Vancouver': '温哥华',
                            'Montreal': '蒙特利尔',
                            'Ottawa': '渥太华',
                            'Calgary': '卡尔加里',
                            'Edmonton': '埃德蒙顿',
                            'Waterloo': '滑铁卢',
                            'Hamilton': '哈密尔顿',
                            'London': '伦敦',
                            'Windsor': '温莎',
                            'Burnaby': '本拿比',
                            'Richmond': '列治文',
                            'Surrey': '素里'
                        };

                        // Try to find exact match or partial match
                        let matchedCity = englishCity;

                        // Check exact match
                        if (CITY_MAPPING[englishCity]) {
                            matchedCity = CITY_MAPPING[englishCity];
                        } else {
                            // Check loop for partial match (e.g. "City of Toronto" -> "Toronto")
                            const mappingKey = Object.keys(CITY_MAPPING).find(key => englishCity.includes(key));
                            if (mappingKey) {
                                matchedCity = CITY_MAPPING[mappingKey];
                            }
                        }

                        console.log('Detected City (En):', englishCity, 'Mapped to:', matchedCity);
                        setCurrentCity(matchedCity);
                    } else {
                        setCurrentCity("多伦多"); // Fallback
                    }
                } catch (error) {
                    console.error("Location error:", error);
                    setCurrentCity("多伦多");
                }
            }, (error) => {
                console.log("Geolocation blocked or failed:", error);
                setCurrentCity("多伦多");
            });
        } else {
            setCurrentCity("多伦多");
        }
    }, []);

    // Click Outside Effect
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isCityMenuOpen && !target.closest('.city-selector')) {
                setIsCityMenuOpen(false);
            }
        };

        if (isCityMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isCityMenuOpen]);

    const isActive = (path: string) => location.pathname === path;

    const toggleCityMenu = () => setIsCityMenuOpen(!isCityMenuOpen);
    const selectCity = (city: string) => {
        setCurrentCity(city);
        setIsCityMenuOpen(false);
    };

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 font-sans ${scrolled || isMenuOpen
                ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm py-2'
                : 'bg-white/0 backdrop-blur-none py-4 border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo & Location */}
                    <div className="flex items-center gap-8">
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-all duration-300">
                                <span className="text-white font-bold text-xl font-serif">Y</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-primary-700 transition-colors">
                                优服佳
                            </span>
                        </div>

                        <div className="relative city-selector">
                            <div
                                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-50 hover:bg-white hover:shadow-md cursor-pointer transition-all duration-300 border border-transparent hover:border-gray-100 group select-none"
                                onClick={toggleCityMenu}
                            >
                                <MapPin className={`w-4 h-4 text-primary-600 transition-transform ${isCityMenuOpen ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="text-sm font-medium text-gray-700 w-16 text-center truncate">{currentCity}</span>
                                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isCityMenuOpen ? 'rotate-180' : 'group-hover:text-gray-600'}`} />
                            </div>

                            {/* City Dropdown */}
                            {isCityMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">选择城市</div>
                                    {supportedCities.map(city => (
                                        <button
                                            key={city}
                                            onClick={() => selectCity(city)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 hover:text-primary-700 transition-colors ${currentCity === city ? 'text-primary-600 font-bold bg-primary-50/50' : 'text-gray-600'}`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                    <div className="border-t border-gray-50 mt-1 pt-1">
                                        <button
                                            onClick={() => {
                                                setCurrentCity("重新定位...");
                                                // Re-trigger location logic if needed, or simply close
                                                navigator.geolocation.getCurrentPosition(
                                                    async (pos) => {
                                                        // Simplified re-fetch logic for brevity
                                                        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=zh`);
                                                        const d = await res.json();
                                                        selectCity(d.city || d.locality || "多伦多");
                                                    },
                                                    () => selectCity("多伦多")
                                                );
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            重新定位
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {([
                            { path: '/', label: '首页' },
                            { path: '/standard', label: '标准服务' },
                            { path: '/custom', label: '定制服务' },
                            ...(user?.role === 'provider'
                                ? [{ path: '/provider/dashboard', label: '服务商工作台' }]
                                : user?.role === 'sales'
                                    ? [{ path: '/sales-dashboard', label: '销售中心' }]
                                    : [{ path: '/provider-apply', label: '成为服务商' }]
                            )
                        ] as const).map((item) => (
                            <button
                                key={item.path}
                                onClick={() => (item as any).external ? window.location.href = item.path : navigate(item.path)}
                                className={`relative px-5 py-2 rounded-full text-base font-medium transition-all duration-300 ${isActive(item.path)
                                    ? 'text-primary-700 bg-primary-50'
                                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                                    }`}
                            >
                                {item.label}
                                {isActive(item.path) && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="relative group transition-all duration-300 focus-within:w-64 w-56">
                            <input
                                type="text"
                                placeholder="搜索服务..."
                                className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-transparent hover:border-gray-200 rounded-full focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                        </div>

                        {user ? (
                            <div className="flex items-center gap-3 pl-2">
                                <div className="text-right hidden lg:block">
                                    <div
                                        className="text-sm font-bold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
                                        onClick={() => navigate('/profile')}
                                    >
                                        {user.name || user.email?.split('@')[0] || '用户'}
                                    </div>
                                    <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">退出登录</button>
                                </div>
                                <div
                                    className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg border-2 border-white shadow-sm cursor-pointer hover:shadow-md transition-all"
                                    onClick={() => navigate('/profile')}
                                >
                                    {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-primary-600 text-white rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-0.5"
                            >
                                <User className="w-4 h-4" />
                                <span>登录</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        <div className="p-2 bg-gray-100 rounded-full">
                            <Search className="w-5 h-5 text-gray-600" />
                        </div>
                        <button
                            className="p-2 -mr-2 rounded-lg hover:bg-gray-50 text-gray-600"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="border-t border-gray-100 bg-white shadow-xl px-4 py-6 space-y-4">
                    <button onClick={() => navigate('/')} className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">首页</button>
                    <button onClick={() => navigate('/standard')} className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">标准服务</button>
                    <button onClick={() => navigate('/custom')} className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">定制服务</button>
                    {user?.role === 'provider' ? (
                        <button onClick={() => { navigate('/provider/dashboard'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">服务商工作台</button>
                    ) : user?.role === 'sales' ? (
                        <button onClick={() => navigate('/sales-dashboard')} className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">销售中心</button>
                    ) : (
                        <button onClick={() => navigate('/provider-apply')} className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">成为服务商</button>
                    )}
                    <div className="pt-4 border-t border-gray-100">
                        {user ? (
                            <div className="space-y-3">
                                <div
                                    className="flex items-center gap-3 px-2 cursor-pointer active:bg-gray-50 rounded-lg p-2 transition-colors"
                                    onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                        {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{user.name || '用户'}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                                >
                                    退出登录
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                                className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30"
                            >
                                <User className="w-4 h-4" />
                                登录 / 注册
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
