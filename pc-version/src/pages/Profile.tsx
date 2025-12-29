import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, ClipboardList, Package, MessageSquare,
    Wallet, CreditCard, MapPin, User, Lock, Bell, Search,
    Settings, HelpCircle, LogOut, ChevronRight, Minus, Plus, Trash2,
    CheckSquare, Square
} from 'lucide-react';
import Header from '../components/Header';
import { getUserInfo, isLoggedIn } from '../services/api';

// Mock Cart Data
const mockCartItems = [
    {
        id: 1,
        title: '清洁行门3小时清洁行门3小时清洁行门3小时上门服务保质清洁',
        desc: '清洁行门3小时清洁行门3小时清洁行门3小时上门服务保质清洁',
        price: 200,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581578731117-104f2a412c54?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        selected: false,
        time: '选择日期时间'
    },
    {
        id: 2,
        title: '清洁行门3小时清洁行门3小时清洁行门3小时上门服务保质清洁',
        desc: '清洁行门3小时清洁行门3小时上门服务保质清洁',
        price: 200,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581578731117-104f2a412c54?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        selected: true,
        time: '选择日期时间'
    },
    {
        id: 3,
        title: '清洁行门3小时清洁行门3小时清洁行门3小时上门服务保质清洁',
        desc: '清洁行门3小时清洁行门3小时上门服务保质清洁',
        price: 200,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581578731117-104f2a412c54?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        selected: false,
        time: '选择日期时间'
    },
    {
        id: 4,
        title: '清洁行门3小时清洁行门3小时清洁行门3小时上门服务保质清洁',
        desc: '清洁行门3小时清洁行门3小时上门服务保质清洁',
        price: 200,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581578731117-104f2a412c54?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        selected: false,
        time: '选择日期时间'
    },
    {
        id: 5,
        title: '清洁行门3小时清洁行门3小时清洁行门3小时上门服务保质清洁',
        desc: '清洁行门3小时清洁行门3小时上门服务保质清洁',
        price: 200,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581578731117-104f2a412c54?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        selected: false,
        time: '选择日期时间'
    }
];

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [cartItems, setCartItems] = useState(mockCartItems);
    const [activeTab, setActiveTab] = useState('cart');

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }
        setUser(getUserInfo());
    }, [navigate]);

    const handleQuantityChange = (id: number, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const toggleSelect = (id: number) => {
        setCartItems(prev => prev.map(item =>
            item.id === id ? { ...item, selected: !item.selected } : item
        ));
    };

    const toggleSelectAll = () => {
        const allSelected = cartItems.every(i => i.selected);
        setCartItems(prev => prev.map(item => ({ ...item, selected: !allSelected })));
    };

    const removeSelected = () => {
        setCartItems(prev => prev.filter(i => !i.selected));
    };

    const removeItem = (id: number) => {
        setCartItems(prev => prev.filter(i => i.id !== id));
    };

    const selectedCount = cartItems.filter(i => i.selected).length;
    const totalPrice = cartItems.filter(i => i.selected).reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <div className="max-w-[1440px] mx-auto px-4 pt-24 pb-12 flex gap-6">
                {/* Left Sidebar */}
                <div className="w-64 flex-shrink-0 bg-white shadow-sm rounded-lg h-fit py-4">
                    <div className="px-6 py-4 text-gray-400 text-sm font-medium">用户中心</div>
                    <nav className="space-y-1">
                        <MenuItem icon={ShoppingCart} label="我的购物车" active={activeTab === 'cart'} onClick={() => setActiveTab('cart')} />
                        <MenuItem icon={ClipboardList} label="定制服务" active={activeTab === 'custom'} onClick={() => setActiveTab('custom')} />
                        <MenuItem icon={Package} label="我的订单" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                        <MenuItem icon={MessageSquare} label="我的评价" active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
                        <MenuItem icon={MessageSquare} label="收件箱" active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
                        <div className="border-t border-gray-100 my-2 mx-4"></div>
                        <MenuItem icon={Wallet} label="我的积分" active={activeTab === 'credits'} onClick={() => setActiveTab('credits')} />
                        <MenuItem icon={Package} label="开具发票" active={activeTab === 'invoice'} onClick={() => setActiveTab('invoice')} />
                        <MenuItem icon={MapPin} label="地址管理" active={activeTab === 'address'} onClick={() => setActiveTab('address')} />
                        <MenuItem icon={CreditCard} label="付款方式" active={activeTab === 'payment'} onClick={() => setActiveTab('payment')} />
                        <div className="border-t border-gray-100 my-2 mx-4"></div>
                        <MenuItem icon={User} label="个人信息" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        <MenuItem icon={Lock} label="修改密码" active={activeTab === 'password'} onClick={() => setActiveTab('password')} />
                        <MenuItem icon={Bell} label="消息通知设置" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                    </nav>
                </div>

                {/* Main Content (Center) */}
                <div className="flex-1 bg-white shadow-sm rounded-lg min-h-[600px] flex flex-col">
                    {activeTab === 'cart' && (
                        <>
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h1 className="text-gray-800 font-medium ml-2">全部商品({cartItems.length})</h1>
                                <div className="text-gray-500 text-sm flex gap-4">
                                    <button className="hover:text-primary-600" onClick={toggleSelectAll}>全选</button>
                                    <button className="hover:text-red-500" onClick={removeSelected}>移除</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <div className="pt-8">
                                            <button onClick={() => toggleSelect(item.id)} className={`text-2xl ${item.selected ? 'text-primary-500' : 'text-gray-300'}`}>
                                                {item.selected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-md bg-gray-200" />
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="text-gray-900 font-bold mb-1 line-clamp-1">{item.title}</h3>
                                                <p className="text-gray-500 text-sm line-clamp-2">{item.desc}</p>
                                            </div>
                                            <div className="inline-flex items-center text-xs text-gray-400 border border-gray-200 rounded px-2 py-1 w-fit mt-2">
                                                {item.time}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between py-1">
                                            <div className="text-orange-500 font-bold text-lg">¥{item.price}</div>

                                            <div className="flex items-center border border-gray-200 rounded-md">
                                                <button className="p-1 hover:bg-gray-100 text-gray-500" onClick={() => handleQuantityChange(item.id, -1)}><Minus className="w-4 h-4" /></button>
                                                <span className="w-10 text-center text-sm">{item.quantity}</span>
                                                <button className="p-1 hover:bg-gray-100 text-gray-500" onClick={() => handleQuantityChange(item.id, 1)}><Plus className="w-4 h-4" /></button>
                                            </div>

                                            <button className="text-gray-400 text-sm hover:text-red-500" onClick={() => removeItem(item.id)}>移除</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Bar */}
                            <div className="p-4 bg-primary-50 border-t border-primary-100 flex items-center justify-between rounded-b-lg">
                                <div className="text-gray-600 text-sm pl-4">
                                    已选 <span className="font-bold text-gray-900 mx-1">({selectedCount})</span> 个订单并支付时, 您还能删除个订单
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-sm">合计: <span className="text-orange-500 text-2xl font-bold ml-2">¥{totalPrice}</span></div>
                                    <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2.5 rounded text-sm font-medium transition-colors">
                                        结算({selectedCount})
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab !== 'cart' && (
                        <div className="p-10 text-center text-gray-400">
                            Feature not implemented in this view.
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="w-[280px] flex-shrink-0 space-y-4">
                    {/* Profile Card */}
                    <div className="bg-white p-6 shadow-sm rounded-lg flex flex-col items-center">
                        <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                            {user.name?.[0]?.toUpperCase() || '里'}
                        </div>
                        <h2 className="font-bold text-lg text-gray-900 mb-2">{user.name || '里约喵'}</h2>
                        <button className="w-full border border-primary-500 text-primary-600 text-sm py-1.5 rounded mb-6 hover:bg-primary-50 transition-colors">
                            申请成为服务商
                        </button>

                        <div className="w-full space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>我的积分:</span>
                                <span className="text-orange-500 font-bold">{user.credits || 50}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>手机号码:</span>
                                <span>{user.phone || '159******7859'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>邮箱:</span>
                                <span className="truncate max-w-[150px]">{user.email || '159******7859@gmail.com'}</span>
                            </div>
                        </div>

                        <button onClick={handleLogout} className="mt-8 text-primary-500 text-sm hover:underline">
                            退出登录
                        </button>
                    </div>

                    {/* Promo Card */}
                    <div className="bg-purple-600 text-white p-6 rounded-lg shadow-sm text-center">
                        <h3 className="font-bold text-lg mb-2">申请成为服务商</h3>
                        <button className="bg-white text-purple-600 px-6 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors mt-2">
                            立刻申请
                        </button>
                    </div>

                    {/* Help Center */}
                    <div className="bg-purple-600 text-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-2 font-bold">
                            <HelpCircle className="w-5 h-5" /> 帮助中心
                        </div>
                        <p className="text-xs opacity-90 mb-4 leading-relaxed">
                            如有相关问题咨询, 请联系客服
                        </p>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="opacity-80">📞</span> XXX-XXXX-XXXX
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MenuItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors text-sm font-medium border-l-4 ${active ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
        >
            <Icon className={`w-4 h-4 ${active ? 'text-primary-500' : 'text-gray-400'}`} />
            {label}
        </div>
    );
}
