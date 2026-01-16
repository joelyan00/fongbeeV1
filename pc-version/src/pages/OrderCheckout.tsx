/**
 * Order Checkout Page
 * Handles order creation with deposit payment for standard services
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { ordersV2Api, paymentApi, isLoggedIn } from '../services/api';
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface OrderCheckoutProps {
    serviceId?: string;
    providerId?: string;
    serviceName?: string;
    totalPrice?: number;
}

export default function OrderCheckout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get params from URL
    const serviceId = searchParams.get('serviceId') || '';
    const providerId = searchParams.get('providerId') || '';
    const serviceName = searchParams.get('name') || '服务项目';
    const totalPrice = parseFloat(searchParams.get('price') || '0');
    const depositRate = parseInt(searchParams.get('depositRate') || '20');
    const orderNote = searchParams.get('orderNote') || '';

    const [loading, setLoading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const depositAmount = (totalPrice * depositRate / 100);
    const regretPeriodHours = 24;

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
            return;
        }

        // Load payment methods
        paymentApi.getMethods().then(res => {
            setPaymentMethods(res.methods || []);
            const defaultMethod = res.methods?.find((m: any) => m.is_default);
            if (defaultMethod) {
                setSelectedMethod(defaultMethod.id);
            }
        }).catch(console.error);
    }, [navigate]);

    const handleSubmit = async () => {
        if (!providerId) {
            setError('缺少服务商信息');
            return;
        }

        setLoading(true);
        setStep('processing');

        try {
            // Generate idempotency key to prevent duplicate orders
            const idempotencyKey = `order_${serviceId}_${providerId}_${Date.now()}`;

            const result = await ordersV2Api.create({
                serviceType: 'standard',
                providerId,
                serviceListingId: serviceId || undefined,
                totalAmount: totalPrice,
                depositRate,
                idempotencyKey,
                userNote: orderNote // Pass user note
            });

            if (result.success) {
                setOrder(result.order);
                setStep('success');

                // If there's a client secret, we'd integrate Stripe Elements here
                // For now, we simulate a successful payment flow
                if (result.payment?.clientSecret) {
                    // TODO: Integrate Stripe Elements for card payment
                    console.log('Payment requires Stripe Elements:', result.payment.clientSecret);
                }
            } else {
                throw new Error('订单创建失败');
            }

        } catch (err: any) {
            console.error('Order creation error:', err);
            setError(err.message || '订单创建失败，请重试');
            setStep('error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!order?.id) return;

        setLoading(true);
        try {
            await ordersV2Api.cancel(order.id, { reason: '用户取消' });
            navigate('/profile');
        } catch (err) {
            console.error('Cancel error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-2xl mx-auto pt-24 pb-12 px-4">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    返回
                </button>

                {/* Step: Confirm */}
                {step === 'confirm' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                            <h1 className="text-2xl font-bold">确认订单</h1>
                            <p className="text-emerald-100 mt-1">请确认您的服务订单信息</p>
                        </div>

                        {/* Service Info */}
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">{serviceName}</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>服务总价</span>
                                    <span className="font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>定金比例</span>
                                    <span className="font-semibold text-gray-900">{depositRate}%</span>
                                </div>
                                <div className="flex justify-between text-emerald-600 text-lg font-bold pt-3 border-t border-gray-100">
                                    <span>需支付定金</span>
                                    <span>${depositAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Note Verification */}
                        {orderNote && (
                            <div className="p-6 border-b border-gray-100 bg-amber-50/50">
                                <h3 className="text-sm font-semibold text-gray-500 mb-2">订单备注</h3>
                                <p className="text-gray-900 text-sm whitespace-pre-wrap">{orderNote}</p>
                            </div>
                        )}

                        {/* Regret Period Notice */}
                        <div className="p-6 bg-blue-50 border-b border-blue-100">
                            <div className="flex items-start gap-3">
                                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900">反悔期保障</h3>
                                    <p className="text-blue-700 text-sm mt-1">
                                        支付后 <span className="font-bold">{regretPeriodHours} 小时</span> 内可免费取消订单，定金将全额退还。
                                        超过反悔期后取消，定金将不予退还。
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-gray-900">支付方式</h3>
                            </div>

                            {paymentMethods.length > 0 ? (
                                <div className="space-y-2">
                                    {paymentMethods.map((method: any) => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedMethod === method.id
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={selectedMethod === method.id}
                                                onChange={(e) => setSelectedMethod(e.target.value)}
                                                className="w-4 h-4 text-emerald-600"
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">💳</span>
                                                <span className="text-gray-900">
                                                    {method.card?.brand?.toUpperCase()} •••• {method.card?.last4}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 mb-3">您还没有绑定支付方式</p>
                                    <button
                                        onClick={() => navigate('/profile/payment-methods')}
                                        className="text-emerald-600 hover:underline font-medium"
                                    >
                                        添加支付方式 →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Security Notice */}
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Shield className="w-4 h-4" />
                                <span>支付由 Stripe 安全处理，我们不存储您的卡片信息</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="p-6">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !selectedMethod || paymentMethods.length === 0}
                                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '处理中...' : `支付定金 $${depositAmount.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Processing */}
                {step === 'processing' && (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">正在处理订单...</h2>
                        <p className="text-gray-500 mt-2">请稍候，正在创建您的订单</p>
                    </div>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">订单创建成功！</h2>
                        <p className="text-gray-500 mt-2">订单号: {order?.order_no}</p>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
                            <p className="text-blue-800 text-sm">
                                <Clock className="w-4 h-4 inline mr-1" />
                                您有 <strong>{regretPeriodHours} 小时</strong> 的反悔期。
                                超时后定金将自动扣款，服务商将开始为您服务。
                            </p>
                        </div>

                        <div className="mt-8 flex gap-4 justify-center">
                            <button
                                onClick={() => navigate('/profile/orders')}
                                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                            >
                                查看订单
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                            >
                                {loading ? '取消中...' : '取消订单'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Error */}
                {step === 'error' && (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">订单创建失败</h2>
                        <p className="text-red-600 mt-2">{error}</p>

                        <div className="mt-8">
                            <button
                                onClick={() => setStep('confirm')}
                                className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800"
                            >
                                返回重试
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
