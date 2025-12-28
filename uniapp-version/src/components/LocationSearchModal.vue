<template>
  <view class="fixed inset-0 z-50 bg-gray-50 flex flex-col h-full w-full" @touchmove.stop.prevent="">
    <!-- Header with Search Input -->
    <!-- pt-12 (approx 48px) usually for status bar, safe-area better -->
    <view class="bg-white px-4 pt-custom pb-4 shadow-sm border-b border-gray-100">
      <view class="flex flex-row items-center gap-3">
        <view class="flex-1 bg-gray-100 rounded-full flex flex-row items-center px-4 py-3">
          <text class="text-gray-400 shrink-0">🔍</text>
          <input
            type="text"
            class="flex-1 bg-transparent border-none outline-none text-gray-900 ml-2 placeholder-gray-400 text-base font-medium h-6"
            placeholder="输入城市或街道名称"
            v-model="query"
            :focus="true"
            confirm-type="search"
          />
          <view v-if="query" @click="query = ''" class="p-1">
            <text class="text-gray-500">✖️</text>
          </view>
        </view>
        <view 
          @click="emit('close')"
          class="text-gray-900 font-medium text-base whitespace-nowrap px-1"
        >
          <text>取消</text>
        </view>
      </view>
    </view>

    <!-- Content Area using scroll-view -->
    <scroll-view scroll-y class="flex-1 overflow-hidden" style="height: 0; flex-grow: 1;">
      <!-- Current Location Option -->
      <view 
        v-if="query === ''"
        class="px-6 py-5 flex flex-row items-center gap-4 border-b border-gray-100 active-bg-gray-100 cursor-pointer"
        @click="handleGetCurrentLocation"
      >
        <view class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 shrink-0">
          <text class="fill-current" style="font-size: 20px;">🧭</text>
        </view>
        <view>
          <text class="font-bold text-gray-900 text-base block">定位当前位置</text>
          <text class="text-sm text-gray-500 mt-1 block">点击获取精准定位</text>
        </view>
      </view>

      <!-- Results List -->
      <view class="bg-white">
        <view 
          v-for="(item, index) in results" 
          :key="index"
          @click="emit('select', item.name)"
          class="px-6 py-5 flex flex-row items-center gap-4 border-b border-gray-100 active-bg-gray-50 cursor-pointer"
        >
          <view class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
            <text style="font-size: 20px;">📍</text>
          </view>
          <view class="flex-1">
            <view class="flex flex-row items-center justify-between">
                <text class="font-bold text-gray-900 text-base">
                    {{ item.name }}
                </text>
                <text class="text-xs text-gray-500 bg-gray-100 px-2 py-half rounded border border-gray-200">
                    {{ item.type }}
                </text>
            </view>
            <text class="text-sm text-gray-400 mt-1 block">Canada</text>
          </view>
        </view>
        
        <view v-if="query !== '' && results.length === 0" class="p-10 text-center text-gray-400 text-base">
          <text>未找到 "{{ query }}" 相关位置</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// Mock Database
const MOCK_LOCATIONS = [
  { name: 'Toronto', type: 'City' },
  { name: 'North York', type: 'City' },
  { name: 'Scarborough', type: 'City' },
  { name: 'Etobicoke', type: 'City' },
  { name: 'Mississauga', type: 'City' },
  { name: 'Brampton', type: 'City' },
  { name: 'Markham', type: 'City' },
  { name: 'Vaughan', type: 'City' },
  { name: 'Richmond Hill', type: 'City' },
  { name: 'Oakville', type: 'City' },
  { name: '温哥华 (Vancouver)', type: 'City' },
  { name: '列治文 (Richmond)', type: 'City' },
  { name: '本拿比 (Burnaby)', type: 'City' },
  { name: '素里 (Surrey)', type: 'City' },
  { name: '西温 (West Vancouver)', type: 'City' },
  { name: '高贵林 (Coquitlam)', type: 'City' },
  { name: 'Gerrard Street East', type: 'Street' },
  { name: 'Gerrard Street West', type: 'Street' },
  { name: 'Granville Street', type: 'Street' },
  { name: 'Garden Avenue', type: 'Street' },
  { name: 'Glencairn Avenue', type: 'Street' },
  { name: 'Greenwood Avenue', type: 'Street' },
  { name: 'Guildwood Parkway', type: 'Street' },
  { name: 'Yonge Street', type: 'Street' },
  { name: 'Queen Street West', type: 'Street' },
  { name: 'King Street West', type: 'Street' },
  { name: 'Dundas Street', type: 'Street' },
  { name: 'Bloor Street', type: 'Street' },
  { name: 'Cambie Street', type: 'Street' },
  { name: 'No. 3 Road', type: 'Street' },
];

const emit = defineEmits(['close', 'select']);
const query = ref('');
const results = ref(MOCK_LOCATIONS);

const handleGetCurrentLocation = () => {
    uni.showLoading({ title: '定位中...' });
    
    uni.getLocation({
        type: 'wgs84',
        success: async (res) => {
            try {
                const { latitude, longitude } = res;
                // Using the same free API as PC version for consistency
                // Note: uni.request might be safer for CORS in some environments, but fetch works in modern H5
                // Using uni.request to be safer across platforms
                uni.request({
                    url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`,
                    success: (apiRes: any) => {
                         uni.hideLoading();
                         const data = apiRes.data;
                         if (data.city || data.locality) {
                             const city = data.city || data.locality;
                             emit('select', city);
                         } else {
                             uni.showToast({ title: '无法识别位置', icon: 'none' });
                             emit('select', '多伦多');
                         }
                    },
                    fail: () => {
                        uni.hideLoading();
                        uni.showToast({ title: '定位服务不可用', icon: 'none' });
                        emit('select', '多伦多');
                    }
                });
            } catch (e) {
                uni.hideLoading();
                emit('select', '多伦多');
            }
        },
        fail: (err) => {
            console.error('Location error:', err);
            uni.hideLoading();
            // User might have denied permission
            uni.showToast({ title: '需要位置权限', icon: 'none' });
        }
    });
};

watch(query, (newVal) => {
  if (newVal.trim() === '') {
    results.value = MOCK_LOCATIONS; // Showing default list when query is empty is better UX
    return;
  }
  const lowerQuery = newVal.toLowerCase();
  results.value = MOCK_LOCATIONS.filter(item => 
    item.name.toLowerCase().includes(lowerQuery)
  );
});
</script>

<style scoped>
.fixed { position: fixed; }
.inset-0 { top: 0; left: 0; right: 0; bottom: 0; }
.z-50 { z-index: 50; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.h-full { height: 100%; }
.w-full { width: 100%; }

.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }

.pt-custom { padding-top: env(safe-area-inset-top); } /* Safe area for status bar */
.pb-4 { padding-bottom: 16px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.px-6 { padding-left: 24px; padding-right: 24px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-5 { padding-top: 20px; padding-bottom: 20px; }
.py-half { padding-top: 2px; padding-bottom: 2px; }
.px-2 { padding-left: 8px; padding-right: 8px; }

.border-b { border-bottom-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }

.rounded-full { border-radius: 9999px; }
.rounded { border-radius: 4px; }

.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

.ml-2 { margin-left: 8px; }
.mt-1 { margin-top: 4px; }

.text-gray-900 { color: #111827; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-800 { color: #1f2937; }

.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }

.w-10 { width: 40px; }
.h-10 { height: 40px; }
.h-6 { height: 24px; } /* Input height fix */

.block { display: block; }
.shrink-0 { flex-shrink: 0; }
</style>
