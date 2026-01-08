<template>
  <view class="min-h-screen bg-gray-50 pt-custom pb-28">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <view @click="emit('back')" class="mr-3 p-1 active-bg-gray-100 rounded-full">
        <AppIcon name="chevron-left" :size="24" class="text-gray-800"/>
      </view>
      <text class="text-lg font-bold text-gray-900">服务详情</text>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="flex items-center justify-center py-20">
      <text class="text-gray-400">加载中...</text>
    </view>

    <!-- Not Found -->
    <view v-else-if="!service" class="flex flex-col items-center justify-center py-20">
      <text class="text-gray-400 text-lg mb-4">服务不存在或已下架</text>
      <button @click="emit('back')" class="text-emerald-600 underline">返回</button>
    </view>

    <!-- Main Content -->
    <view v-else>
      <!-- Image Carousel -->
      <view class="w-full h-56 bg-gray-200 relative">
        <swiper 
          class="w-full h-full" 
          :indicator-dots="images.length > 1"
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#ffffff"
          :autoplay="false"
          @change="onImageChange"
        >
          <swiper-item v-for="(img, idx) in images" :key="idx">
            <image :src="img" mode="aspectFill" class="w-full h-full" />
          </swiper-item>
        </swiper>
        <!-- Image Counter -->
        <view v-if="images.length > 1" class="absolute bottom-3 right-3 bg-black/50 px-2 py-1 rounded-full">
          <text class="text-white text-xs">{{ currentImageIndex + 1 }}/{{ images.length }}</text>
        </view>
        <!-- Placeholder if no images -->
        <view v-if="images.length === 0" class="w-full h-full flex items-center justify-center text-gray-400">
          <text class="text-4xl">📷</text>
        </view>
      </view>

      <!-- Service Info Card -->
      <view class="mx-4 -mt-4 bg-white rounded-xl shadow-md p-4 relative z-10">
        <view class="flex flex-row justify-between items-start mb-3">
          <view class="flex-1 mr-3">
            <view class="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full mb-2">
              {{ service.category || '标准服务' }}
            </view>
            <text class="text-xl font-bold text-gray-900 block leading-tight">{{ service.title }}</text>
          </view>
          <view class="text-right shrink-0">
            <text class="text-2xl font-bold text-red-500">${{ service.price }}</text>
            <text class="text-xs text-gray-500 block">/{{ service.unit || '次' }}</text>
          </view>
        </view>

        <text v-if="service.description" class="text-gray-600 text-sm leading-relaxed block">
          {{ service.description }}
        </text>
      </view>

      <!-- Provider Card -->
      <view class="mx-4 mt-4 bg-white rounded-xl shadow-sm p-4">
        <view class="flex flex-row items-center">
          <view class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
            <image v-if="service.provider?.avatar" :src="service.provider.avatar" class="w-full h-full rounded-full" />
            <AppIcon v-else name="user" :size="24" class="text-emerald-600" />
          </view>
          <view class="flex-1">
            <text class="font-bold text-gray-900 block">{{ service.provider?.name || '服务商' }}</text>
            <view class="flex flex-row items-center gap-2 mt-1">
              <AppIcon name="star" :size="12" class="text-amber-400" />
              <text class="text-xs text-gray-500">5.0 · 已服务 100+ 次</text>
            </view>
          </view>
          <button 
            @click="handleContact"
            class="px-3 py-2 border border-emerald-500 text-emerald-600 rounded-lg text-sm font-medium"
          >
            联系
          </button>
        </view>
      </view>

      <!-- Service Details -->
      <view class="mx-4 mt-4 bg-white rounded-xl shadow-sm p-4">
        <text class="font-bold text-gray-900 mb-3 block">服务信息</text>
        <view class="space-y-2">
          <view v-if="service.serviceMode" class="flex flex-row justify-between py-2 border-b border-gray-50">
            <text class="text-gray-500 text-sm">服务方式</text>
            <text class="text-gray-900 text-sm font-medium">{{ getServiceModeLabel(service.serviceMode) }}</text>
          </view>
          <view v-if="service.depositRatio != null" class="flex flex-row justify-between py-2 border-b border-gray-50">
            <text class="text-gray-500 text-sm">定金比例</text>
            <text class="text-gray-900 text-sm font-medium">{{ service.depositRatio }}%</text>
          </view>
          <view v-if="service.advanceBooking" class="flex flex-row justify-between py-2 border-b border-gray-50">
            <text class="text-gray-500 text-sm">需提前预约</text>
            <text class="text-gray-900 text-sm font-medium">{{ service.advanceBooking }} 小时</text>
          </view>
          <view v-if="service.cancellationPolicy" class="flex flex-row justify-between py-2">
            <text class="text-gray-500 text-sm">取消政策</text>
            <text class="text-gray-900 text-sm font-medium">{{ getCancellationLabel(service.cancellationPolicy) }}</text>
          </view>
        </view>
      </view>

      <!-- Inclusions -->
      <view v-if="service.inclusions" class="mx-4 mt-4 bg-white rounded-xl shadow-sm p-4">
        <text class="font-bold text-emerald-700 mb-2 block">✓ 服务包含</text>
        <text class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{{ service.inclusions }}</text>
      </view>

      <!-- Exclusions -->
      <view v-if="service.exclusions" class="mx-4 mt-4 bg-white rounded-xl shadow-sm p-4">
        <text class="font-bold text-red-600 mb-2 block">✗ 不包含</text>
        <text class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{{ service.exclusions }}</text>
      </view>

      <!-- Extra Fees -->
      <view v-if="service.extraFees" class="mx-4 mt-4 bg-white rounded-xl shadow-sm p-4">
        <text class="font-bold text-orange-600 mb-2 block">💰 额外费用说明</text>
        <text class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{{ service.extraFees }}</text>
      </view>

      <!-- Client Requirements -->
      <view v-if="service.clientRequirements" class="mx-4 mt-4 bg-amber-50 rounded-xl border border-amber-200 p-4">
        <text class="font-bold text-amber-700 mb-2 block">📋 客户准备事项</text>
        <text class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{{ service.clientRequirements }}</text>
      </view>

      <!-- Add-ons -->
      <view v-if="service.addOns && service.addOns.length > 0" class="mx-4 mt-4 bg-white rounded-xl shadow-sm p-4 mb-4">
        <text class="font-bold text-gray-900 mb-3 block">🎁 附加服务</text>
        <view v-for="(addon, idx) in service.addOns" :key="idx" class="flex flex-row justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
          <view>
            <text class="font-medium text-gray-900 block">{{ addon.name }}</text>
            <text v-if="addon.description" class="text-xs text-gray-500 mt-1 block">{{ addon.description }}</text>
          </view>
          <text class="text-emerald-600 font-bold">+${{ addon.price }}</text>
        </view>
      </view>
    </view>

    <!-- Fixed Bottom Action Bar -->
    <view v-if="service" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 pb-safe">
      <view class="flex flex-row items-center gap-3">
        <button 
          @click="handleContact"
          class="flex flex-col items-center justify-center px-4 py-2"
        >
          <AppIcon name="message-circle" :size="22" class="text-gray-500" />
          <text class="text-xs text-gray-500 mt-1">联系</text>
        </button>
        <button 
          @click="handleOrder"
          class="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg"
        >
          直接下单
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import AppIcon from './Icons.vue';
import { servicesApi } from '@/services/api';

const props = defineProps<{
  serviceId: string;
  serviceData?: any; // Optional pre-loaded data
}>();

const emit = defineEmits(['back', 'order', 'contact']);

const loading = ref(true);
const service = ref<any>(null);
const currentImageIndex = ref(0);

const images = computed(() => {
  if (!service.value) return [];
  if (service.value.images && Array.isArray(service.value.images)) return service.value.images;
  if (service.value.image) return [service.value.image];
  return [];
});

const loadService = async () => {
  // Use pre-loaded data if available
  if (props.serviceData) {
    service.value = props.serviceData;
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const res = await servicesApi.getOfferingById(props.serviceId);
    service.value = res.service || null;
  } catch (error) {
    console.error('Failed to load service:', error);
    service.value = null;
  } finally {
    loading.value = false;
  }
};

const onImageChange = (e: any) => {
  currentImageIndex.value = e.detail.current;
};

const getServiceModeLabel = (mode: string) => {
  const map: Record<string, string> = { offline: '上门服务', remote: '远程服务', store: '到店服务' };
  return map[mode] || mode;
};

const getCancellationLabel = (policy: string) => {
  const map: Record<string, string> = { flexible: '灵活取消', moderate: '中等限制', strict: '严格' };
  return map[policy] || policy;
};

const handleContact = () => {
  emit('contact', service.value);
  uni.showToast({ title: '消息功能开发中', icon: 'none' });
};

const handleOrder = () => {
  emit('order', service.value);
};

watch(() => props.serviceId, () => {
  if (props.serviceId) {
    loadService();
  }
});

onMounted(() => {
  if (props.serviceId) {
    loadService();
  }
});
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }

.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.text-gray-900 { color: #111827; }
.text-gray-800 { color: #1f2937; }
.text-gray-700 { color: #374151; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-red-500 { color: #ef4444; }
.text-red-600 { color: #dc2626; }
.text-white { color: #ffffff; }
.text-emerald-600 { color: #059669; }
.text-emerald-700 { color: #047857; }
.text-amber-400 { color: #fbbf24; }
.text-amber-700 { color: #b45309; }
.text-orange-600 { color: #ea580c; }

.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-emerald-50 { background-color: #ecfdf5; }
.bg-emerald-100 { background-color: #d1fae5; }
.bg-emerald-600 { background-color: #059669; }
.bg-amber-50 { background-color: #fffbeb; }

.text-2xl { font-size: 24px; }
.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.text-4xl { font-size: 36px; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }

.px-2 { padding-left: 8px; padding-right: 8px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-0\.5 { padding-top: 2px; padding-bottom: 2px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-3\.5 { padding-top: 14px; padding-bottom: 14px; }
.py-20 { padding-top: 80px; padding-bottom: 80px; }
.p-1 { padding: 4px; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.pb-28 { padding-bottom: 112px; }

.mx-4 { margin-left: 16px; margin-right: 16px; }
.-mt-4 { margin-top: -16px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mr-3 { margin-right: 12px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.w-full { width: 100%; }
.h-full { height: 100%; }
.w-12 { width: 48px; }
.h-12 { height: 48px; }
.h-56 { height: 224px; }
.flex-1 { flex: 1; }
.shrink-0 { flex-shrink: 0; }

.rounded-full { border-radius: 9999px; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.border { border-width: 1px; }
.border-t { border-top-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-gray-50 { border-color: #f9fafb; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }
.border-amber-200 { border-color: #fde68a; }
.border-emerald-500 { border-color: #10b981; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }

.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }
.top-0 { top: 0; }
.bottom-0 { bottom: 0; }
.bottom-3 { bottom: 12px; }
.left-0 { left: 0; }
.right-0 { right: 0; }
.right-3 { right: 12px; }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-50 { z-index: 50; }

.inline-block { display: inline-block; }
.block { display: block; }
.space-y-2 > :not(:first-child) { margin-top: 8px; }
.leading-tight { line-height: 1.25; }
.leading-relaxed { line-height: 1.625; }
.whitespace-pre-wrap { white-space: pre-wrap; }
.underline { text-decoration: underline; }

.active-bg-gray-100:active { background-color: #f3f4f6; }
</style>
