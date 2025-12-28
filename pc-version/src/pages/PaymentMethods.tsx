import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../services/stripe';
import { paymentApi } from '../services/api';
import Header from '../components/Header';
import { ArrowLeft, CreditCard, Plus, Lock } from 'lucide-react';

export default function PaymentMethods() {
    const navigate = useNavigate();
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    const fetchCards = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getMethods();
            setCards(res.methods || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleAddClick = async () => {
        setShowModal(true);
        // Fetch intent immediately
        try {
            const res = await paymentApi.createSetupIntent();
            setClientSecret(res.clientSecret);
        } catch (e) {
            console.error(e);
            alert('初始化失败');
            setShowModal(false);
        }
    };

    const handleSetDefault = async (id: string) => {
        // Optimistic update
        setCards(prev => prev.map(c => ({ ...c, is_default: c.id === id })));
        try {
            await paymentApi.setDefaultMethod(id);
        } catch (e) {
            console.error('Failed to set default', e);
            // Revert or re-fetch
            fetchCards();
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        setClientSecret('');
        fetchCards();
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <div className="max-w-2xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex items-center mb-8 gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white transition-all text-gray-600">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">付款方式</h1>
                </div>

                {/* Digital Wallets */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">数字钱包</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer opacity-70">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-900">
                                {/* Apple Icon SVG */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-apple"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" /><path d="M10 2c1 .5 2 2 2 5" /></svg>
                            </div>
                            <span className="font-bold text-gray-900">Apple Pay</span>
                        </div>
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                    </div>
                </div>

                {/* Cards */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">银行卡</h3>
                    {loading ? <div className="text-gray-400 text-center py-8">加载中...</div> : (
                        cards.length === 0 ? (
                            <div className="flex flex-col items-center py-10">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <CreditCard className="w-10 h-10" />
                                </div>
                                <div className="text-gray-400 text-sm">暂无绑定的银行卡</div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cards.map((card) => (
                                    <div
                                        key={card.id}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${card.is_default ? 'bg-primary-50 border-primary-200 shadow-sm' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}
                                        onClick={() => handleSetDefault(card.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-9 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 capitalize shadow-sm">
                                                {card.brand}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-lg">
                                                    •••• {card.last4}
                                                    {card.is_default && <span className="ml-2 text-xs font-normal text-primary-600 bg-white px-2 py-0.5 rounded-full border border-primary-100">默认</span>}
                                                </div>
                                                <div className="text-xs text-gray-500">有效期 {card.exp_month}/{card.exp_year}</div>
                                            </div>
                                        </div>

                                        {/* Radio Button */}
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${card.is_default ? 'border-primary-600 bg-white' : 'border-gray-300'}`}>
                                            {card.is_default && <div className="w-3 h-3 bg-primary-600 rounded-full" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                <div className="sticky bottom-8">
                    <button
                        onClick={handleAddClick}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="w-6 h-6" />
                        添加支付方式
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-xs">
                        <Lock className="w-3 h-3" />
                        <span className="font-medium">支付信息安全加密存储</span>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 text-3xl leading-none transition-colors">&times;</button>
                        <h2 className="text-2xl font-bold mb-8 text-gray-900">添加银行卡</h2>

                        {clientSecret ? (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <AddCardForm onSuccess={handleSuccess} />
                            </Elements>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-primary-600"></div>
                                <div className="text-gray-500 font-medium">正在连接安全支付网关...</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function AddCardForm({ onSuccess }: { onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: window.location.href, // This might reload page?
            },
            redirect: 'if_required'
        });

        if (error) {
            setError(error.message || 'Error');
            setProcessing(false);
        } else {
            // Success
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement options={{ layout: 'tabs' }} />
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">
                    {error}
                </div>
            )}
            <button
                disabled={!stripe || processing}
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20"
            >
                {processing ? '正在验证卡片...' : '保存主要支付方式'}
            </button>
        </form>
    );
}
