import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, Calendar, Clock, ClipboardList,
    Search, CheckCircle, XCircle,
    ShoppingCart, MapPin, MessageSquare, Star,
    FileText, CreditCard, Settings, ChevronRight,
    UserCircle
} from 'lucide-react';
import Header from '../components/Header';
import { getUserInfo, isLoggedIn, submissionsApi } from '../services/api';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [customPendingCount, setCustomPendingCount] = useState(0);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }
        setUser(getUserInfo());

        // Fetch counts
        submissionsApi.getMySubmissions({ type: 'custom', status: 'pending' })
            .then(res => {
                setCustomPendingCount(res.count || res.submissions?.length || 0);
            })
            .catch(console.error);

    }, [navigate]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12">
            <Header />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
                {/* User Header */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-3xl border-4 border-white shadow-md">
                        {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name || '用户'}</h1>
                        <p className="text-gray-500 font-medium">{user.email}</p>
                    </div>
                </div>

                {/* Points Banner */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-2xl flex items-center justify-between mb-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-500">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-amber-800 uppercase tracking-wide">我的积分</div>
                            <div className="text-3xl font-extrabold text-amber-600">{user.credits || 0}</div>
                        </div>
                    </div>
                    <button className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-full transition-colors shadow-lg shadow-amber-500/20">
                        积分兑换
                    </button>
                </div>

                {/* Orders Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Standard Orders */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-bold text-lg text-gray-900">标准服务订单</h2>
                            <button className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                                全部 <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <StatusItem icon={Wallet} label="待付款" color="text-amber-500" bgColor="bg-amber-50" onClick={() => navigate('/orders?type=standard&status=pending_payment')} />
                            <StatusItem icon={Calendar} label="待上门" color="text-blue-500" bgColor="bg-blue-50" onClick={() => navigate('/orders?type=standard&status=pending_service')} />
                            <StatusItem icon={Clock} label="服务中" color="text-emerald-500" bgColor="bg-emerald-50" onClick={() => navigate('/orders?type=standard&status=processing')} />
                            <StatusItem icon={ClipboardList} label="待接单" color="text-purple-500" bgColor="bg-purple-50" onClick={() => navigate('/orders?type=standard&status=pending')} />
                        </div>
                    </div>

                    {/* Custom Orders */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-bold text-lg text-gray-900">定制服务订单</h2>
                            <button onClick={() => navigate('/orders?type=custom')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                                全部 <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <StatusItem
                                icon={Search}
                                label="寻找中"
                                color="text-blue-500"
                                bgColor="bg-blue-50"
                                onClick={() => navigate('/orders?type=custom&status=pending')}
                                badge={customPendingCount}
                            />
                            <StatusItem icon={ClipboardList} label="服务中" color="text-gray-500" bgColor="bg-gray-50" onClick={() => navigate('/orders?type=custom&status=processing')} />
                            <StatusItem icon={CheckCircle} label="已完成" color="text-emerald-500" bgColor="bg-emerald-50" onClick={() => navigate('/orders?type=custom&status=completed')} />
                            <StatusItem icon={XCircle} label="已取消" color="text-red-500" bgColor="bg-red-50" onClick={() => navigate('/orders?type=custom&status=cancelled')} />
                        </div>
                    </div>
                </div>

                {/* Menu List */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-50">
                        <ListItem icon={ShoppingCart} label="我的购物车" />
                        <ListItem icon={MessageSquare} label="收件箱" badge={1} />
                        <ListItem icon={Star} label="我的评价" />
                        <ListItem icon={FileText} label="开具发票" />
                        <ListItem icon={CreditCard} label="付款方式" onClick={() => navigate('/payment-methods')} />
                        <ListItem icon={MapPin} label="地址管理" onClick={() => navigate('/addresses')} />
                        <ListItem icon={Settings} label="设置" isLast />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusItem({ icon: Icon, label, color, bgColor, onClick, badge }: { icon: any, label: string, color: string, bgColor: string, onClick?: () => void, badge?: number }) {
    return (
        <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={onClick}>
            <div className={`w-12 h-12 rounded-2xl ${bgColor} ${color} flex items-center justify-center transition-transform group-hover:scale-110 relative`}>
                <Icon className="w-6 h-6" />
                {badge ? (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white font-bold text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-white shadow-sm">
                        {badge}
                    </div>
                ) : null}
            </div>
            <span className="text-xs font-medium text-gray-600">{label}</span>
        </div>
    );
}

function ListItem({ icon: Icon, label, badge, isLast, onClick }: { icon: any, label: string, badge?: number, isLast?: boolean, onClick?: () => void }) {
    return (
        <div className={`flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer transition-colors ${!isLast ? '' : ''}`} onClick={onClick}>
            <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-gray-400" />
                <span className="text-base font-medium text-gray-700">{label}</span>
            </div>
            <div className="flex items-center gap-3">
                {badge && (
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {badge}
                    </div>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
        </div>
    );
}
