import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, User, Settings, LogOut, ChevronRight, Star, Clock, MapPin, CreditCard, ChevronDown, Filter, Trash2, Plus, Minus, CheckSquare, Square, Lock, Bell, Package, ClipboardList, Wallet, MessageSquare, HelpCircle, Mail, Smartphone, Globe, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { getUserInfo, isLoggedIn, authApi, setAuth, getToken, paymentApi, addressApi } from '../services/api';
import AddressModal from '../components/AddressModal';
import PaymentModal from '../components/PaymentModal';

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
    const [formData, setFormData] = useState({ surname: '', name: '' });
    const [saving, setSaving] = useState(false);

    // New States
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [notificationSettings, setNotificationSettings] = useState({ sms: true, email: true, site: true });
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
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
        if (activeTab === 'payment') {
            refreshPayments();
        }
        if (activeTab === 'address') {
            refreshAddresses();
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
                                                如手机号不再使用，<button className="text-orange-500 font-bold hover:underline">点击修改</button>
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
                                                如邮箱不再使用，<button className="text-orange-500 font-bold hover:underline">点击修改</button>
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
                    {activeTab === 'payment' && (
                        <div className="flex flex-col h-full bg-gray-50">
                            <div className="px-8 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
                                <h1 className="text-gray-800 font-bold text-lg">付款方式</h1>
                                <button onClick={() => setShowPaymentModal(true)} className="text-orange-500 text-sm font-medium hover:underline">添加银行卡</button>
                            </div>
                            <div className="p-6 space-y-4">
                                {loadingData ? <div className="p-8 text-center text-gray-400">加载中...</div> :
                                    paymentMethods.length === 0 ? (
                                        <div className="bg-white p-12 rounded-lg text-center text-gray-400">
                                            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>暂无付款方式</p>
                                        </div>
                                    ) : (
                                        paymentMethods.map(method => (
                                            <div key={method.id} className="bg-white p-5 rounded-lg border border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {method.brand?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            {method.is_default && <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded border border-blue-100">默认卡片</span>}
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
                                                    <button className="text-gray-600 hover:text-gray-900">管理卡片</button>
                                                    <button onClick={() => handleDeletePayment(method.id)} className="text-gray-400 hover:text-red-500">删除</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                            </div>
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

                    {activeTab !== 'cart' && activeTab !== 'profile' && activeTab !== 'password' && activeTab !== 'notifications' && activeTab !== 'payment' && activeTab !== 'address' && (
                        <div className="p-10 text-center text-gray-400">
                            Feature not implemented in this view.
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="w-[280px] flex-shrink-0 space-y-4">
                    {/* Profile Card */}
                    <div className="bg-white p-6 shadow-sm rounded-lg flex flex-col items-center">
                        <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">
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
                    </div>

                    {/* Promo Card */}
                    <div className="bg-primary-600 text-white p-6 rounded-lg shadow-sm text-center">
                        <h3 className="font-bold text-lg mb-2">申请成为服务商</h3>
                        <button className="bg-white text-primary-600 px-6 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors mt-2">
                            立刻申请
                        </button>
                    </div>

                    {/* Help Center */}
                    <div className="bg-primary-600 text-white p-6 rounded-lg shadow-sm">
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
