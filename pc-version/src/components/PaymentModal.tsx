import React, { useState } from 'react';
import { X } from 'lucide-react';
import { paymentApi } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import {
    CardElement,
    Elements,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

const STRIPE_PK = 'pk_test_51She9JRAsmOrZbpaBm1TyoYwoakMuLEH7cTlFVmfTUBc1aDDTn8s0wNt42VvfkorBq9zbI72r81jgkOXVACVnXmD00XeM6o5Ix';
const stripePromise = loadStripe(STRIPE_PK);

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CheckoutForm = ({ onSuccess, onClose }: { onSuccess: () => void, onClose: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError('');

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) return;

            const { clientSecret } = await paymentApi.createSetupIntent();
            const result = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (result.error) {
                setError(result.error.message || 'Payment failed');
            } else {
                onSuccess();
                onClose();
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'System error');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-4 border border-gray-300 rounded-md mb-4 bg-white">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#32325d',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#fa755a',
                            iconColor: '#fa755a',
                        },
                    },
                    hidePostalCode: true
                }} />
            </div>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <button type="submit" disabled={!stripe || processing} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm">
                {processing ? '处理中...' : '保存卡片'}
            </button>
        </form>
    );
};

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold mb-6">添加银行卡</h2>
                <Elements stripe={stripePromise}>
                    <CheckoutForm onSuccess={onSuccess} onClose={onClose} />
                </Elements>
            </div>
        </div>
    );
}
