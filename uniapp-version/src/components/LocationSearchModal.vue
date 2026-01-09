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
import { ref, watch, onMounted } from 'vue';
import { citiesApi } from '@/services/api';

const emit = defineEmits(['close', 'select']);
const query = ref('');
const locations = ref<any[]>([]);
const results = ref<any[]>([]);

// Mapping dictionary: English -> System Chinese Name (Same as PC/H5 Home)
const CITY_MAPPING: Record<string, string> = {
    'Guelph': '圭尔夫',
    'Toronto': '多伦多',
    'Markham': '万锦',
    'Richmond Hill': '列治文山',
    'Mississauga': '密西沙加',
    'Vancouver': '温哥华',
    'Montreal': '蒙特利尔',
    'Ottawa': '渥太华',
    'Calgary': '卡尔加里',
    'Edmonton': '埃德蒙顿',
    'Waterloo': '滑铁卢',
    'Hamilton': '哈密尔顿',
    'London': '伦敦',
    'Windsor': '温莎',
    'Burnaby': '本拿比',
    'Richmond': '列治文',
    'Surrey': '素里'
};

const mapCityName = (englishName: string): string => {
    let matchedCity = englishName;
    if (CITY_MAPPING[englishName]) {
        matchedCity = CITY_MAPPING[englishName];
    } else {
        const mappingKey = Object.keys(CITY_MAPPING).find(key => englishName.includes(key));
        if (mappingKey) {
            matchedCity = CITY_MAPPING[mappingKey];
        }
    }
    return matchedCity;
};

// Fetch supported cities from backend
onMounted(async () => {
  try {
    const res = await citiesApi.getActive();
    if (res && res.length > 0) {
      locations.value = res.map((c: any) => ({
        name: c.name,
        type: 'City'
      }));
    } else {
        // Fallback if API fails or empty
        locations.value = [
            { name: '多伦多', type: 'City' },
            { name: '温哥华', type: 'City' },
            { name: '滑铁卢', type: 'City' },
            { name: '圭尔夫', type: 'City' },
        ];
    }
    results.value = locations.value;
  } catch (error) {
    console.error('Failed to load cities:', error);
    // Fallback
      locations.value = [
            { name: '多伦多', type: 'City' },
            { name: '温哥华', type: 'City' },
            { name: '滑铁卢', type: 'City' },
            { name: '圭尔夫', type: 'City' },
      ];
      results.value = locations.value;
  }
});

const handleGetCurrentLocation = () => {
    uni.showLoading({ title: '定位中...' });
    
    uni.getLocation({
        type: 'wgs84',
        success: async (res) => {
            try {
                const { latitude, longitude } = res;
                uni.request({
                    url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
                    success: (apiRes: any) => {
                         uni.hideLoading();
                         const data = apiRes.data;
                         const englishCity = data.city || data.locality || '';
                         if (englishCity) {
                             const mappedCity = mapCityName(englishCity);
                             emit('select', mappedCity);
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
            uni.showToast({ title: '需要位置权限', icon: 'none' });
        }
    });
};

watch(query, (newVal) => {
  if (newVal.trim() === '') {
    results.value = locations.value;
    return;
  }
  const lowerQuery = newVal.toLowerCase();
  results.value = locations.value.filter(item => 
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
