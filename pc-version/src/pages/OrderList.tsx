import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { submissionsApi } from '../services/api';
import { Calendar, MapPin, Clock, ArrowLeft } from 'lucide-react';

export default function OrderList() {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await submissionsApi.getMySubmissions({ type, status });
                setOrders(res.submissions || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [type, status]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <div className="max-w-4xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex items-center mb-8 gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600"
                        title="返回"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {type === 'custom' ? '定制服务订单' : '标准服务订单'}
                        {status && <span className="ml-2 text-primary-600 font-medium text-lg">· {getStatusText(status)}</span>}
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
                                <OrderCard key={order.id} order={order} />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function getStatusText(status: string) {
    const map: Record<string, string> = {
        'pending': '等待接单',
        'processing': '服务中',
        'completed': '已完成',
        'cancelled': '已取消',
        'pending_payment': '待付款'
    };
    return map[status] || status;
}

function OrderCard({ order }: { order: any }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.type === 'standard' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {order.type === 'standard' ? '标准' : '定制'}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900">{order.contact_name || '未命名服务'}</h3>
                </div>
                <span className="text-sm font-medium text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{order.requirements || order.description || '无具体描述'}</p>

            <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {order.city}
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getStatusText(order.status)}
                </div>
            </div>
        </div>
    );
}
