<template>
  <view class="min-h-screen bg-gray-50 p-4">
    <!-- Header -->
    <view class="mb-6 text-center pt-4">
        <text class="text-lg font-bold text-gray-900">添加银行卡</text>
    </view>

    <!-- Card Input -->
    <view class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-3">卡片详情</label>
        <div id="card-element" class="p-3 border border-gray-300 rounded-lg"></div>
        <text v-if="errorMsg" class="text-red-500 text-sm mt-2 block">{{ errorMsg }}</text>
    </view>

    <!-- Save Button -->
    <button 
        class="w-full mt-6 bg-emerald-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        :disabled="processing"
        @click="handleSave"
    >
        {{ processing ? '处理中...' : '保存卡片' }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { paymentApi } from '@/services/api';
// #ifdef H5
import wx from 'weixin-js-sdk';
// #endif

const processing = ref(false);
const errorMsg = ref('');
let stripe: any = null;
let elements: any = null;
let card: any = null;

// Replace with your real PK
const STRIPE_PK = 'pk_test_51She9JRAsmOrZbpaBm1TyoYwoakMuLEH7cTlFVmfTUBc1aDDTn8s0wNt42VvfkorBq9zbI72r81jgkOXVACVnXmD00XeM6o5Ix';

onMounted(() => {
    // Load Stripe.js if not present
    if (typeof window !== 'undefined' && !(window as any).Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = initStripe;
        document.head.appendChild(script);
    } else {
        initStripe();
    }
});

const initStripe = () => {
    stripe = (window as any).Stripe(STRIPE_PK);
    elements = stripe.elements();
    card = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
            },
        },
        hidePostalCode: true,
    });
    card.mount('#card-element');
};

const handleSave = async () => {
    if (!stripe || !card) return;
    
    processing.value = true;
    errorMsg.value = '';

    try {
        // 1. Get Setup Intent Secret from backend
        // Note: Ensure your paymentApi works in H5 mode with proper Auth headers
        const { clientSecret } = await paymentApi.createSetupIntent();
        
        // 2. Confirm Card Setup
        const result = await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
                card: card,
            }
        });

        if (result.error) {
            errorMsg.value = result.error.message;
            processing.value = false;
        } else {
            // Success!
            // Navigate back to Mini Program
            // #ifdef H5
            wx.miniProgram.navigateBack({
                delta: 1,
                success: () => {
                    console.log('Navigated back to MP');
                }
            });
            // #endif
        }
    } catch (e: any) {
        errorMsg.value = e.message || '系统错误，请重试';
        processing.value = false;
    }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-300 { border-color: #d1d5db; }
.text-gray-900 { color: #111827; }
.bg-emerald-600 { background-color: #059669; }
</style>
