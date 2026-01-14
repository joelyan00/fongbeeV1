<template>
  <view class="min-h-screen bg-gray-50 pb-safe">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <view @click="emit('back')" class="mr-3 p-1 active-bg-gray-100 rounded-full">
        <AppIcon name="chevron-left" :size="24" class="text-gray-800"/>
      </view>
      <text class="text-lg font-bold text-gray-900">确认订单</text>
    </view>

    <!-- Main Content -->
    <view v-if="step === 'confirm'" class="pt-4">
      <!-- Service Info Card -->
      <view class="mx-4 bg-white rounded-2xl shadow-sm p-5 mb-4">
        <view class="flex flex-row justify-between items-start mb-4">
            <view class="flex-1 mr-3">
                <text class="text-xs text-gray-400 mb-1 block">服务项目</text>
                <text class="text-lg font-bold text-gray-900 leading-tight">{{ service.title }}</text>
            </view>
            <view class="text-right">
                <text class="text-xl font-bold text-gray-900">${{ service.price }}</text>
                <text class="text-xs text-gray-500 block">/{{ service.unit || '次' }}</text>
            </view>
        </view>

        <view class="space-y-3 pt-3 border-t border-gray-50">
            <view class="flex flex-row justify-between items-center text-sm">
                <text class="text-gray-500">服务商</text>
                <text class="text-gray-900 font-medium">{{ service.provider?.name || '专业服务商' }}</text>
            </view>
            <view class="flex flex-row justify-between items-center text-sm">
                <text class="text-gray-500">定金比例</text>
                <text class="text-gray-900 font-medium">{{ depositRate }}%</text>
            </view>
        </view>
      </view>

      <!-- Deposit Breakdown Card -->
      <view class="mx-4 bg-emerald-50 rounded-2xl border border-emerald-100 p-5 mb-4">
        <view class="flex flex-row justify-between items-center">
            <view>
                <text class="text-emerald-800 font-bold text-base block">需支付定金</text>
                <text class="text-emerald-600 text-xs mt-0.5">支付定金后订单生效</text>
            </view>
            <text class="text-2xl font-bold text-emerald-700">${{ depositAmount.toFixed(2) }}</text>
        </view>
      </view>

      <!-- Regret Period Notice -->
      <view class="mx-4 bg-blue-50 rounded-2xl border border-blue-100 p-4 mb-4">
        <view class="flex flex-row items-start gap-3">
            <AppIcon name="clock" :size="20" class="text-blue-600 shrink-0 mt-0.5" />
            <view>
                <text class="text-blue-900 font-bold text-sm block">反悔期保障</text>
                <text class="text-blue-700 text-xs mt-1 leading-relaxed">
                    支付后 <text class="font-bold">24 小时</text> 内可免费取消订单，定金将全额原路退还。超过反悔期后取消，定金将不予退还。
                </text>
            </view>
        </view>
      </view>

      <!-- Payment Method -->
      <view class="mx-4 bg-white rounded-2xl shadow-sm p-4 mb-4">
        <view class="flex flex-row items-center gap-2 mb-4">
            <AppIcon name="credit-card" :size="20" class="text-gray-600" />
            <text class="text-gray-900 font-bold text-sm">付款方式</text>
        </view>

        <view v-if="paymentMethods.length > 0">
            <view 
                v-for="method in paymentMethods" 
                :key="method.id"
                class="flex flex-row items-center justify-between p-3 rounded-xl border mb-2 transition-all"
                :class="selectedMethod === method.id ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-gray-100'"
                @click="selectedMethod = method.id"
            >
                <view class="flex flex-row items-center gap-3">
                    <text class="text-xl">💳</text>
                    <text class="text-gray-800 font-medium">•••• {{ method.card?.last4 }}</text>
                </view>
                <view 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    :class="selectedMethod === method.id ? 'border-emerald-500 bg-white' : 'border-gray-300'"
                >
                    <view v-if="selectedMethod === method.id" class="w-3 h-3 rounded-full bg-emerald-500"></view>
                </view>
            </view>
        </view>

        <view v-else class="py-4 text-center">
            <text class="text-gray-500 text-sm mb-2 block">尚未绑定付款方式</text>
            <view @click="navigateToPaymentMethods" class="text-emerald-600 font-bold text-sm">
                去添加支付方式 →
            </view>
        </view>
      </view>

      <!-- Security Notice -->
      <view class="mx-4 flex flex-row items-center justify-center gap-1.5 opacity-60 mb-8">
        <AppIcon name="shield" :size="14" class="text-gray-500" />
        <text class="text-xxs text-gray-500">支付由 Stripe 加密处理 · 优服佳不存储您的卡片信息</text>
      </view>
    </view>

    <!-- Success Step -->
    <view v-else-if="step === 'success'" class="flex-1 flex flex-col items-center justify-center py-20 px-10">
        <view class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <AppIcon name="check" :size="40" class="text-emerald-600" />
        </view>
        <text class="text-xl font-bold text-gray-900 mb-2">订单提交成功</text>
        <text class="text-gray-500 text-center text-sm mb-10">您的订单已创建，服务商将尽快与您联系。您可以在“我的订单”中查看详情。</text>
        
        <button 
            @click="emit('success', createdOrder)"
            class="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg"
        >
            返回查看订单
        </button>
    </view>

    <!-- Error Step -->
    <view v-else-if="step === 'error'" class="flex-1 flex flex-col items-center justify-center py-20 px-10">
        <view class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AppIcon name="alert-circle" :size="40" class="text-red-600" />
        </view>
        <text class="text-xl font-bold text-gray-900 mb-2">下单失败</text>
        <text class="text-gray-500 text-center text-sm mb-10">{{ errorMessage || '系统繁忙，请稍后再试' }}</text>
        
        <button 
            @click="step = 'confirm'"
            class="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-lg"
        >
            返回并重试
        </button>
    </view>

    <!-- Footer Action -->
    <view v-if="step === 'confirm'" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe-bottom">
        <button 
            @click="handleConfirm"
            :disabled="loading || !selectedMethod"
            class="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:shadow-none"
        >
            <view class="flex flex-row items-center justify-center gap-2">
                <text v-if="loading">正在处理...</text>
                <text v-else>确认支付定金 ${{ depositAmount.toFixed(2) }}</text>
            </view>
        </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from './Icons.vue';
import { ordersV2Api, paymentApi } from '@/services/api';

const props = defineProps<{
  service: any;
}>();

const emit = defineEmits(['back', 'success']);

const step = ref<'confirm' | 'processing' | 'success' | 'error'>('confirm');
const loading = ref(false);
const errorMessage = ref('');
const createdOrder = ref<any>(null);

const paymentMethods = ref<any[]>([]);
const selectedMethod = ref<string>('');

const depositRate = computed(() => {
    return props.service.deposit_ratio || props.service.depositRatio || 20;
});

const depositAmount = computed(() => {
    let priceVal = props.service.price;
    if (typeof priceVal === 'string') {
        priceVal = priceVal.replace('$', '').replace(/,/g, '');
    }
    const finalPrice = Number(priceVal) || 0;
    return (finalPrice * depositRate.value / 100);
});

const fetchPaymentMethods = async () => {
    try {
        const res = await paymentApi.getMethods();
        paymentMethods.value = res.methods || [];
        const defaultMethod = res.methods?.find((m: any) => m.is_default);
        if (defaultMethod) {
            selectedMethod.value = defaultMethod.id;
        } else if (res.methods?.length > 0) {
            selectedMethod.value = res.methods[0].id;
        }
    } catch (e) {
        console.error('Failed to fetch payment methods:', e);
    }
};

const handleConfirm = async () => {
    if (loading.value || !selectedMethod.value) return;

    loading.value = true;
    try {
        // Prepare price (clean string)
        let priceVal = props.service.price;
        if (typeof priceVal === 'string') {
            priceVal = priceVal.replace('$', '').replace(/,/g, '');
        }
        const finalPrice = Number(priceVal);

        const orderData = {
            serviceType: 'standard',
            serviceListingId: props.service.id,
            providerId: props.service.provider?.id || props.service.provider_id || props.service.user_id,
            totalAmount: finalPrice,
            depositRate: depositRate.value,
            currency: 'CAD',
            idempotencyKey: `order_${props.service.id}_${Date.now()}`
        };

        const res = await ordersV2Api.create(orderData);
        if (res.success && res.order) {
            createdOrder.value = res.order;
            step.value = 'success';
        } else {
            throw new Error(res.message || '下单失败');
        }
    } catch (e: any) {
        console.error('Create order error:', e);
        errorMessage.value = e.message || '系统繁忙，请稍后再试';
        step.value = 'error';
    } finally {
        loading.value = false;
    }
};

const navigateToPaymentMethods = () => {
    // This is tricky if we want to stay in the component flow.
    // However, in our index.vue, we can't easily navigate to a page and come back.
    // For now, let's just use uni.showToast or similar if we are in index.vue overlay mode.
    // Or, emit an event to index.vue to switch to payment_methods view state if it exists.
    uni.showModal({
        title: '温馨提示',
        content: '即将跳转到付款方式管理，由于您处于预览模式，可能需要重新进入此页面下单。',
        success: (res) => {
            if (res.confirm) {
                // Since payment-methods is a page in pages.json, we can navigate to it
                uni.navigateTo({ url: '/pages/index/payment-methods' });
            }
        }
    });
};

onMounted(() => {
    fetchPaymentMethods();
});
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pb-safe-bottom { padding-bottom: calc(16px + env(safe-area-inset-bottom)); }

.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.bg-emerald-50 { background-color: #ecfdf5; }
.bg-emerald-100 { background-color: #d1fae5; }
.bg-emerald-600 { background-color: #059669; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-blue-100 { background-color: #dbeafe; }
.bg-red-100 { background-color: #fee2e2; }
.bg-gray-900 { background-color: #111827; }

.text-gray-900 { color: #111827; }
.text-gray-800 { color: #1f2937; }
.text-gray-700 { color: #374151; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-emerald-600 { color: #059669; }
.text-emerald-700 { color: #047857; }
.text-emerald-800 { color: #065f46; }
.text-blue-600 { color: #2563eb; }
.text-blue-700 { color: #1d4ed8; }
.text-blue-900 { color: #1e3a8a; }
.text-red-600 { color: #dc2626; }
.text-white { color: #ffffff; }

.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }

.text-xxs { font-size: 10px; }
.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-base { font-size: 16px; }
.text-lg { font-size: 18px; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }

.p-1 { padding: 4px; }
.p-2 { padding: 8px; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.p-5 { padding: 20px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.px-10 { padding-left: 40px; padding-right: 40px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-3.5 { padding-top: 14px; padding-bottom: 14px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.py-20 { padding-top: 80px; padding-bottom: 80px; }

.mx-4 { margin-left: 16px; margin-right: 16px; }
.mr-2 { margin-right: 8px; }
.mr-3 { margin-right: 12px; }
.mt-0.5 { margin-top: 2px; }
.mt-1 { margin-top: 4px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-8 { margin-bottom: 32px; }
.mb-10 { margin-bottom: 40px; }

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.shrink-0 { flex-shrink: 0; }
.flex-1 { flex: 1; }
.leading-tight { line-height: 1.25; }
.leading-relaxed { line-height: 1.625; }

.rounded-full { border-radius: 9999px; }
.rounded-xl { border-radius: 12px; }
.rounded-2xl { border-radius: 16px; }

.border { border-width: 1px; }
.border-2 { border-width: 2px; }
.border-b { border-bottom-width: 1px; }
.border-t { border-top-width: 1px; }
.border-gray-50 { border-color: #f9fafb; }
.border-gray-100 { border-color: #f3f4f6; }
.border-emerald-100 { border-color: #d1fae5; }
.border-emerald-500 { border-color: #10b981; }
.border-blue-100 { border-color: #dbeafe; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }

.sticky { position: sticky; }
.fixed { position: fixed; }
.top-0 { top: 0; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }
.z-20 { z-index: 20; }

.active-bg-gray-100:active { background-color: #f3f4f6; }
</style>
