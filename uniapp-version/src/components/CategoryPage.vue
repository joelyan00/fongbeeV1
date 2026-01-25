<template>
  <view class="min-h-screen bg-standard-gray pt-custom flex flex-col">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <view class="flex flex-row items-center flex-1">
        <view @click="emit('back')" class="mr-3 p-1 active-bg-gray-100 rounded-full">
            <AppIcon name="chevron-left" :size="24" class="text-gray-800"/>
        </view>
        <view class="flex-1">
            <text class="text-lg font-bold text-gray-900">{{ categoryName }}</text>
            <text v-if="currentCity" class="text-xs text-gray-500 ml-2">· {{ currentCity }}</text>
        </view>
      </view>
    </view>

    <!-- Content Area -->
    <scroll-view scroll-y class="flex-1 h-full px-4 py-4 w-full box-border">
      
      <!-- Loading State -->
      <view v-if="loading" class="flex items-center justify-center py-20">
        <text class="text-gray-400">加载中...</text>
      </view>

      <view v-else class="pb-24">
        <!-- Standard Services Section -->
        <view class="mb-8" v-if="mode === 'all' || mode === 'standard'">
          <view class="flex flex-row items-center gap-2 mb-4">
            <view class="w-1 h-4 bg-blue-500 rounded-full"></view>
            <text class="text-base font-bold text-gray-900">标准服务</text>
            <text class="text-xs text-gray-400 ml-1">({{ standardServices.length }} 个)</text>
          </view>
          
          <!-- Empty State -->
          <view v-if="standardServices.length === 0" class="bg-gray-50 rounded-xl py-8 flex items-center justify-center">
            <text class="text-gray-400 text-sm">该分类暂无标准服务</text>
          </view>

          <!-- Service List -->
          <view v-else class="flex flex-col gap-3">
            <view 
              v-for="item in standardServices" 
              :key="item.id" 
              class="bg-white rounded-xl overflow-hidden shadow-sm flex flex-row active-scale-99 transition-transform"
              @click="handleStandardServiceClick(item)"
            >
               <!-- Image -->
               <view class="w-28 h-24 bg-gray-200 shrink-0 relative">
                  <image v-if="item.images?.[0]" :src="item.images[0]" mode="aspectFill" class="w-full h-full" />
                  <view v-else class="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🛠️</view>
               </view>
               
               <!-- Info -->
               <view class="p-3 flex flex-col flex-1 justify-between">
                  <view>
                      <text class="text-sm font-bold text-gray-900 line-clamp-1 block">{{ item.title }}</text>
                      <text class="text-xs text-gray-500 mt-1 line-clamp-1 block">{{ item.description }}</text>
                      
                      <!-- Rating -->
                      <view class="flex flex-row items-center mt-1">
                         <AppIcon name="star" :size="12" class="text-amber-500 mr-1"/>
                         <text class="text-xs text-amber-500 font-bold">{{ item.rating || '5.0' }}</text>
                      </view>
                  </view>
                  
                  <view class="flex flex-row items-center justify-between">
                     <text class="text-red-500 font-bold text-base">${{ item.price }}</text>
                     <view class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-xs font-bold">
                        立即预约
                     </view>
                  </view>
               </view>
            </view>
          </view>
        </view>

        <!-- Custom Services Section -->
        <view v-if="mode === 'all' || mode === 'custom'">
          <view class="flex flex-row items-center gap-2 mb-4">
            <view class="w-1 h-4 bg-orange-500 rounded-full"></view>
            <text class="text-base font-bold text-gray-900">定制服务</text>
            <text class="text-xs text-gray-400 ml-1">({{ customTemplates.length }} 个)</text>
          </view>
          
          <!-- Empty State -->
          <view v-if="customTemplates.length === 0" class="bg-gray-50 rounded-xl py-8 flex items-center justify-center">
            <text class="text-gray-400 text-sm">该分类暂无定制服务模板</text>
          </view>

          <!-- Template Grid -->
          <view v-else class="grid grid-cols-2 gap-3">
            <view 
              v-for="template in customTemplates" 
              :key="template.id"
              class="bg-white p-4 rounded-xl shadow-sm text-center active-scale-99"
              @click="handleCustomTemplateClick(template)"
            >
              <view class="w-12 h-12 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-3">
                <text class="text-2xl">📝</text>
              </view>
              <text class="font-bold text-gray-900 text-sm block line-clamp-1">{{ template.name }}</text>
              <text class="text-xs text-gray-500 mt-1 block">
                {{ template.type === 'complex' ? '复杂定制' : '快速发布' }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import AppIcon from './Icons.vue';
import { servicesApi, formTemplatesApi } from '@/services/api';

const props = withDefaults(defineProps<{
  categoryName: string;
  currentCity?: string;
  mode?: 'all' | 'standard' | 'custom';
}>(), {
  mode: 'all'
});

const emit = defineEmits(['back', 'service-click', 'template-click']);

// State
const loading = ref(true);
const standardServices = ref<any[]>([]);
const customTemplates = ref<any[]>([]);

// Fetch data logic
// ...

// Fetch data
const fetchData = async () => {
  loading.value = true;
  try {
    // Fetch standard services
    const standardRes = await servicesApi.getOfferings({ 
      city: props.currentCity || '', 
      category: props.categoryName 
    });
    standardServices.value = standardRes.services || [];

    // Fetch custom templates
    const customRes = await formTemplatesApi.getPublished(undefined, props.categoryName);
    // Filter to only custom/complex types
    customTemplates.value = (customRes.templates || []).filter(
      (t: any) => ['custom', 'complex'].includes(t.type) && t.status === 'published'
    );
  } catch (error) {
    console.error('Failed to fetch category data:', error);
  } finally {
    loading.value = false;
  }
};

// Watch for prop changes to refetch
watch(() => [props.categoryName, props.currentCity], () => {
  if (props.categoryName) {
    fetchData();
  }
}, { immediate: true });

onMounted(() => {
  if (props.categoryName) {
    fetchData();
  }
});

const handleStandardServiceClick = (item: any) => {
  emit('service-click', item);
  uni.showToast({ title: '选择了: ' + item.title, icon: 'none' });
};

const handleCustomTemplateClick = (template: any) => {
  emit('template-click', template);
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-standard-gray { background-color: #f5f6fa; } /* Match standard page */
.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-emerald-50 { background-color: #ecfdf5; }

.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-24 { padding-bottom: 96px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.p-3 { padding: 12px; }
.mb-4 { margin-bottom: 16px; }
.mr-2 { margin-right: 8px; }
.mr-3 { margin-right: 12px; }
.ml-2 { margin-left: 8px; }

.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }

.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.text-base { font-size: 16px; }
.text-lg { font-size: 18px; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }

.text-gray-900 { color: #111827; }
.text-gray-700 { color: #374151; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-emerald-600 { color: #059669; }
.text-amber-500 { color: #f59e0b; }
.text-red-500 { color: #ef4444; }

.border { border-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }
.border-emerald-500 { border-color: #10b981; }
.border-transparent { border-color: transparent; }

.rounded-full { border-radius: 9999px; }
.rounded-xl { border-radius: 12px; }
.rounded { border-radius: 4px; }
.rounded-t-2xl { border-top-left-radius: 16px; border-top-right-radius: 16px; }

.sticky { position: sticky; }
.top-0 { top: 0; }
.z-20 { z-index: 20; }
.z-50 { z-index: 50; }
.fixed { position: fixed; }
.absolute { position: absolute; }
.inset-0 { top: 0; left: 0; right: 0; bottom: 0; }

.bg-orange-50 { background-color: #fff7ed; }
.text-orange-500 { color: #f97316; }
.border-orange-500 { border-color: #f97316; }
.bg-sky-500 { background-color: #0ea5e9; }

.grid { display: grid; }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.gap-3 { gap: 12px; }
.h-9 { height: 36px; }
.rounded-lg { border-radius: 8px; }
.max-h-60vh { max-height: 60vh; }
.relative { position: relative; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.w-full { width: 100%; }
.right-4 { right: 16px; }
.top-4 { top: 16px; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.opacity-0 { opacity: 0; }
.bg-black-50 { background-color: rgba(0,0,0,0.5); }

.w-full { width: 100%; }
.h-full { height: 100%; }
.shrink-0 { flex-shrink: 0; }
.flex-1 { flex: 1; }

.w-32 { width: 128px; }
.h-24 { height: 96px; }

.box-border { box-sizing: border-box; }

.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.pb-safe { padding-bottom: env(safe-area-inset-bottom); }

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.active-scale-99:active { transform: scale(0.99); }
</style>
