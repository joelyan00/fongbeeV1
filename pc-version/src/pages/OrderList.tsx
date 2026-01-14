import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ordersV2Api } from '../services/api';
import { Calendar, MapPin, Clock, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

interface Order {
    id: string;
    order_no: string;
    status: string;
    service_type: string;
    total_amount: number;
    deposit_amount: number;
    created_at: string;
    service_name?: string; // from join
    provider_name?: string; // from join
}

export default function OrderList() {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // Fetch orders using new V2 API
                const res = await ordersV2Api.getMyOrders({ role: 'user', status });
                if (res.success) {
                    setOrders(res.orders || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [type, status]);

    const handleAction = async (action: string, orderId: string, data?: any) => {
        const actionMap: Record<string, string> = {
            'cancel': '取消订单',
            'accept': '确认验收',
            'rework': '申请返工'
        };

        setConfirmModal({
            isOpen: true,
            title: actionMap[action] || '操作确认',
            message: `确定要执行 ${actionMap[action]} 操作吗?`,
            type: action === 'cancel' || action === 'rework' ? 'danger' : 'info',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    if (action === 'cancel') {
                        await ordersV2Api.cancel(orderId, { reason: '用户主动取消' });
                    } else if (action === 'accept') {
                        await ordersV2Api.accept(orderId);
                    } else if (action === 'rework') {
                        await ordersV2Api.rework(orderId, '用户要求返工');
                    }
                    showToast('操作成功', 'success');
                    // Refresh
                    const res = await ordersV2Api.getMyOrders({ role: 'user', status });
                    setOrders(res.orders || []);
                } catch (e: any) {
                    showToast('操作失败: ' + e.message, 'error');
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <div className="max-w-4xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex items-center mb-8 gap-3">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 -ml-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600"
                        title="返回"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {type === 'custom' ? '定制服务订单' : '我的订单'}
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
                                暂无订单
                            </div>
                        ) : (
                            orders.map((order: any) => (
                                <OrderCard key={order.id} order={order} onAction={handleAction} />
                            ))
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

function getStatusText(status: string) {
    const map: Record<string, { text: string, color: string }> = {
        'created': { text: '待付款', color: 'text-gray-500' },
        'auth_hold': { text: '反悔期中', color: 'text-blue-600' },
        'captured': { text: '待服务', color: 'text-emerald-600' },
        'in_progress': { text: '服务中', color: 'text-indigo-600' },
        'pending_verification': { text: '待验收', color: 'text-yellow-600' },
        'verified': { text: '已完成', color: 'text-green-600' },
        'rated': { text: '已评价', color: 'text-green-600' },
        'cancelled': { text: '已取消', color: 'text-gray-400' },
        'rework': { text: '需返工', color: 'text-red-500' },
    };
    return map[status] || { text: status, color: 'text-gray-500' };
}

function OrderCard({ order, onAction }: { order: any, onAction: (action: string, id: string, data?: any) => void }) {
    const statusInfo = getStatusText(order.status);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.service_type === 'standard' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {order.service_type === 'standard' ? '标准' : '定制'}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900">
                        {/* Mock service name if join not ready */}
                        订单 #{order.order_no}
                    </h3>
                </div>
                <span className={`text-sm font-bold ${statusInfo.color}`}>{statusInfo.text}</span>
            </div>

            {/* Content */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500 space-y-1">
                    <p>总金额: ${order.total_amount}</p>
                    <p>定金: <span className="font-bold text-gray-900">${order.deposit_amount}</span></p>
                    <p>下单时间: {new Date(order.created_at).toLocaleString()}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    状态更新于: {new Date(order.updated_at).toLocaleTimeString()}
                </div>

                <div className="flex gap-3">
                    {(order.status === 'created' || order.status === 'auth_hold' || order.status === 'captured') && (
                        <button
                            onClick={() => onAction('cancel', order.id)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                        >
                            取消订单
                        </button>
                    )}

                    {order.status === 'pending_verification' && (
                        <>
                            <button
                                onClick={() => onAction('rework', order.id)}
                                className="px-3 py-1.5 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50"
                            >
                                申请返工
                            </button>
                            <button
                                onClick={() => onAction('accept', order.id)}
                                className="px-3 py-1.5 bg-emerald-600 rounded-lg text-sm text-white hover:bg-emerald-700 shadow-sm"
                            >
                                确认验收
                            </button>
                        </>
                    )}

                    {order.status === 'verified' && (
                        <button
                            disabled
                            className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-400 cursor-not-allowed"
                        >
                            去评价
                        </button>
                    )}
                </div>
            </div>

            {order.status === 'auth_hold' && (
                <div className="mt-3 bg-blue-50 p-2 rounded-lg flex items-start gap-2 text-xs text-blue-700">
                    <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>反悔期保障中：在 {new Date(order.cancel_deadline).toLocaleTimeString()} 前取消可全额退款。</span>
                </div>
            )}
        </div>
    );
}
