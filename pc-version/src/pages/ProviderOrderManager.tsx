/**
 * Provider Order Manager Component
 * Handles provider order list with tabs for different statuses
 */
import { useState, useEffect } from 'react';
import { ordersV2Api, uploadApi } from '../services/api';
import { Eye, Play, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, X, Plus, Trash2, UploadCloud } from 'lucide-react';

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
    { key: 'pending_payment', label: '待付款', statuses: ['created'] },
    { key: 'pending_service', label: '待上门', statuses: ['auth_hold', 'captured'] },
    { key: 'in_progress', label: '服务中', statuses: ['in_progress'] },
    { key: 'pending_verify', label: '待验收', statuses: ['pending_verification'] },
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

    // Start Service Logic
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [orderToStart, setOrderToStart] = useState<Order | null>(null);
    const [uploadStep, setUploadStep] = useState(false);
    const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleStartService = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setOrderToStart(order);
            setStartDialogOpen(true);
            setUploadStep(false);
            setUploadedPhotos([]);
        }
    };

    const handleStartChoice = async (choice: number) => {
        if (!orderToStart) return;

        if (choice === 0) {
            setUploadStep(true);
            return;
        }

        // Choice 1: Direct Start
        setStartDialogOpen(false);
        setActionLoading(orderToStart.id);

        try {
            const res = await ordersV2Api.startServiceV2(orderToStart.id, {
                photos: [],
                description: '从网页端直接启动'
            });

            if (res.success) {
                alert('服务已开始');
                fetchOrders();
            }
        } catch (error: any) {
            alert('操作失败: ' + (error.message || '未知错误'));
        } finally {
            setActionLoading(null);
            setOrderToStart(null);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);
        // Strict format check
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const validFiles = files.filter(f => validTypes.includes(f.type));

        if (validFiles.length !== files.length) {
            alert('只允许上传 JPG, PNG 格式的图片，已过滤不支持的文件。');
        }

        if (validFiles.length === 0) return;

        setIsUploading(true);
        try {
            const data = await uploadApi.uploadMultiple(validFiles);

            if (data.success && data.urls) {
                setUploadedPhotos(prev => [...prev, ...data.urls]);
            } else {
                if (data.urls) {
                    setUploadedPhotos(prev => [...prev, ...data.urls]);
                } else {
                    throw new Error(data.error || '上传失败');
                }
            }
        } catch (error: any) {
            console.error('Upload error', error);
            alert('图片上传失败: ' + error.message);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleRemovePhoto = (index: number) => {
        const newPhotos = [...uploadedPhotos];
        newPhotos.splice(index, 1);
        setUploadedPhotos(newPhotos);
    };

    const handleConfirmStart = async () => {
        if (!orderToStart) return;

        setStartDialogOpen(false);
        setActionLoading(orderToStart.id);

        try {
            const res = await ordersV2Api.startServiceV2(orderToStart.id, {
                photos: uploadedPhotos,
                description: '从网页端启动 (已拍照上传)'
            });

            if (res.success) {
                alert('服务已开始');
                fetchOrders();
            }
        } catch (error: any) {
            alert('操作失败: ' + (error.message || '未知错误'));
        } finally {
            setActionLoading(null);
            setOrderToStart(null);
            setUploadedPhotos([]);
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
            const res = await ordersV2Api.submitCompletion(orderId, { photos: [], description: '从网页端提交完工' });
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
            'auth_hold': { label: '待上门', color: 'text-cyan-600' },
            'captured': { label: '待上门', color: 'text-cyan-600' },
            'in_progress': { label: '服务中', color: 'text-indigo-600' },
            'pending_verification': { label: '已提交，待用户验收', color: 'text-yellow-600' },
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
                // 未支付，可修改订金
                buttons.push(
                    <button
                        key="modify"
                        className="px-4 py-1.5 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600 transition-colors"
                    >
                        修改订金
                    </button>
                );
                break;
            case 'auth_hold':
            case 'captured':
                // 已支付/预授权，可开始服务
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
                        key="complete"
                        onClick={() => handleRequestAcceptance(order.id)}
                        disabled={!!actionLoading}
                        className="px-4 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                        提交验收
                    </button>
                );
                break;
            case 'pending_verification':
                // No actions for provider while waiting for user
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

            {/* Start Service Choice Dialog */}
            {startDialogOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                {uploadStep ? '上传开工照片' : '服务开工确认'}
                            </h3>
                            <button
                                onClick={() => {
                                    setStartDialogOpen(false);
                                    setUploadStep(false);
                                    setUploadedPhotos([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {!uploadStep ? (
                            <>
                                <div className="space-y-4 mb-6">
                                    {/* Option 1: Photo & Notify */}
                                    <div
                                        onClick={() => handleStartChoice(0)}
                                        className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-200">
                                            <Eye size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 group-hover:text-green-700">拍照并通知用户</h4>
                                            <p className="text-xs text-gray-500">上传现场照片，记录服务状态</p>
                                        </div>
                                        <div className="text-gray-300 group-hover:text-green-500">
                                            <Play size={20} />
                                        </div>
                                    </div>

                                    {/* Option 2: Direct Start */}
                                    <div
                                        onClick={() => handleStartChoice(1)}
                                        className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-gray-200">
                                            <Play size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 group-hover:text-gray-900">直接开始 (不拍照)</h4>
                                            <p className="text-xs text-gray-500">快速开工，无需上传任何资料</p>
                                        </div>
                                        <div className="text-gray-300 group-hover:text-gray-500">
                                            <Play size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center text-xs text-gray-400">
                                    无论哪种方式，用户均会收到异议跳转链接
                                </div>
                            </>
                        ) : (
                            // Upload UI
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">请上传服务现场照片（最多4张）。支持 JPG, PNG, JPEG 格式。</p>

                                <div className="grid grid-cols-3 gap-3">
                                    {uploadedPhotos.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                            <img src={url} alt={`photo-${index}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => handleRemovePhoto(index)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    {uploadedPhotos.length < 4 && (
                                        <label className={`aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {isUploading ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
                                            ) : (
                                                <>
                                                    <div className="text-gray-400"><Plus size={24} /></div>
                                                    <span className="text-xs text-gray-400">上传照片</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/png, image/jpeg, image/jpg"
                                                multiple
                                                onChange={handleFileSelect}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={() => setUploadStep(false)}
                                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50"
                                    >
                                        上一步
                                    </button>
                                    <button
                                        onClick={handleConfirmStart}
                                        disabled={isUploading || uploadedPhotos.length === 0}
                                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        确认并开始
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
