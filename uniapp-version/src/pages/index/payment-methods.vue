<template>
  <view class="min-h-screen bg-gray-50 pb-safe">
    <!-- Header -->
    <view class="header-gradient pt-safe px-4 pb-6">
      <view class="flex flex-row items-center justify-between py-3">
        <view class="w-10 h-10 flex items-center justify-center bg-white-20 rounded-full active:opacity-70" @click="handleBack">
          <AppIcon name="chevron-left" :size="24" :style="{ color: '#ffffff' }" />
        </view>
        <text class="text-white text-lg font-bold">付款方式</text>
        <view class="w-8"></view>
      </view>
    </view>

    <!-- Content -->
    <view class="px-4 mt-2">
      <!-- Apple Pay / Google Pay (Static for now) -->
      <view class="bg-white rounded-xl p-4 shadow-sm mb-4">
        <text class="text-gray-900 font-bold text-base mb-3 block">数字钱包</text>
        <view class="flex flex-col gap-3">
           <view class="flex flex-row items-center justify-between p-3 bg-gray-50 rounded-lg">
             <view class="flex flex-row items-center gap-3">
               <AppIcon name="apple" :size="24" class="text-gray-900" />
               <text class="text-gray-800 font-medium">Apple Pay</text>
             </view>
             <view class="w-5 h-5 rounded-full border-2 border-gray-300"></view>
           </view>
        </view>
      </view>

      <!-- Credit Cards -->
      <view class="bg-white rounded-xl p-4 shadow-sm mb-20">
        <text class="text-gray-900 font-bold text-base mb-3 block">银行卡</text>
        
        <!-- Loading State -->
        <view v-if="loading" class="py-10 flex items-center justify-center">
            <text class="text-gray-400">加载中...</text>
        </view>

        <!-- Empty State -->
        <view v-else-if="cards.length === 0" class="py-8 flex flex-col items-center justify-center">
             <view class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                 <AppIcon name="credit-card" :size="32" class="text-gray-300" />
             </view>
             <text class="text-gray-400 text-sm">暂无绑定的银行卡</text>
        </view>

        <!-- Card List -->
        <view v-else class="flex flex-col gap-3">
           <view 
             v-for="(card, idx) in cards" 
             :key="idx" 
             class="flex flex-row items-center justify-between p-3 rounded-lg border transition-all active:opacity-70"
             :class="card.is_default ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-gray-100'"
             @click="handleSetDefault(card.id)"
           >
             <view class="flex flex-row items-center gap-3">
               <!-- Simple Brand Logic -->
               <view class="w-10 h-6 bg-white rounded border border-gray-200 flex items-center justify-center shadow-sm">
                   <text class="text-xs font-bold text-blue-800" v-if="card.brand === 'visa'">VISA</text>
                   <text class="text-xs font-bold text-red-600" v-else-if="card.brand === 'mastercard'">MC</text>
                   <text class="text-xs font-bold text-gray-600" v-else>{{ card.brand }}</text>
               </view>
               <view class="flex flex-col">
                   <view class="flex flex-row items-center">
                       <text class="text-gray-800 font-medium">•••• {{ card.last4 }}</text>
                       <text v-if="card.is_default" class="ml-2 text-xs text-emerald-600 bg-white px-1 rounded border border-emerald-200">默认</text>
                   </view>
                   <text class="text-gray-400 text-xs">过期时间 {{ card.exp_month }}/{{ card.exp_year }}</text>
               </view>
             </view>
             
             <!-- Radio -->
             <view 
               class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
               :class="card.is_default ? 'border-emerald-500 bg-white' : 'border-gray-300'"
             >
                <view v-if="card.is_default" class="w-3 h-3 rounded-full bg-emerald-500"></view>
             </view>
           </view>
        </view>
      </view>
    </view>

    <!-- Add Button -->
    <view class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe-bottom">
      <button class="add-btn" @click="openAddModal">
        <AppIcon name="plus" :size="20" color="#ffffff" class="mr-2" />
        添加支付方式
      </button>
    </view>

    <!-- Add Card Modal (Bottom Sheet) -->
    <view v-if="showModal" class="fixed inset-0 z-50 flex items-end justify-center" @touchmove.stop.prevent="">
        <!-- Backdrop -->
        <view class="absolute inset-0 bg-black-50" @click="closeModal"></view>
        
        <!-- Modal Content -->
        <view class="relative bg-white w-full rounded-t-2xl p-6 anim-slide-up" @click.stop="">
            <view class="flex flex-row justify-between items-center mb-6">
                <text class="text-lg font-bold text-gray-900">添加银行卡</text>
                <view @click="closeModal" class="p-2">
                    <text class="text-gray-400 text-2xl">×</text>
                </view>
            </view>

            <!-- Stripe Element Container -->
            <view class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">卡片信息</label>
                <!-- This div is where Stripe injects the iframe -->
                <div id="card-element" class="p-3 border border-gray-300 rounded-lg bg-white"></div>
                <!-- Error Message -->
                <text v-if="stripeError" class="text-red-500 text-sm mt-2 block">{{ stripeError }}</text>
            </view>

            <button 
                class="save-btn" 
                :class="{'opacity-50': processing}" 
                :disabled="processing" 
                @click="handleSaveCard"
            >
                {{ processing ? '处理中...' : '保存卡片' }}
            </button>
            
            <view class="h-6"></view> <!-- Safe area spacer -->
        </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import AppIcon from '../../components/Icons.vue';
import { paymentApi } from '../../services/api';

// Stripe Variables
let stripe: any = null;
let elements: any = null;
let cardElement: any = null;
// Replace with your Publishable Key
const STRIPE_PK = 'pk_test_51She9JRAsmOrZbpaBm1TyoYwoakMuLEH7cTlFVmfTUBc1aDDTn8s0wNt42VvfkorBq9zbI72r81jgkOXVACVnXmD00XeM6o5Ix';

const cards = ref<any[]>([]);
const loading = ref(false);
const showModal = ref(false);
const processing = ref(false);
const stripeError = ref('');

const handleBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        // Fallback to home/profile if no history (e.g. refresh)
        // Since we don't know if we came from tabbar profile, switching to a known main page is safest
        uni.reLaunch({ url: '/pages/index/index' });
    }
};

const handleSetDefault = async (id: string) => {
    // Optimistic update
    cards.value = cards.value.map(c => ({ ...c, is_default: c.id === id }));
    try {
        await paymentApi.setDefaultMethod(id);
    } catch (e) {
        console.error('Set default failed', e);
        fetchCards();
    }
};

const fetchCards = async () => {
    loading.value = true;
    try {
        console.log('Fetching cards...');
        const res = await paymentApi.getMethods();
        console.log('Cards response:', res);
        cards.value = res.methods;
    } catch (e) {
        console.error('Fetch cards error:', e);
        uni.showToast({ title: '获取卡片失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    fetchCards();
    
    // Initialize Stripe
    if ((window as any).Stripe) {
        stripe = (window as any).Stripe(STRIPE_PK);
    } else {
        // Retry if script loading slightly delayed (simple hack)
        setTimeout(() => {
            if ((window as any).Stripe) stripe = (window as any).Stripe(STRIPE_PK);
        }, 1000);
    }
});

const openAddModal = async () => {
    // Check if Stripe is supported (Browser only)
    // #ifdef MP-WEIXIN
    uni.showToast({ title: '小程序暂不支持添加卡片，请在App或网页端操作', icon: 'none' });
    return;
    // #endif

    showModal.value = true;
    stripeError.value = '';
    
    // Wait for DOM to render the #card-element div
    await nextTick();
    
    // Mount Stripe Element
    if (stripe && !cardElement) {
        elements = stripe.elements();
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    '::placeholder': { color: '#aab7c4' },
                },
            },
            hidePostalCode: true,
        });
        cardElement.mount('#card-element');
    }
};

const closeModal = () => {
    showModal.value = false;
};

const handleSaveCard = async () => {
    if (!stripe || !cardElement) return;
    
    processing.value = true;
    stripeError.value = '';

    try {
        console.log('Creating setup intent...');
        const { clientSecret } = await paymentApi.createSetupIntent();
        console.log('Got client secret, conferring card setup...');
        
        const result = await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
                card: cardElement,
            }
        });

        if (result.error) {
            console.error('Stripe error:', result.error);
            stripeError.value = result.error.message;
        } else {
            console.log('Setup confirmed:', result.setupIntent);
            uni.showToast({ title: '添加成功', icon: 'success' });
            closeModal();
            cardElement.clear();
            
            // Wait 1.5s for Stripe to process webhook/attach
            setTimeout(() => {
                fetchCards();
            }, 1500);
        }

    } catch (e: any) {
        console.error('System error:', e);
        stripeError.value = e.message || '系统错误';
    } finally {
        processing.value = false;
    }
};

</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.bg-white-20 { background-color: rgba(255, 255, 255, 0.2); }
.bg-black-50 { background-color: rgba(0, 0, 0, 0.5); }
.text-white { color: #ffffff; }
.text-gray-900 { color: #111827; }
.text-gray-800 { color: #1f2937; }
.text-gray-400 { color: #9ca3af; }
.text-gray-300 { color: #d1d5db; }
.text-red-500 { color: #ef4444; }
.text-blue-800 { color: #1e40af; }
.text-red-600 { color: #dc2626; }
.text-emerald-600 { color: #059669; }

.bg-emerald-50 { background-color: #ecfdf5; }
.bg-emerald-500 { background-color: #10b981; }

.border-2 { border-width: 2px; }
.border-emerald-200 { border-color: #a7f3d0; }
.border-emerald-500 { border-color: #10b981; }

.header-gradient {
  background: linear-gradient(180deg, #047857 0%, #059669 100%);
}

.add-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #047857 0%, #059669 100%);
  color: #ffffff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn {
  width: 100%;
  height: 48px;
  background-color: #059669;
  color: #ffffff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
}

.fixed { position: fixed; }
.absolute { position: absolute; }
.relative { position: relative; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.bottom-0 { bottom: 0; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.block { display: block; }

.w-full { width: 100%; }
.w-8 { width: 32px; }
.h-8 { height: 32px; }
.w-5 { width: 20px; }
.h-5 { height: 20px; }
.w-16 { width: 64px; }
.h-16 { height: 64px; }
.h-6 { height: 24px; }
.w-10 { width: 40px; }
.w-3 { width: 12px; }
.h-3 { height: 12px; }

.rounded-full { border-radius: 9999px; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.rounded-t-2xl { border-top-left-radius: 16px; border-top-right-radius: 16px; }

.p-2 { padding: 8px; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.p-6 { padding: 24px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-6 { padding-top: 24px; padding-bottom: 24px; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }

.mt-2 { margin-top: 8px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-20 { margin-bottom: 80px; }
.-mt-4 { margin-top: -16px; }
.mr-2 { margin-right: 8px; }
.ml-2 { margin-left: 8px; }

.gap-3 { gap: 12px; }

.shadow-sm { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
.border { border-width: 1px; }
.border-t { border-top-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }
.border-gray-300 { border-color: #d1d5db; }

.text-lg { font-size: 18px; }
.text-xl { font-size: 20px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.text-base { font-size: 16px; }
.text-2xl { font-size: 24px; }

.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }

.pt-safe { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pb-safe-bottom { padding-bottom: calc(16px + env(safe-area-inset-bottom)); }

.anim-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
