import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, User, Settings, LogOut, ChevronRight, ChevronLeft, Star, Clock, MapPin, CreditCard, ChevronDown, Filter, Trash2, Plus, Minus, CheckSquare, Square, Lock, Bell, Package, ClipboardList, Wallet, MessageSquare, HelpCircle, Mail, Smartphone, Globe, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { getUserInfo, isLoggedIn, authApi, setAuth, getToken, paymentApi, addressApi, submissionsApi, usersApi, invoicesApi } from '../services/api';
import AddressModal from '../components/AddressModal';
import PaymentModal from '../components/PaymentModal';
import ChangeContactModal from '../components/ChangeContactModal';

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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [formData, setFormData] = useState({ surname: '', name: '' });
    const [saving, setSaving] = useState(false);

    // Sub-tabs
    const [activeCustomTab, setActiveCustomTab] = useState('all');
    const [activeOrderTab, setActiveOrderTab] = useState('all');
    const [activeReviewTab, setActiveReviewTab] = useState('standard');

    // New States
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [notificationSettings, setNotificationSettings] = useState({ sms: true, email: true, site: true });
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [manageCardId, setManageCardId] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Real Data States
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [creditsHistory, setCreditsHistory] = useState<any[]>([]);
    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [myInvoices, setMyInvoices] = useState<any[]>([]);
    const [myOrders, setMyOrders] = useState<any[]>([]);

    // Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [contactModal, setContactModal] = useState<{ open: boolean; type: 'phone' | 'email' }>({ open: false, type: 'phone' });
    const [editAddressData, setEditAddressData] = useState<any>(null);

    const refreshPayments = () => {
        setLoadingData(true);
        paymentApi.getMethods().then(res => setPaymentMethods(res.methods || [])).catch(console.error).finally(() => setLoadingData(false));
    };

    const refreshAddresses = () => {
        setLoadingData(true);
        addressApi.getAll().then(res => setAddresses(res.addresses || [])).catch(console.error).finally(() => setLoadingData(false));
    };

    useEffect(() => {
        if (activeTab === 'payment') refreshPayments();
        if (activeTab === 'address') refreshAddresses();
        if (activeTab === 'dashboard') {
            usersApi.getDashboardStats().then(res => setDashboardStats(res.stats)).catch(console.error);
        }
        if (activeTab === 'credits') {
            usersApi.getCreditsHistory().then(res => setCreditsHistory(res.history || [])).catch(console.error);
            // TODO: Refresh user balance separately
        }
        if (activeTab === 'invoice') {
            invoicesApi.getMyInvoices().then(res => setMyInvoices(res.invoices || [])).catch(console.error);
        }
        if (activeTab === 'reviews') {
            usersApi.getReviews().then(res => setUserReviews(res.reviews || [])).catch(console.error);
        }
        if (activeTab === 'orders' || activeTab === 'custom-orders') {
            submissionsApi.getMySubmissions().then(res => setMyOrders(res.submissions || [])).catch(console.error);
        }
    }, [activeTab]);

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        setSaving(true);
        try {
            await authApi.changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
            alert('密码修改成功，请重新登录');
            // Optional: Logout
        } catch (e: any) {
            alert(e.message || '修改失败');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotifications = () => {
        setSaving(true);
        setTimeout(() => {
            alert('通知设置已保存');
            setSaving(false);
        }, 800);
    };

    const handleDeletePayment = (id: string) => {
        if (confirm('确定删除该支付方式吗?')) {
            // Mock delete
            setPaymentMethods(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleSetDefaultPayment = async (id: string) => {
        try {
            await paymentApi.setDefaultMethod(id);
            setPaymentMethods(prev => prev.map(p => ({ ...p, is_default: p.id === id })));
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }
        const u = getUserInfo();
        setUser(u);
        if (u && u.name) {
            setFormData({
                surname: u.name.charAt(0) || '',
                name: u.name.slice(1) || ''
            });
        } else if (u) {
            setFormData({ surname: '', name: '' });
        }
    }, [navigate]);

    const handleSaveProfile = async () => {
        if (!formData.surname || !formData.name) return;
        setSaving(true);
        try {
            const fullName = formData.surname + formData.name;
            const res = await authApi.updateProfile({ name: fullName });
            setUser(res.user);
            // Update local storage
            const token = getToken();
            if (token) setAuth(token, res.user);
            alert('保存成功');
        } catch (e: any) {
            alert(e.message || '保存失败');
        } finally {
            setSaving(false);
        }
    };

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



    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            {/* Mobile Profile View */}
            <div className="md:hidden pt-20 px-4 pb-24">
                <div className="bg-white rounded-xl p-6 mb-4 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl font-bold text-primary-700">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.name || '用户'}</h2>
                        <p className="text-sm text-gray-500">{user.phone || user.email || '欢迎回来'}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                    <div className="grid grid-cols-4 py-6 border-b border-gray-50">
                        <div onClick={() => navigate('/orders')} className="flex flex-col items-center gap-2 cursor-pointer">
                            <Package className="w-6 h-6 text-gray-600" />
                            <span className="text-xs text-gray-600">全部订单</span>
                        </div>
                        <div onClick={() => navigate('/cart')} className="flex flex-col items-center gap-2 cursor-pointer">
                            <ShoppingCart className="w-6 h-6 text-gray-600" />
                            <span className="text-xs text-gray-600">购物车</span>
                        </div>
                        <div onClick={() => navigate('/custom')} className="flex flex-col items-center gap-2 cursor-pointer">
                            <ClipboardList className="w-6 h-6 text-gray-600" />
                            <span className="text-xs text-gray-600">定制服务</span>
                        </div>
                        <div onClick={() => navigate('/reviews')} className="flex flex-col items-center gap-2 cursor-pointer">
                            <Star className="w-6 h-6 text-gray-600" />
                            <span className="text-xs text-gray-600">评价</span>
                        </div>
                    </div>
                    <div className="p-2">
                        <div onClick={() => navigate('/settings')} className="flex items-center justify-between px-4 py-3 active:bg-gray-50 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Settings className="w-5 h-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">个人设置</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div onClick={() => setActiveTab('address')} className="flex items-center justify-between px-4 py-3 active:bg-gray-50 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">地址管理</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div onClick={() => setActiveTab('payment')} className="flex items-center justify-between px-4 py-3 active:bg-gray-50 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">付款方式</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex max-w-[1440px] mx-auto px-4 pt-24 pb-12 gap-6">
                {/* Left Sidebar */}
                <div className="w-64 flex-shrink-0 bg-white shadow-sm rounded-lg h-fit py-4">
                    <nav className="space-y-1 py-2">
                        <MenuItem icon={User} label="用户中心" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <MenuItem icon={ShoppingCart} label="我的购物车" active={activeTab === 'cart'} onClick={() => setActiveTab('cart')} />
                        <MenuItem icon={ClipboardList} label="定制服务" active={activeTab === 'custom-orders'} onClick={() => setActiveTab('custom-orders')} />
                        <MenuItem icon={Package} label="我的订单" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                        <MenuItem icon={Star} label="我的评价" active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />

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
                    {activeTab === 'dashboard' && (
                        <div className="flex flex-col h-full p-6">
                            {/* Profile Header */}
                            <div className="border border-gray-100 rounded-lg p-8 flex items-center justify-between mb-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-gray-300 text-white flex items-center justify-center text-2xl font-bold">
                                        {user.name?.[0]?.toUpperCase() || '老'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <h2 className="text-2xl font-bold text-gray-900">{user.name || '老严'}</h2>
                                        </div>
                                        <div className="flex items-center gap-8 text-sm text-gray-500">
                                            <div className="bg-red-50 text-red-500 px-3 py-1 rounded">我的积分: {user.credits || 0}</div>
                                        </div>
                                        <div className="flex items-center gap-6 mt-3 text-gray-400 text-sm">
                                            <span>手机号码: {user.phone || '14164559844'}</span>
                                            <span>邮箱: {user.email || 'joelyan00@gmail.com'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setActiveTab('profile')} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded text-sm font-medium transition-colors">修改个人信息</button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-5 gap-4 mb-8 bg-gray-50 py-8 rounded-lg">
                                {[
                                    { label: '定制服务', val: dashboardStats?.custom_orders || 0 },
                                    { label: '我的订单', val: dashboardStats?.orders || 0 },
                                    { label: '购物车', val: dashboardStats?.cart || 0 },
                                    { label: '收件箱', val: dashboardStats?.inbox || 0 },
                                    { label: '我的评价', val: dashboardStats?.reviews || 0 }
                                ].map((item, i) => (
                                    <div key={i} className="text-center border-r border-gray-200 last:border-0">
                                        <div className="text-gray-500 text-sm mb-2">{item.label}</div>
                                        <div className="text-2xl font-bold">{item.val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Custom Service Links */}
                            <div className="border border-gray-100 rounded-lg p-8 flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">发布定制服务</h3>
                                    <span className="text-gray-400 text-sm">为您需求寻找适合的服务商</span>
                                </div>

                                <div className="flex gap-2 max-w-xl mb-8">
                                    <input type="text" placeholder="帮您找到适合的所需要务" className="flex-1 border border-gray-200 px-4 py-2.5 rounded-l text-sm focus:outline-none focus:border-primary-500" />
                                    <button className="bg-primary-500 text-white px-8 rounded-r font-medium hover:bg-primary-600">搜索</button>
                                </div>

                                <div className="space-y-6">
                                    {[1, 2, 3, 4].map(idx => (
                                        <div key={idx} className="flex text-sm">
                                            <span className="w-24 font-bold text-gray-800 pt-1">服务类别名称</span>
                                            <div className="flex flex-wrap gap-3 flex-1">
                                                {[1, 2, 3, 4, 5, 6].map(i => (
                                                    <button key={i} className="px-4 py-1.5 border border-gray-100 rounded text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors bg-white">
                                                        子服务名称
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CART */}
                    {activeTab === 'cart' && (
                        <>
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h1 className="text-gray-800 font-medium ml-2">全部商品(0)</h1>
                                <div className="text-gray-500 text-sm flex gap-4">
                                    <button className="hover:text-primary-600">全选</button>
                                    <button className="hover:text-red-500">移除</button>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-12">
                                <img src="https://images.unsplash.com/photo-1581578731117-104f2a412c54?w=300&h=200&fit=crop" className="w-48 h-32 object-cover mb-4 opacity-50 grayscale rounded-lg" alt="Empty" />
                                <p className="text-gray-400 mb-6 text-sm">当前没有加购标准服务 , 赶快去加购吧 !</p>
                                <button onClick={() => navigate('/')} className="bg-primary-500 text-white px-8 py-2 rounded text-sm font-medium hover:bg-primary-600">去加购</button>
                            </div>
                        </>
                    )}

                    {/* CUSTOM ORDERS */}
                    {activeTab === 'custom-orders' && (
                        <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-100 px-6 pt-2">
                                {['寻找服务商(7)', '项目进行中(6)', '已完成(1)', '售后(3)'].map((tab, idx) => (
                                    <button key={idx} className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${idx === 0 ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="p-6 space-y-4">
                                {myOrders.filter(o => o.form_templates?.type === 'custom' || !o.form_templates).map((order, idx) => (
                                    <div key={order.id || idx} className="bg-white p-6 rounded-lg border border-gray-100 flex items-center justify-between hover:border-primary-100 transition-colors">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg mb-2">{order.form_templates?.name || '定制服务'}</h3>
                                            <p className="text-xs text-gray-400">订单号: {order.id.slice(0, 8)}</p>
                                        </div>
                                        <div className="text-right text-sm space-y-2">
                                            <div className="text-gray-500">提交时间: {new Date(order.created_at).toLocaleDateString()}</div>
                                            <div className="flex items-center justify-end gap-8">
                                                <span className={`font-medium ${order.status === 'pending' ? 'text-orange-500' : 'text-green-500'}`}>
                                                    {order.status === 'pending' ? '寻找服务商中' : order.status}
                                                </span>
                                                <div className="text-right">
                                                    <div className="text-gray-400 text-xs mb-1">取消订单</div>
                                                    <button className="text-blue-500 font-medium">查看详情</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ORDERS */}
                    {activeTab === 'orders' && (
                        <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-100 px-6 pt-2">
                                {['全部(10)', '待付款(2)', '服务中(2)', '待验收(2)', '已完成(2)', '售后/售后(2)'].map((tab, idx) => (
                                    <button key={idx} className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${idx === 0 ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="p-6 space-y-6">
                                {myOrders.filter(o => o.form_templates?.type === 'standard').map((order, idx) => (
                                    <div key={order.id || idx} className="bg-white p-6 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4">
                                                <div className="w-32 h-24 rounded-lg bg-gray-200 overflow-hidden">
                                                    {/* Placeholder image or from template */}
                                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">No Image</div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg mb-2 max-w-xl">{order.form_templates?.name || '标准服务'}</h3>
                                                    <p className="text-gray-400 text-sm mb-2 max-w-xl line-clamp-1">{order.form_data?.description || '暂无描述'}</p>
                                                    <div className="text-xs text-gray-400">预约时间: {order.form_data?.service_date || '待定'}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <button className="block w-full text-right text-gray-600 text-sm mb-1 hover:text-primary-500">查看详情</button>
                                                {order.status === 'pending' && <button className="bg-primary-500 text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-primary-600 mt-2">立即付款</button>}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-50 text-sm">
                                            <div className={`font-medium ${order.status === 'pending' ? 'text-red-500' : 'text-green-500'}`}>{order.status}</div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-gray-900">实付款: ¥{order.total_price || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* REVIEWS */}
                    {activeTab === 'reviews' && (
                        <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-100 px-6 pt-2">
                                {['标准服务评价(2)', '定制服务评价(1)'].map((tab, idx) => (
                                    <button key={idx} className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${idx === 0 ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="p-8 space-y-8">
                                {userReviews.length === 0 ? <div className="text-gray-400 text-center">暂无评价</div> : userReviews.map((review, idx) => (
                                    <div key={review.id || idx} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                        <div className="flex justify-between text-xs text-gray-400 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span>评价星级:</span>
                                                <div className="flex text-primary-500">
                                                    {Array(review.rating || 5).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                                </div>
                                                <span className="text-primary-500 ml-1">{review.rating}</span>
                                            </div>
                                            <span>{new Date(review.created_at).toLocaleString()}</span>
                                            <span className="max-w-xs truncate">服务订单: {review.submission?.service_category || '服务订单'}</span>
                                        </div>
                                        <div className="flex gap-8">
                                            <div className="flex-1">
                                                <div className="text-gray-600 text-sm mb-4 leading-relaxed p-0">
                                                    <span className="text-gray-400 mr-2">评价内容:</span>
                                                    {review.content}
                                                </div>
                                            </div>
                                            {(review.images && review.images.length > 0) && (
                                                <div className="w-80 flex-shrink-0">
                                                    <div className="text-xs text-gray-400 mb-2">评价照片:</div>
                                                    <div className="flex gap-2">
                                                        {review.images.map((img: string, i: number) => (
                                                            <div key={i} className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                                                                <img src={img} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* CREDITS */}
                    {activeTab === 'credits' && (
                        <div className="flex flex-col h-full">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h1 className="text-gray-800 font-bold ml-2">我的积分(40)</h1>
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <button className="bg-white border border-gray-200 px-4 py-1.5 rounded text-sm text-gray-600 flex items-center gap-2">全部 <ChevronDown className="w-4 h-4" /></button>
                                    </div>
                                    <div className="relative">
                                        <button className="bg-white border border-gray-200 px-4 py-1.5 rounded text-sm text-gray-600 flex items-center gap-2">全部时间 <ChevronDown className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-2">
                                {creditsHistory.length === 0 ? <div className="text-gray-400 text-center py-8">暂无积分记录</div> : creditsHistory.map((item, i) => (
                                    <div key={item.id || i} className="flex items-center justify-between py-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-4 rounded transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-2 h-2 rounded-full ${item.amount < 0 ? 'bg-blue-500' : 'bg-orange-500'}`} />
                                            <div>
                                                <div className="font-bold text-gray-800 mb-1.5">{item.description || item.type}</div>
                                                <div className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-gray-900 text-lg">
                                            {item.amount > 0 ? '+' : ''}{item.amount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* INVOICE */}
                    {activeTab === 'invoice' && (
                        <div className="flex flex-col h-full">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h1 className="text-gray-800 font-bold ml-2">已开发票(20)</h1>
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <button className="bg-white border border-gray-200 px-4 py-1.5 rounded text-sm text-gray-600 flex items-center gap-2">all <ChevronDown className="w-4 h-4" /></button>
                                    </div>
                                    <div className="relative">
                                        <button className="bg-white border border-gray-200 px-4 py-1.5 rounded text-sm text-gray-600 flex items-center gap-2">筛选时间 <ChevronDown className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-4">
                                {myInvoices.length === 0 ? <div className="text-gray-400 text-center py-8">暂无发票</div> : myInvoices.map((inv, i) => (
                                    <div key={inv.id || i} className="py-6 border-b border-gray-50 last:border-0">
                                        <div className="text-xs text-gray-400 mb-4 ml-1">订单编号: {inv.invoice_no || inv.order_id}</div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="text-orange-500 bg-orange-50 p-3 rounded"><ClipboardList className="w-6 h-6" /></div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-lg mb-2">{inv.service_name || '服务订单'}</div>
                                                    <div className="text-xs text-gray-400">{new Date(inv.issued_at || inv.created_at).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-12">
                                                <div className="text-right">
                                                    <div className="text-gray-500 text-sm">开票金额: <span className="font-bold text-gray-900 text-lg ml-2">¥{inv.amount}</span></div>
                                                </div>
                                                <div className="flex gap-6 text-sm font-medium items-center">
                                                    <button className="text-gray-500 hover:text-gray-900">订单详情</button>
                                                    <button className="text-gray-500 hover:text-gray-900">下载</button>
                                                    <button className="bg-primary-500 text-white px-6 py-2 rounded hover:bg-primary-600 shadow-sm transition-colors">查看发票</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Pagination */}
                            <div className="p-6 border-t border-gray-50 flex justify-center">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50"> &lt; </button>
                                    <button className="w-8 h-8 flex items-center justify-center bg-primary-500 text-white rounded"> 1 </button>
                                    <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50"> &gt; </button>
                                    <div className="flex items-center gap-2 ml-4">
                                        <select className="border border-gray-200 rounded px-2 py-1"><option>10条/页</option></select>
                                        <span>共 2 条</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="flex flex-col h-full">
                            <div className="px-8 py-5 border-b border-gray-100">
                                <h1 className="text-gray-800 font-bold text-lg">我的个人信息</h1>
                            </div>

                            <div className="p-8 max-w-3xl">
                                <div className="space-y-6">
                                    <div className="flex items-center">
                                        <label className="w-24 text-gray-500 text-sm text-right mr-6">姓</label>
                                        <input
                                            type="text"
                                            value={formData.surname}
                                            onChange={e => setFormData({ ...formData, surname: e.target.value })}
                                            placeholder="请输入姓"
                                            className="w-full max-w-sm border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="w-24 text-gray-500 text-sm text-right mr-6">名</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="请输入名"
                                            className="w-full max-w-sm border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="w-24 text-gray-500 text-sm text-right mr-6">手机号码</label>
                                        <div className="flex items-center gap-4 flex-1">
                                            <input
                                                type="text"
                                                value={user.phone || ''}
                                                disabled
                                                className="w-48 border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                                            />
                                            <span className="text-xs text-gray-400">
                                                如手机号不再使用，<button onClick={() => setContactModal({ open: true, type: 'phone' })} className="text-orange-500 font-bold hover:underline">点击修改</button>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <label className="w-24 text-gray-500 text-sm text-right mr-6">邮箱号码</label>
                                        <div className="flex items-center gap-4 flex-1">
                                            <input
                                                type="text"
                                                value={user.email || ''}
                                                disabled
                                                className="w-64 border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                                            />
                                            <span className="text-xs text-gray-400">
                                                如邮箱不再使用，<button onClick={() => setContactModal({ open: true, type: 'email' })} className="text-orange-500 font-bold hover:underline">点击修改</button>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pl-[120px] pt-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="bg-primary-500 hover:bg-primary-600 text-white px-12 py-2.5 rounded text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
                                        >
                                            {saving ? '保存中...' : '保存'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className="flex flex-col h-full">
                            <div className="px-8 py-5 border-b border-gray-100">
                                <h1 className="text-gray-800 font-bold text-lg">修改密码</h1>
                            </div>
                            <div className="p-10 max-w-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center">
                                        <label className="w-24 text-gray-500 text-sm text-right mr-6"><span className="text-red-500 mr-1">*</span>原密码</label>
                                        <input type="password" placeholder="请填写原密码"
                                            value={passwordForm.oldPassword} onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                            className="w-full max-w-sm border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-all" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-24 text-gray-500 text-sm text-right mr-6"><span className="text-red-500 mr-1">*</span>新密码</label>
                                        <div className="flex-1 max-w-sm">
                                            <input type="password" placeholder="请填写新密码"
                                                value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-all mb-2" />
                                            <p className="text-xs text-gray-400">8-20个字符，需包含至少一个大写字母，一个小写字母，一个数字和一个特殊字符</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-24 text-gray-500 text-sm text-right mr-6">确认密码</label>
                                        <input type="password" placeholder="确认密码"
                                            value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="w-full max-w-sm border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-all" />
                                    </div>
                                    <div className="pl-[120px] pt-4 flex gap-4">
                                        <button onClick={handleChangePassword} disabled={saving} className="bg-primary-500 hover:bg-primary-600 text-white px-10 py-2.5 rounded text-sm font-medium transition-colors shadow-sm disabled:opacity-70">
                                            {saving ? '保存中...' : '保存'}
                                        </button>
                                        <button className="bg-white border border-gray-200 text-gray-600 px-10 py-2.5 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
                                            忘记密码
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="flex flex-col h-full">
                            <div className="px-8 py-5 border-b border-gray-100">
                                <h1 className="text-gray-800 font-bold text-lg">消息通知设置</h1>
                            </div>
                            <div className="p-10">
                                <p className="text-gray-500 text-sm mb-8">为了更好的接收相关消息，请选择消息的接收方式！</p>
                                <div className="space-y-8 max-w-2xl">
                                    {[
                                        { key: 'sms', label: '短信通知' },
                                        { key: 'email', label: '邮件通知' },
                                        { key: 'site', label: '站内消息' }
                                    ].map((item) => {
                                        const k = item.key as keyof typeof notificationSettings;
                                        return (
                                            <div key={item.key} className="flex items-center">
                                                <label className="w-24 text-gray-800 text-sm font-medium text-right mr-8">{item.label}</label>
                                                <div className="flex items-center gap-6">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${notificationSettings[k] ? 'border-primary-500' : 'border-gray-300'}`}>
                                                            {notificationSettings[k] && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                                                        </div>
                                                        <span className={`text-sm ${notificationSettings[k] ? 'text-primary-500' : 'text-gray-500'}`}>开启</span>
                                                        <input type="radio" className="hidden" checked={notificationSettings[k]} onChange={() => setNotificationSettings({ ...notificationSettings, [k]: true })} />
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!notificationSettings[k] ? 'border-primary-500' : 'border-gray-300'}`}>
                                                            {!notificationSettings[k] && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                                                        </div>
                                                        <span className={`text-sm ${!notificationSettings[k] ? 'text-primary-500' : 'text-gray-500'}`}>关闭</span>
                                                        <input type="radio" className="hidden" checked={!notificationSettings[k]} onChange={() => setNotificationSettings({ ...notificationSettings, [k]: false })} />
                                                    </label>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div className="pl-[128px] pt-4">
                                        <button onClick={handleSaveNotifications} disabled={saving} className="bg-primary-500 hover:bg-primary-600 text-white px-10 py-2.5 rounded text-sm font-medium transition-colors shadow-sm">
                                            {saving ? '保存中...' : '保存'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Types Tab */}
                    {/* Payment Types Tab */}
                    {activeTab === 'payment' && (
                        <div className="flex flex-col h-full bg-gray-50">
                            {manageCardId ? (
                                <>
                                    <div className="px-8 py-5 border-b border-gray-100 bg-white flex items-center gap-4">
                                        <button onClick={() => setManageCardId(null)} className="text-gray-500 hover:text-gray-900"><ChevronLeft className="w-5 h-5" /></button>
                                        <h1 className="text-gray-800 font-bold text-lg">管理卡片</h1>
                                    </div>
                                    <div className="p-8">
                                        <div className="bg-white rounded-lg p-8 shadow-sm max-w-2xl border border-gray-100">
                                            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded border border-gray-200">
                                                <div className="w-16 h-10 bg-white rounded border border-gray-200 flex items-center justify-center font-bold text-gray-600">VISA</div>
                                                <div>
                                                    <div className="font-bold text-gray-800 text-lg">•••• 4242</div>
                                                    <div className="text-xs text-gray-500">有效期至: 12/29</div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">持卡人姓名</label>
                                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500" defaultValue={user?.name} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">账单地址</label>
                                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500" defaultValue="123 Main St, New York, NY" type="text" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">邮政编码</label>
                                                        <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500" defaultValue="10001" type="text" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
                                                        <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500" defaultValue="New York" type="text" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-100">
                                                    <button onClick={() => setManageCardId(null)} className="px-6 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 text-gray-700">取消</button>
                                                    <button onClick={() => { alert('保存成功'); setManageCardId(null); }} className="px-6 py-2 bg-primary-500 text-white rounded text-sm font-medium hover:bg-primary-600">保存更新</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="px-8 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
                                        <h1 className="text-gray-800 font-bold text-lg">付款方式</h1>
                                        <button onClick={() => setShowPaymentModal(true)} className="text-orange-500 text-sm font-medium hover:underline">添加银行卡</button>
                                    </div>
                                    <div className="p-8 space-y-4">
                                        {loadingData ? <div className="p-8 text-center text-gray-400">加载中...</div> :
                                            paymentMethods.length === 0 ? (
                                                <div className="bg-white p-12 rounded-lg text-center text-gray-400 border border-gray-100">
                                                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                    <p>暂无付款方式</p>
                                                </div>
                                            ) : (
                                                paymentMethods.map(method => (
                                                    <div key={method.id} className="bg-white p-5 rounded-lg border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-9 bg-gray-50 rounded border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                                {method.brand?.toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    {method.is_default && <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded border border-blue-100">默认</span>}
                                                                    <span className="font-bold text-gray-800 text-lg">•••• {method.last4}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-400 mt-1">所属人: {user?.name || '未知'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6 text-sm">
                                                            {method.is_default ? (
                                                                <span className="text-gray-400">默认卡片</span>
                                                            ) : (
                                                                <button onClick={() => handleSetDefaultPayment(method.id)} className="text-blue-500 hover:underline">设为默认</button>
                                                            )}
                                                            <button onClick={() => setManageCardId(method.id)} className="text-gray-600 hover:text-gray-900 font-medium">管理卡片</button>
                                                            <button onClick={() => handleDeletePayment(method.id)} className="text-gray-400 hover:text-red-500">删除</button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Address Management Tab */}
                    {activeTab === 'address' && (
                        <div className="flex flex-col h-full bg-gray-50">
                            <div className="px-8 py-5 border-b border-gray-100 bg-white">
                                <h1 className="text-gray-800 font-bold text-lg">地址管理</h1>
                            </div>
                            <div className="flex-1 p-6">
                                {loadingData ? <div className="p-8 text-center text-gray-400">加载中...</div> :
                                    addresses.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center -mt-12">
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                                                <Package className="w-12 h-12 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 text-sm mb-6">当前没有添加地址，赶快添加吧！</p>
                                            <button onClick={() => { setEditAddressData(null); setShowAddressModal(true); }} className="bg-primary-500 text-white px-8 py-2 rounded text-sm font-medium hover:bg-primary-600 transition-colors">
                                                添加地址
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-end">
                                                <button onClick={() => { setEditAddressData(null); setShowAddressModal(true); }} className="bg-primary-500 text-white px-6 py-2 rounded text-sm font-medium hover:bg-primary-600 transition-colors">添加地址</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {addresses.map(addr => (
                                                    <div key={addr.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-primary-500 transition-colors cursor-pointer group relative">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="font-bold text-gray-800">{addr.name}</span>
                                                            {addr.is_default && <span className="bg-primary-50 text-primary-600 text-xs px-2 py-0.5 rounded">默认</span>}
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-1">{addr.phone}</p>
                                                        <p className="text-gray-500 text-sm line-clamp-2 h-10">{addr.province} {addr.city} {addr.district} {addr.detail}
                                                            {addr.address_line1} {addr.address_line2}
                                                        </p>
                                                        <div className="absolute bottom-4 right-4 hidden group-hover:flex gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); setEditAddressData(addr); setShowAddressModal(true); }} className="text-blue-500 text-xs hover:underline">编辑</button>
                                                            <button className="text-red-500 text-xs hover:underline">删除</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    {activeTab !== 'dashboard' && activeTab !== 'cart' && activeTab !== 'custom-orders' && activeTab !== 'orders' && activeTab !== 'reviews' && activeTab !== 'profile' && activeTab !== 'password' && activeTab !== 'notifications' && activeTab !== 'payment' && activeTab !== 'address' && activeTab !== 'credits' && activeTab !== 'invoice' && (
                        <div className="p-10 text-center text-gray-400">
                            Feature not implemented in this view.
                        </div>
                    )}
                </div>


            </div>

            <AddressModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSuccess={refreshAddresses}
                editData={editAddressData}
            />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={refreshPayments}
            />

            <ChangeContactModal
                isOpen={contactModal.open}
                type={contactModal.type}
                onClose={() => setContactModal({ ...contactModal, open: false })}
                onSuccess={(newUser) => setUser(newUser)}
            />
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
