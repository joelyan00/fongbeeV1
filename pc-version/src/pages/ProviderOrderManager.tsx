/**
 * Provider Order Manager Component
 * Handles provider order list with tabs for different statuses
 */
import { useState, useEffect } from 'react';
import { ordersV2Api } from '../services/api';
import { Eye, Play, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, X } from 'lucide-react';

interface Order {
    id: string;
    order_no: string;
    status: string;
    service_type: string;
    total_amount: number;
    deposit_amount: number;
    created_at: string;
    cancel_deadline: string;
    stripe_capture_status: string;
    user_id: string;
    contact_name?: string;
    contact_phone?: string;
    address?: string;
    requirements?: string;
    service_title?: string;
    service_image?: string;
    quantity?: number;
}

// Status tab configuration
const STATUS_TABS = [
    { key: 'all', label: '全部', statuses: [] },
    { key: 'pending_payment', label: '待付款', statuses: ['created', 'auth_hold'] },
    { key: 'pending_service', label: '待上门', statuses: ['captured'] },
    { key: 'pending_verify', label: '待验收', statuses: ['pending_verification'] },
    { key: 'in_progress', label: '服务中', statuses: ['in_progress'] },
    { key: 'completed', label: '已完成', statuses: ['verified', 'rated', 'completed'] },
    { key: 'cancelled', label: '已取消', statuses: ['cancelled', 'cancelled_by_provider', 'cancelled_forfeit'] },
];

export default function ProviderOrderManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    // Dialog states
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [verifyError, setVerifyError] = useState('');

    // Order counts for tabs
    const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await ordersV2Api.getMyOrders({ role: 'provider' });

            if (res.success && res.orders) {
                const allOrders = res.orders;
                setOrders(allOrders);

                // Calculate counts for each tab
                const counts: Record<string, number> = { all: allOrders.length };
                STATUS_TABS.forEach(tab => {
                    if (tab.key !== 'all') {
                        counts[tab.key] = allOrders.filter(o => tab.statuses.includes(o.status)).length;
                    }
                });
                setOrderCounts(counts);
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter orders based on active tab
    const filteredOrders = orders.filter(order => {
        const tab = STATUS_TABS.find(t => t.key === activeTab);
        if (!tab || tab.key === 'all') return true;
        return tab.statuses.includes(order.status);
    });

    const handleStartService = async (orderId: string) => {
        if (!confirm('确定要开始服务吗？反悔期将结束，定金将不可退还。')) return;

        setActionLoading(orderId);
        try {
            const res = await ordersV2Api.startService(orderId);
            if (res.success) {
                alert('服务已开始，验证码已发送给用户');
                fetchOrders();
            }
        } catch (error: any) {
            alert('操作失败: ' + (error.message || '未知错误'));
        } finally {
            setActionLoading(null);
        }
    };

    const openVerifyDialog = (order: Order) => {
        setSelectedOrder(order);
        setVerificationCode('');
        setVerifyError('');
        setVerifyDialogOpen(true);
    };

    const handleVerifyCode = async () => {
        if (!selectedOrder || !verificationCode) return;

        setActionLoading(selectedOrder.id);
        setVerifyError('');

        try {
            const res = await ordersV2Api.verifyCode(selectedOrder.id, verificationCode);
            if (res.success) {
                alert('验证成功！定金已解锁');
                setVerifyDialogOpen(false);
                fetchOrders();
            }
        } catch (error: any) {
            setVerifyError(error.message || '验证失败');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRequestAcceptance = async (orderId: string) => {
        if (!confirm('确定服务已完成并申请验收吗？')) return;

        setActionLoading(orderId);
        try {
            const res = await ordersV2Api.requestAcceptance(orderId, 'https://example.com/photo.jpg');
            if (res.success) {
                alert('验收申请已发送');
                fetchOrders();
            }
        } catch (error: any) {
            alert('操作失败: ' + (error.message || '未知错误'));
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string, color: string }> = {
            'created': { label: '待付款', color: 'text-orange-500' },
            'auth_hold': { label: '待付款', color: 'text-orange-500' },
            'captured': { label: '待上门', color: 'text-cyan-600' },
            'in_progress': { label: '服务中', color: 'text-indigo-600' },
            'pending_verification': { label: '待验收', color: 'text-yellow-600' },
            'rework': { label: '需返工', color: 'text-red-600' },
            'verified': { label: '已完成', color: 'text-green-600' },
            'rated': { label: '已评价', color: 'text-green-600' },
            'completed': { label: '已完成', color: 'text-gray-500' },
            'cancelled': { label: '已取消', color: 'text-gray-400' },
            'cancelled_by_provider': { label: '商家取消', color: 'text-red-500' },
            'cancelled_forfeit': { label: '违约取消', color: 'text-red-500' },
        };
        const style = map[status] || { label: status, color: 'text-gray-500' };
        return <span className={`text-sm font-medium ${style.color}`}>{style.label}</span>;
    };

    // Get action buttons based on order status
    const getActionButtons = (order: Order) => {
        const buttons = [];

        switch (order.status) {
            case 'created':
            case 'auth_hold':
                buttons.push(
                    <button
                        key="modify"
                        className="px-4 py-1.5 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600 transition-colors"
                    >
                        修改订金
                    </button>
                );
                break;
            case 'captured':
                buttons.push(
                    <button
                        key="start"
                        onClick={() => handleStartService(order.id)}
                        disabled={!!actionLoading}
                        className="px-4 py-1.5 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                    >
                        开始服务
                    </button>
                );
                break;
            case 'in_progress':
                buttons.push(
                    <button
                        key="verify"
                        onClick={() => openVerifyDialog(order)}
                        className="px-4 py-1.5 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600 transition-colors"
                    >
                        服务验收
                    </button>
                );
                break;
            case 'pending_verification':
                buttons.push(
                    <button
                        key="accept"
                        onClick={() => handleRequestAcceptance(order.id)}
                        disabled={!!actionLoading}
                        className="px-4 py-1.5 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                    >
                        发起验收
                    </button>
                );
                break;
            case 'verified':
            case 'completed':
                buttons.push(
                    <button
                        key="recontact"
                        className="px-4 py-1.5 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600 transition-colors"
                    >
                        重新接触
                    </button>
                );
                break;
        }

        // Always add view details button
        buttons.push(
            <button
                key="view"
                className="px-4 py-1.5 text-cyan-600 text-sm hover:underline"
            >
                查看详情
            </button>
        );

        return buttons;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px]">
            {/* Tab Filters */}
            <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-6 overflow-x-auto">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`whitespace-nowrap px-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                ? 'border-cyan-500 text-cyan-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}({orderCounts[tab.key] || 0})
                    </button>
                ))}

                {/* Date filter placeholder */}
                <div className="ml-auto">
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600">
                        <option>筛选时间</option>
                        <option>最近7天</option>
                        <option>最近30天</option>
                        <option>最近90天</option>
                    </select>
                </div>
            </div>

            {/* Order List */}
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        加载中...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        暂无订单
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <div
                                key={order.id}
                                className="border border-gray-100 rounded-lg hover:shadow-md transition-shadow overflow-hidden"
                            >
                                <div className="flex">
                                    {/* Service Image */}
                                    <div className="w-32 h-28 bg-cyan-100 flex-shrink-0">
                                        {order.service_image ? (
                                            <img
                                                src={order.service_image}
                                                alt={order.service_title || '服务'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-cyan-400">
                                                <div className="text-center">
                                                    <div className="text-4xl">🛠️</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Info */}
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                                                {order.service_title || order.service_type || '清洁打扫门2小时清洁打扫门2小时清洁打扫门2小时 上门服务保姆清洁'}
                                            </h3>
                                            <p className="text-xs text-gray-400 line-clamp-1">
                                                {order.requirements || '清洁打扫门2小时清洁打扫门2小时清洁打扫门2小时 上门服务保姆清洁'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                预约时间: {new Date(order.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="w-28 p-4 flex flex-col justify-center items-center border-l border-gray-100">
                                        <span className="text-red-500 font-bold">$ {order.total_amount}</span>
                                        <span className="text-xs text-gray-400">x{order.quantity || 1}</span>
                                    </div>

                                    {/* Total Amount */}
                                    <div className="w-28 p-4 flex flex-col justify-center items-center border-l border-gray-100">
                                        <span className="text-xs text-gray-500">尖次数:</span>
                                        <span className="text-red-500 font-bold">$ {order.total_amount}</span>
                                    </div>

                                    {/* Status */}
                                    <div className="w-24 p-4 flex items-center justify-center border-l border-gray-100">
                                        {getStatusBadge(order.status)}
                                    </div>

                                    {/* Actions */}
                                    <div className="w-40 p-4 flex flex-col gap-2 items-center justify-center border-l border-gray-100">
                                        {getActionButtons(order)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Verify Code Dialog */}
            {verifyDialogOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">验证服务码</h3>
                            <button
                                onClick={() => setVerifyDialogOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">请输入用户收到的 6 位短信验证码以解锁定金。</p>

                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="6位数字验证码"
                            className="w-full text-center text-3xl tracking-widest font-mono border-2 border-gray-200 rounded-xl py-3 focus:border-cyan-500 focus:ring-0 outline-none mb-4"
                            maxLength={6}
                        />

                        {verifyError && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-4">
                                <AlertTriangle className="w-4 h-4" />
                                {verifyError}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setVerifyDialogOpen(false)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleVerifyCode}
                                disabled={!!actionLoading || verificationCode.length !== 6}
                                className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 disabled:opacity-50"
                            >
                                {actionLoading ? '验证中...' : '确认验证'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
