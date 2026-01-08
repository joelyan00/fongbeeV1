<template>
  <view class="px-4 pb-4 mt-2">
    <!-- Loading State -->
    <view v-if="loading" class="py-10 flex items-center justify-center">
      <text class="text-gray-400">加载中...</text>
    </view>

    <view v-else>
      <!-- Hot Standard Services Section -->
      <view class="mb-6">
        <view class="flex items-center justify-between mb-3">
          <view class="flex items-center gap-2">
            <view class="w-1 h-5 bg-blue-500 rounded-full"></view>
            <text class="text-base font-bold text-gray-900">热门标准服务</text>
          </view>
          <view @click="emit('viewStandard')" class="flex items-center gap-1 active-opacity-60">
            <text class="text-xs text-gray-500">更多</text>
            <text class="text-xs text-gray-500">›</text>
          </view>
        </view>

        <!-- Empty State -->
        <view v-if="hotStandardServices.length === 0" class="bg-gray-50 rounded-xl py-6 flex items-center justify-center">
          <text class="text-gray-400 text-sm">暂无热门标准服务</text>
        </view>

        <!-- Service Cards (Horizontal Scroll) -->
        <scroll-view v-else scroll-x class="whitespace-nowrap">
          <view class="flex flex-row gap-3 pb-2">
            <view 
              v-for="item in hotStandardServices" 
              :key="item.id"
              class="w-40 shrink-0 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active-scale-99"
              @click="emit('serviceClick', item)"
            >
              <view class="h-24 bg-gray-100 relative">
                <image v-if="item.images?.[0]" :src="item.images[0]" mode="aspectFill" class="w-full h-full" />
                <view v-else class="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🛠️</view>
                <view class="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-full text-xs font-bold text-gray-700">
                  {{ item.category }}
                </view>
              </view>
              <view class="p-3">
                <text class="font-bold text-sm text-gray-900 line-clamp-1 block">{{ item.title }}</text>
                <text class="text-xs text-gray-500 mt-1 line-clamp-1 block">{{ item.description }}</text>
                <text class="text-red-500 font-bold text-base mt-2 block">${{ item.price }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Hot Custom Services Section -->
      <view>
        <view class="flex items-center justify-between mb-3">
          <view class="flex items-center gap-2">
            <view class="w-1 h-5 bg-orange-500 rounded-full"></view>
            <text class="text-base font-bold text-gray-900">热门定制服务</text>
          </view>
          <view @click="emit('viewCustom')" class="flex items-center gap-1 active-opacity-60">
            <text class="text-xs text-gray-500">更多</text>
            <text class="text-xs text-gray-500">›</text>
          </view>
        </view>

        <!-- Empty State -->
        <view v-if="hotCustomTemplates.length === 0" class="bg-gray-50 rounded-xl py-6 flex items-center justify-center">
          <text class="text-gray-400 text-sm">暂无热门定制服务</text>
        </view>

        <!-- Template Grid -->
        <view v-else class="grid grid-cols-2 gap-3">
          <view 
            v-for="template in hotCustomTemplates" 
            :key="template.id"
            class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center active-scale-99"
            @click="emit('templateClick', template)"
          >
            <view class="w-12 h-12 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-2">
              <text class="text-xl">📝</text>
            </view>
            <text class="font-bold text-gray-900 text-sm block line-clamp-1">{{ template.name }}</text>
            <text class="text-xs text-gray-500 mt-1 block">
              {{ template.type === 'complex' ? '复杂定制' : '快速发布' }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { servicesApi, formTemplatesApi } from '@/services/api';

const props = defineProps<{
  currentCity?: string;
}>();

const emit = defineEmits(['viewStandard', 'viewCustom', 'serviceClick', 'templateClick']);

const loading = ref(true);
const hotStandardServices = ref<any[]>([]);
const hotCustomTemplates = ref<any[]>([]);

const fetchHotServices = async () => {
  loading.value = true;
  try {
    // Fetch standard services (limited)
    const standardRes = await servicesApi.getOfferings({ city: props.currentCity || '' });
    hotStandardServices.value = (standardRes.services || []).slice(0, 8);

    // Fetch popular custom templates
    const customRes = await formTemplatesApi.getPublished();
    const popularTemplates = (customRes.templates || []).filter(
      (t: any) => t.is_popular && ['custom', 'complex'].includes(t.type)
    );
    hotCustomTemplates.value = popularTemplates.slice(0, 6);
  } catch (error) {
    console.error('Failed to fetch hot services:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => props.currentCity, () => {
  fetchHotServices();
});

onMounted(() => {
  fetchHotServices();
});
</script>

<style scoped>
.flex { display: flex; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.text-gray-900 { color: #111827; }
.text-gray-700 { color: #374151; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-gray-300 { color: #d1d5db; }
.text-red-500 { color: #ef4444; }

.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-orange-500 { background-color: #f97316; }
.bg-orange-50 { background-color: #fff7ed; }

.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }
.font-bold { font-weight: 700; }

.px-4 { padding-left: 16px; padding-right: 16px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.py-0\.5 { padding-top: 2px; padding-bottom: 2px; }
.py-6 { padding-top: 24px; padding-bottom: 24px; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.pb-2 { padding-bottom: 8px; }
.pb-4 { padding-bottom: 16px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-6 { margin-bottom: 24px; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.w-1 { width: 4px; }
.w-12 { width: 48px; }
.w-40 { width: 160px; }
.h-5 { height: 20px; }
.h-12 { height: 48px; }
.h-24 { height: 96px; }
.w-full { width: 100%; }
.h-full { height: 100%; }

.rounded-full { border-radius: 9999px; }
.rounded-xl { border-radius: 12px; }
.border { border-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.relative { position: relative; }
.absolute { position: absolute; }
.top-2 { top: 8px; }
.left-2 { left: 8px; }

.shrink-0 { flex-shrink: 0; }
.overflow-hidden { overflow: hidden; }
.whitespace-nowrap { white-space: nowrap; }

.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }

.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.block { display: block; }
.active-scale-99:active { transform: scale(0.99); }
.active-opacity-60:active { opacity: 0.6; }
</style>
