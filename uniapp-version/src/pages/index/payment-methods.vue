<template>
  <view class="min-h-screen bg-gray-50 pb-safe" style="background-color: #f9fafb; min-height: 100vh;">
    <!-- Header aligned with Capsule Button -->
    <view class="header-light" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #f3f4f6;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}">
      <view class="header-row" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important;" :style="{height: navBarHeight + 'px'}">
        <view class="header-back" @click="handleBack" style="width: 40px; display: flex; align-items: center; justify-content: flex-start;" :style="{height: navBarHeight + 'px'}">
          <AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" />
        </view>
        <text class="header-title" style="font-size: 18px; font-weight: bold; color: #1f2937; position: absolute; left: 50%; transform: translateX(-50%);">付款方式</text>
        <view class="header-placeholder" style="width: 40px;"></view>
      </view>
    </view>
    
    <!-- Spacer to push content below fixed header -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px'}"></view>

    <!-- Content -->
    <view class="mt-2" style="padding: 8px 20px 0 20px; margin-top: 8px;">
      <!-- Apple Pay / Google Pay (Static for now) -->
      <view class="bg-white rounded-xl p-4 shadow-sm mb-4" style="background-color: #ffffff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6; margin-bottom: 16px;">
        <text class="text-gray-900 font-bold text-base mb-3 block" style="color: #111827; font-weight: 700; font-size: 16px; margin-bottom: 12px; display: block;">数字钱包</text>
        <view class="flex flex-col gap-3" style="display: flex; flex-direction: column; gap: 12px;">
           <view class="flex flex-row items-center justify-between p-3 bg-gray-50 rounded-lg" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
             <view class="flex flex-row items-center gap-3" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 12px;">
               <AppIcon name="apple" :size="24" class="text-gray-900" />
               <text class="text-gray-800 font-medium" style="color: #1f2937; font-weight: 500;">Apple Pay</text>
             </view>
             <view class="w-5 h-5 rounded-full border-2 border-gray-300" style="width: 20px; height: 20px; border-radius: 9999px; border-width: 2px; border-color: #d1d5db;"></view>
           </view>
        </view>
      </view>

      <!-- Credit Cards -->
      <view class="bg-white rounded-xl p-4 shadow-sm mb-20" style="background-color: #ffffff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6; margin-bottom: 80px;">
        <text class="text-gray-900 font-bold text-base mb-3 block" style="color: #111827; font-weight: 700; font-size: 16px; margin-bottom: 12px; display: block;">银行卡</text>
        
        <!-- Loading State -->
        <view v-if="loading" class="py-10 flex items-center justify-center" style="padding-top: 40px; padding-bottom: 40px; display: flex; align-items: center; justify-content: center;">
            <text class="text-gray-400" style="color: #9ca3af;">加载中...</text>
        </view>

        <!-- Empty State -->
        <view v-else-if="cards.length === 0" class="py-8 flex flex-col items-center justify-center" style="padding-top: 32px; padding-bottom: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
             <view class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3" style="width: 64px; height: 64px; background-color: #f3f4f6; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                 <AppIcon name="credit-card" :size="32" class="text-gray-300" />
             </view>
             <text class="text-gray-400 text-sm" style="color: #9ca3af; font-size: 14px;">暂无绑定的银行卡</text>
        </view>

        <!-- Card List -->
        <view v-else class="flex flex-col gap-3" style="display: flex; flex-direction: column; gap: 12px;">
           <view 
             v-for="(card, idx) in cards" 
             :key="idx" 
             class="flex flex-row items-center justify-between p-3 rounded-lg border transition-all active:opacity-70"
             :class="card.is_default ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-gray-100'"
             :style="{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', borderWidth: '1px'}"
             @click="handleSetDefault(card.id)"
           >
             <view class="flex flex-row items-center gap-3" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 12px;">
               <!-- Simple Brand Logic -->
               <view class="w-10 h-6 bg-white rounded border border-gray-200 flex items-center justify-center shadow-sm" style="width: 40px; height: 24px; background-color: #ffffff; border-radius: 6px; border-width: 1px; border-color: #e5e7eb; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
                   <text class="text-xs font-bold text-blue-800" v-if="card.brand === 'visa'" style="font-size: 12px; font-weight: 700; color: #1e40af;">VISA</text>
                   <text class="text-xs font-bold text-red-600" v-else-if="card.brand === 'mastercard'" style="font-size: 12px; font-weight: 700; color: #dc2626;">MC</text>
                   <text class="text-xs font-bold text-gray-600" v-else style="font-size: 12px; font-weight: 700; color: #4b5563;">{{ card.brand }}</text>
               </view>
               <view class="flex flex-col" style="display: flex; flex-direction: column;">
                   <view class="flex flex-row items-center" style="display: flex !important; flex-direction: row !important; align-items: center !important;">
                       <text class="text-gray-800 font-medium" style="color: #1f2937; font-weight: 500;">•••• {{ card.last4 }}</text>
                       <text v-if="card.is_default" class="ml-2 text-xs text-emerald-600 bg-white px-1 rounded border border-emerald-200" style="margin-left: 8px; font-size: 12px; color: #059669; background-color: #ffffff; padding-left: 4px; padding-right: 4px; border-radius: 4px; border-width: 1px; border-color: #a7f3d0;">默认</text>
                   </view>
                   <text class="text-gray-400 text-xs" style="color: #9ca3af; font-size: 12px;">过期时间 {{ card.exp_month }}/{{ card.exp_year }}</text>
               </view>
             </view>
             
             <view class="flex flex-row items-center gap-4" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 16px;">
                <view class="p-2 bg-red-50 rounded-lg active:bg-red-100 transition-colors" style="padding: 8px; background-color: #fef2f2; border-radius: 8px;" @click.stop="handleDeleteCard(card.id)">
                    <AppIcon name="delete" :size="18" :style="{ color: '#ef4444' }" />
                </view>
                <!-- Radio -->
                <view 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    :class="card.is_default ? 'border-emerald-500 bg-white' : 'border-gray-300'"
                    style="width: 20px; height: 20px; border-radius: 9999px; border-width: 2px; display: flex; align-items: center; justify-content: center;"
                >
                    <view v-if="card.is_default" class="w-3 h-3 rounded-full bg-emerald-500" style="width: 12px; height: 12px; border-radius: 9999px; background-color: #10b981;"></view>
                </view>
             </view>
           </view>
        </view>
      </view>
    </view>

    <!-- Add Button -->
    <view class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe-bottom" style="position: fixed; bottom: 0; left: 0; right: 0; padding: 16px; background-color: #ffffff; border-top-width: 1px; border-color: #f3f4f6;">
      <button class="add-btn" @click="openAddModal" style="width: 100%; height: 48px; background: linear-gradient(90deg, #047857 0%, #059669 100%); color: #ffffff; border-radius: 12px; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center;">
        <AppIcon name="plus" :size="20" color="#ffffff" class="mr-2" />
        添加支付方式
      </button>
    </view>

    <!-- Add Card Modal (Bottom Sheet) -->
    <view v-if="showModal" class="fixed inset-0 z-50 flex items-end justify-center" style="position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 50; display: flex; align-items: flex-end; justify-content: center;" @touchmove.stop.prevent="">
        <!-- Backdrop -->
        <view class="absolute inset-0 bg-black-50" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-color: rgba(0, 0, 0, 0.5);" @click="closeModal"></view>
        
        <!-- Modal Content -->
        <view class="relative bg-white w-full rounded-t-2xl p-6 anim-slide-up" style="position: relative; background-color: #ffffff; width: 100%; border-top-left-radius: 16px; border-top-right-radius: 16px; padding: 24px;" @click.stop="">
            <view class="flex flex-row justify-between items-center mb-6" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 24px;">
                <text class="text-lg font-bold text-gray-900" style="font-size: 18px; font-weight: 700; color: #111827;">添加银行卡</text>
                <view @click="closeModal" class="p-2" style="padding: 8px;">
                    <text class="text-gray-400 text-2xl" style="color: #9ca3af; font-size: 24px;">×</text>
                </view>
            </view>

            <!-- Stripe Element Container -->
            <view class="mb-6" style="margin-bottom: 24px;">
                <label class="block text-sm font-medium text-gray-700 mb-2" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">卡片信息</label>
                <!-- This div is where Stripe injects the iframe -->
                <div id="card-element" class="p-3 border border-gray-300 rounded-lg bg-white" style="padding: 12px; border-width: 1px; border-color: #d1d5db; border-radius: 8px; background-color: #ffffff;"></div>
                <!-- Error Message -->
                <text v-if="stripeError" class="text-red-500 text-sm mt-2 block" style="color: #ef4444; font-size: 14px; margin-top: 8px; display: block;">{{ stripeError }}</text>
            </view>

            <button 
                class="save-btn" 
                :class="{'opacity-50': processing}" 
                :disabled="processing" 
                @click="handleSaveCard"
                style="width: 100%; height: 48px; background-color: #059669; color: #ffffff; border-radius: 12px; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center; margin-top: 16px;"
            >
                {{ processing ? '处理中...' : '保存卡片' }}
            </button>
            
            <view class="h-6" style="height: 24px;"></view> <!-- Safe area spacer -->
        </view>
    </view>

    <!-- Custom Modal for Card Deletion -->
    <view v-if="cardToDelete" class="custom-modal-mask" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 30px;" @touchmove.stop.prevent="">
        <view class="custom-modal-dialog anim-scale-in" style="background-color: #ffffff; width: 100%; max-width: 320px; border-radius: 28px; padding: 40px 24px 24px; display: flex; flex-direction: column; align-items: center;">
            <view class="modal-icon-header" style="width: 64px; height: 64px; background-color: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                <AppIcon name="delete" :size="32" color="#ef4444" />
            </view>
            <view class="modal-text-content" style="display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; text-align: center;">
                <text class="modal-main-title" style="font-size: 20px; font-weight: 800; color: #111827; margin-bottom: 8px;">移除付款方式</text>
                <text class="modal-sub-desc" style="font-size: 14px; color: #6b7280; line-height: 1.6;">确定要从您的账户中移除这张银行卡吗？此操作无法撤销。</text>
            </view>
            <view class="modal-action-footer" style="display: flex !important; flex-direction: row !important; width: 100%; gap: 12px;">
                <view class="modal-action-btn cancel-btn" @click="cardToDelete = null" style="flex: 1; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background-color: #f3f4f6;">
                    <text class="btn-label-dark" style="color: #4b5563; font-size: 15px; font-weight: 700;">取消</text>
                </view>
                <view class="modal-action-btn delete-btn" @click="confirmDeleteCard" style="flex: 1; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background-color: #ef4444;">
                    <text class="btn-label-light" style="color: #ffffff; font-size: 15px; font-weight: 700;">确认移除</text>
                </view>
            </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import AppIcon from '../../components/Icons.vue';
import { paymentApi } from '../../services/api';

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

// Stripe Variables
let stripe: any = null;
let elements: any = null;
let cardElement: any = null;
// Replace with your Publishable Key
const STRIPE_PK = 'pk_test_51She9JRAsmOrZbpaBm1TyoYwoakMuLEH7cTlFVmfTUBc1aDDTn8s0wNt42VvfkorBq9zbI72r81jgkOXVACVnXmD00XeM6o5Ix';

const cards = ref<any[]>([]);
const cardToDelete = ref<string | null>(null);
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

const handleDeleteCard = (id: string) => {
    cardToDelete.value = id;
};

const confirmDeleteCard = async () => {
    if (!cardToDelete.value) return;
    const id = cardToDelete.value;
    cardToDelete.value = null;

    uni.showLoading({ title: '正在移除...' });
    try {
        await paymentApi.deleteMethod(id);
        uni.showToast({ title: '已移除', icon: 'success' });
        fetchCards();
    } catch (e: any) {
        uni.showToast({ title: e.message || '移除失败', icon: 'none' });
    } finally {
        uni.hideLoading();
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
    // Initialize capsule metrics
    // #ifdef MP-WEIXIN
    const menuBtn = uni.getMenuButtonBoundingClientRect();
    const sysInfo = uni.getSystemInfoSync();
    statusBarHeight.value = sysInfo.statusBarHeight || 44;
    navBarHeight.value = (menuBtn.top - (sysInfo.statusBarHeight || 0)) * 2 + menuBtn.height;
    capsuleWidth.value = sysInfo.windowWidth - menuBtn.left + 10;
    // #endif
    // #ifndef MP-WEIXIN
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 44;
    navBarHeight.value = 44;
    capsuleWidth.value = 0;
    // #endif

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
    // #ifdef MP-WEIXIN
    // Redirect to H5 WebView for Stripe
    const h5Url = import.meta.env.VITE_H5_URL || 'https://m.youfujia.ca'; // Replace with real domain
    const targetUrl = `${h5Url}/#/pages/payment/stripe-add-card?token=${encodeURIComponent(uni.getStorageSync('token'))}`;
    
    uni.navigateTo({
        url: `/pages/common/webview?url=${encodeURIComponent(targetUrl)}`
    });
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

.header-light { background: #ffffff; border-bottom: 1px solid #f3f4f6; padding-left: 16px; padding-right: 16px; }
.header-row { display: flex; flex-direction: row; align-items: center; justify-content: space-between; height: 56px; }
.header-back { width: 40px; height: 56px; display: flex; align-items: center; justify-content: flex-start; margin-left: 6px; }
.header-title { font-size: 18px; font-weight: bold; color: #1f2937; line-height: 56px; }
.header-placeholder { width: 40px; }

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
.py-3 { padding-top: 12px; padding-bottom: 16px; }
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

.leading-relaxed { line-height: 1.625; }
.text-center { text-align: center; }
.z-100 { z-index: 1000; }

.pt-safe { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pb-safe-bottom { padding-bottom: calc(16px + env(safe-area-inset-bottom)); }

.anim-scale-in {
  animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.custom-modal-mask {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
}

.custom-modal-dialog {
    background-color: #ffffff;
    width: 100%;
    max-width: 320px;
    border-radius: 28px;
    padding: 40px 24px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.modal-icon-header {
    width: 64px;
    height: 64px;
    background-color: #fef2f2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
}

.modal-text-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
    text-align: center;
}

.modal-main-title {
    font-size: 20px;
    font-weight: 800;
    color: #111827;
    margin-bottom: 8px;
}

.modal-sub-desc {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
}

.modal-action-footer {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 12px;
}

.modal-action-btn {
    flex: 1;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cancel-btn {
    background-color: #f3f4f6;
}

.delete-btn {
    background-color: #ef4444;
}

.btn-label-dark {
    color: #4b5563;
    font-size: 15px;
    font-weight: 700;
}

.btn-label-light {
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
}

.transition-colors { transition-property: background-color; transition-duration: 0.2s; }
</style>
