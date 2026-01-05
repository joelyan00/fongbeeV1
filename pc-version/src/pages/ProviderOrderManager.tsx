/**
 * Provider Order Manager Component
 * Handles provider order list, starting service, and verifying codes
 */
import { useState, useEffect } from 'react';
import { ordersV2Api } from '../services/api';
import { Calendar, MapPin, Clock, User, Phone, CheckCircle, AlertTriangle, Play, ShieldCheck } from 'lucide-react';

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
    contact_name?: string; // Need to join with users in backend or fetch
    contact_phone?: string;
    address?: string; // Need to join addresses
    requirements?: string;
}

export default function ProviderOrderManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('active'); // active, completed, cancelled

    // Dialog states
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [verifyError, setVerifyError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Check mapping of tabs to statuses
            let status = '';
            if (activeTab === 'active') status = 'captured,in_progress,pending_verification,rework';
            else if (activeTab === 'completed') status = 'verified,rated,completed';
            else if (activeTab === 'cancelled') status = 'cancelled,cancelled_by_provider,cancelled_forfeit';

            // For now, fetch all and filter client side if backend doesn't support comma-separated
            // Ideally backend supports 'status=captured,in_progress'
            // Let's assume backend supports basic status filtering or fetch all
            const res = await ordersV2Api.getMyOrders({ role: 'provider' });

            if (res.success && res.orders) {
                // Client side filtering for better UX for now
                const allOrders = res.orders;
                let filtered = [];

                if (activeTab === 'active') {
                    filtered = allOrders.filter(o => ['captured', 'in_progress', 'pending_verification', 'rework'].includes(o.status));
                } else if (activeTab === 'completed') {
                    filtered = allOrders.filter(o => ['verified', 'rated', 'completed'].includes(o.status));
                } else if (activeTab === 'cancelled') {
                    filtered = allOrders.filter(o => o.status.startsWith('cancelled'));
                } else {
                    filtered = allOrders;
                }

                setOrders(filtered);
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

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
            const res = await ordersV2Api.requestAcceptance(orderId, 'https://example.com/photo.jpg'); // Demo photo
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
            'created': { label: '待付款', color: 'bg-gray-100 text-gray-800' },
            'auth_hold': { label: '反悔期中', color: 'bg-blue-100 text-blue-800' },
            'captured': { label: '待服务', color: 'bg-emerald-100 text-emerald-800' },
            'in_progress': { label: '服务中', color: 'bg-indigo-100 text-indigo-800' },
            'pending_verification': { label: '待验收', color: 'bg-yellow-100 text-yellow-800' },
            'rework': { label: '需返工', color: 'bg-red-100 text-red-800' },
            'verified': { label: '已完成', color: 'bg-green-100 text-green-800' },
            'rated': { label: '已评价', color: 'bg-green-100 text-green-800' },
            'completed': { label: '已结束', color: 'bg-gray-100 text-gray-800' },
            'cancelled': { label: '已取消', color: 'bg-gray-100 text-gray-500' },
            'cancelled_by_provider': { label: '商家取消', color: 'bg-red-50 text-red-500' },
            'cancelled_forfeit': { label: '违约取消', color: 'bg-red-50 text-red-500' },
        };
        const style = map[status] || { label: status, color: 'bg-gray-100' };
        return <span className={`px-2 py-1 rounded-full text-xs font-bold ${style.color}`}>{style.label}</span>;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px]">
            {/* Header / Tabs */}
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">订单管理</h2>
                <div className="flex gap-2">
                    {['active', 'completed', 'cancelled'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab === 'active' ? '进行中' : tab === 'completed' ? '已完成' : '已取消'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="p-6">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">加载中...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        暂无订单
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono text-gray-500">#{order.order_no}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <span className="text-sm text-gray-400">{new Date(order.created_at).toLocaleString()}</span>
                                </div>

                                <div className="flex gap-6 mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-900">客户 (ID: {order.user_id.slice(0, 8)})</span>
                                        </div>
                                        {order.contact_phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {order.contact_phone}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {order.address || '线上/未提供地址'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 mb-1">定金金额</div>
                                        <div className="text-xl font-bold text-emerald-600">${order.deposit_amount}</div>
                                        <div className="text-xs text-gray-400">总价 ${order.total_amount}</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                    {order.status === 'captured' && (
                                        <button
                                            onClick={() => handleStartService(order.id)}
                                            disabled={!!actionLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            <Play className="w-4 h-4" />
                                            开始服务 & 发送验证码
                                        </button>
                                    )}

                                    {order.status === 'in_progress' && (
                                        <button
                                            onClick={() => openVerifyDialog(order)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            验证服务码
                                        </button>
                                    )}

                                    {(order.status === 'in_progress' || order.status === 'rework') && (
                                        <button
                                            onClick={() => handleRequestAcceptance(order.id)}
                                            disabled={!!actionLoading}
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            申请验收
                                        </button>
                                    )}
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
                        <h3 className="text-xl font-bold text-gray-900 mb-4">验证服务码</h3>
                        <p className="text-gray-500 text-sm mb-6">请输入用户收到的 6 位短信验证码以解锁定金。</p>

                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="6位数字验证码"
                            className="w-full text-center text-3xl tracking-widest font-mono border-2 border-gray-200 rounded-xl py-3 focus:border-emerald-500 focus:ring-0 outline-none mb-4"
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
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
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
