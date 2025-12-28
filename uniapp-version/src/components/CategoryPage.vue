<template>
  <view class="min-h-screen bg-standard-gray pt-custom flex flex-col">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <view class="flex flex-row items-center flex-1">
        <view @click="emit('back')" class="mr-3 p-1 active-bg-gray-100 rounded-full">
            <AppIcon name="chevron-left" :size="24" class="text-gray-800"/>
        </view>
        <view class="flex-1 mr-2 bg-gray-100 rounded-full flex flex-row items-center px-3 py-2">
            <text class="text-gray-400 mr-2 shrink-0">🔍</text>
            <input 
              v-model="searchQuery"
              type="text" 
              :placeholder="'在 ' + (categoryName || '服务') + ' 中搜索'" 
              class="flex-1 bg-transparent text-sm text-gray-900"
            />
        </view>
      </view>
      
      <!-- Filter Button -->
      <view 
        class="flex flex-row items-center bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200 active-bg-gray-200 ml-2" 
        @click="showFilter = true"
      >
          <text class="text-sm font-medium text-gray-700 mr-1">筛选</text>
          <AppIcon name="filter" :size="14" class="text-gray-500"/>
      </view>
    </view>

    <!-- Content Area -->
    <scroll-view scroll-y class="flex-1 h-full px-4 py-4 w-full box-border">
      
      <!-- Stats/Title optional -->
      <view class="mb-4">
        <text class="text-gray-500 text-sm">共找到 {{ filteredServices.length }} 个服务</text>
      </view>

      <!-- Service List -->
      <view class="flex flex-col gap-3 pb-24">
        <view 
          v-for="item in filteredServices" 
          :key="item.id" 
          class="bg-white rounded-xl overflow-hidden shadow-sm flex flex-row active-scale-99 transition-transform"
          @click="handleServiceClick(item)"
        >
           <!-- Image -->
           <view class="w-32 h-24 bg-gray-200 shrink-0 relative">
              <image :src="item.image" mode="aspectFill" class="w-full h-full" />
           </view>
           
           <!-- Info -->
           <view class="p-3 flex flex-col flex-1 justify-between">
              <view>
                  <view class="flex flex-row justify-between items-start">
                    <text class="text-base font-bold text-gray-900 line-clamp-1 flex-1 mr-2">{{ item.title }}</text>
                  </view>
                  <text class="text-xs text-gray-500 mt-1 line-clamp-1 block">{{ item.desc }}</text>
                  
                  <!-- Rating Tag -->
                  <view class="flex flex-row items-center mt-1">
                     <AppIcon name="star" :size="12" class="text-amber-500 mr-1"/>
                     <text class="text-xs text-amber-500 font-bold">{{ item.rating }}</text>
                     <text class="text-xs text-gray-400 ml-2">已售 {{ item.sales || 0 }}</text>
                  </view>
              </view>
              
              <view class="flex flex-row items-center justify-between">
                 <text class="text-red-500 font-bold text-lg">{{ item.price }}</text>
                 <view class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-xs font-bold">
                    立即预约
                 </view>
              </view>
           </view>
        </view>

        <!-- Empty State -->
        <view v-if="filteredServices.length === 0" class="flex flex-col items-center justify-center py-20">
           <AppIcon name="inbox" :size="48" class="text-gray-300 mb-4"/>
           <text class="text-gray-400 font-medium">暂无符合条件的服务</text>
           <button class="mt-4 bg-gray-100 text-gray-600 text-sm px-6 py-2 rounded-full" @click="resetFilters">清空筛选条件</button>
        </view>
      </view>
    </scroll-view>

    <!-- Filter Modal (Bottom Sheet) -->
    <view v-if="showFilter" class="fixed inset-0 z-50 flex flex-col justify-end" @touchmove.stop.prevent="">
      <!-- Backdrop -->
      <view class="absolute inset-0 bg-black-50 transition-opacity" @click="closeFilter"></view>
      
      <!-- Modal Content -->
      <view class="bg-white rounded-t-2xl w-full animate-slide-up pb-safe relative z-10" @click.stop="">
        
        <!-- Filter Header -->
        <view class="flex flex-row justify-center items-center py-4 border-b border-gray-100 relative">
          <text class="text-lg font-bold text-gray-900">筛选</text>
          <view @click="closeFilter" class="absolute right-4 top-4 p-1">
             <AppIcon name="x" :size="22" class="text-gray-400"/>
          </view>
        </view>

        <!-- Scrollable Content -->
        <scroll-view scroll-y class="max-h-60vh px-4 py-2">
            <!-- Price Range -->
            <view class="mt-4 mb-6">
              <text class="text-sm font-bold text-gray-900 mb-3 block">价格范围</text>
              <view class="grid grid-cols-3 gap-3">
                <view 
                  v-for="(range, idx) in priceRanges" 
                  :key="idx"
                  class="h-9 flex items-center justify-center rounded-lg border text-xs transition-all relative"
                  :class="selectedPriceRange === range.value ? 'bg-orange-50 border-orange-500 text-orange-500' : 'bg-gray-100 border-transparent text-gray-600'"
                  @click="selectedPriceRange = range.value"
                >
                  <text>{{ range.label }}</text>
                </view>
              </view>
            </view>

            <!-- Rating -->
            <view class="mb-8">
              <text class="text-sm font-bold text-gray-900 mb-3 block">服务商星级</text>
              <view class="grid grid-cols-3 gap-3">
                 <view 
                  v-for="(rate, idx) in starRatings" 
                  :key="idx"
                  class="h-9 flex items-center justify-center rounded-lg border text-xs transition-all"
                  :class="selectedRating === rate.value ? 'bg-orange-50 border-orange-500 text-orange-500' : 'bg-gray-100 border-transparent text-gray-600'"
                  @click="selectedRating = rate.value"
                >
                  <text>{{ rate.label }}</text>
                </view>
              </view>
            </view>
        </scroll-view>

        <!-- Footer Buttons -->
        <view class="flex flex-row gap-3 px-4 py-3 border-t border-gray-100">
          <button 
            class="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-2 rounded-full text-sm after:border-none" 
            @click="resetFilters"
          >
            重置
          </button>
          <button 
            class="flex-1 bg-sky-500 text-white font-bold py-2 rounded-full text-sm border-none after:border-none" 
            @click="applyFilters"
          >
            确定
          </button>
        </view>
        
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from './Icons.vue';

const props = defineProps<{
  categoryName: string
}>();

const emit = defineEmits(['back']);

// State
const searchQuery = ref('');
const showFilter = ref(false);

// Service Data (Mocked with more variation for filtering demo)
const ALL_SERVICES = [
  // Cleaning
  { id: 1, category: '家庭清洁', title: '日常保洁 (2小时)', desc: '表面除尘，拖地，整理', price: '$100', priceValue: 100, rating: 4.8, sales: 520, image: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80' },
  { id: 2, category: '家庭清洁', title: '深度保洁套餐', desc: '厨房油污，卫生间水垢', price: '$350', priceValue: 350, rating: 5.0, sales: 128, image: 'https://images.unsplash.com/photo-1528740561666-dc24705f08a7?auto=format&fit=crop&w=300&q=80' },
  { id: 3, category: '家庭清洁', title: '退房保洁', desc: '通过房东验收标准', price: '$280', priceValue: 280, rating: 4.5, sales: 340, image: 'https://images.unsplash.com/photo-1527513060488-19fbf2695977?auto=format&fit=crop&w=300&q=80' },
  { id: 4, category: '家庭清洁', title: '玻璃清洁', desc: '室内外玻璃双面清洁', price: '$150', priceValue: 150, rating: 4.6, sales: 89, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80' },
  
  // Transport
  { id: 10, category: '机场接车', title: '多伦多皮尔逊送机', desc: 'Markham/Richmond Hill出发', price: '$60', priceValue: 60, rating: 4.9, sales: 1200, image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=300&q=80' },
  { id: 11, category: '机场接车', title: '机场接机服务', desc: '举牌接机，免费等待60分钟', price: '$70', priceValue: 70, rating: 4.7, sales: 890, image: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=300&q=80' },
  { id: 12, category: '机场接车', title: '瀑布一日游包车', desc: '10小时包车，中文司机', price: '$300', priceValue: 300, rating: 5.0, sales: 45, image: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&w=300&q=80' },

  // Beauty
  { id: 20, category: '美容美发', title: '上门剪发 (男士)', desc: '专业理发师上门服务', price: '$35', priceValue: 35, rating: 4.2, sales: 210, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80' },
  { id: 21, category: '美容美发', title: '女士剪发+造型', desc: '包含洗剪吹', price: '$68', priceValue: 68, rating: 4.6, sales: 330, image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=300&q=80' },

  // Fallbacks for other categories to ensure demo works
  { id: 99, category: 'other', title: '标准服务A', desc: '这是示例标准服务', price: '$100', priceValue: 100, rating: 4.5, sales: 50, image: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80' },
  { id: 100, category: 'other', title: '高级服务B', desc: '这是示例高级服务', price: '$600', priceValue: 600, rating: 5.0, sales: 10, image: 'https://images.unsplash.com/photo-1528740561666-dc24705f08a7?auto=format&fit=crop&w=300&q=80' },
];

// Helper to normalized category names for matching
const normalize = (str: string) => str ? str.trim() : '';

const categoryServices = computed(() => {
  const targetCategory = normalize(props.categoryName);
  // 1. Try exact/partial match
  const matches = ALL_SERVICES.filter(s => s.category.includes(targetCategory) || targetCategory.includes(s.category));
  
  if (matches.length > 0) return matches;
  
  // 2. Return 'other' items if no match found (Fallback for demo)
  return ALL_SERVICES.filter(s => s.category === 'other');
});


// Filter Logic
const selectedPriceRange = ref('all');
const selectedRating = ref('all');
const activeFilters = ref({
  priceRange: 'all',
  rating: 'all'
});

const priceRanges = [
  { label: '全部', value: 'all' },
  { label: '100-500', value: '100-500' },
  { label: '500-1000', value: '500-1000' },
  { label: '1000-2000', value: '1000-2000' },
  { label: '2000-10000', value: '2000-10000' },
];

const starRatings = [
  { label: '全部', value: 'all' },
  { label: '5星', value: '5' },
  { label: '3-4星', value: '3-4' },
  { label: '3星', value: '3' },
  { label: '1-2星', value: '1-2' },
];

const closeFilter = () => {
    showFilter.value = false;
};

const resetFilters = () => {
    selectedPriceRange.value = 'all';
    selectedRating.value = 'all';
};

const applyFilters = () => {
    activeFilters.value = {
        priceRange: selectedPriceRange.value,
        rating: selectedRating.value
    };
    closeFilter();
};

const filteredServices = computed(() => {
    return categoryServices.value.filter(item => {
        // Search
        if (searchQuery.value && !item.title.includes(searchQuery.value) && !item.desc.includes(searchQuery.value)) {
            return false;
        }

        // Price
        if (activeFilters.value.priceRange !== 'all') {
            const [min, max] = activeFilters.value.priceRange.split('-').map(Number);
            if (item.priceValue < min || item.priceValue > max) return false;
        }

        // Rating
        if (activeFilters.value.rating !== 'all') {
             // Handle specific ranges like "3-4" or single values "5"
             const ratingVal = activeFilters.value.rating;
             if (ratingVal.includes('-')) {
                 const [minR, maxR] = ratingVal.split('-').map(Number);
                 if (item.rating < minR || item.rating > maxR) return false;
             } else {
                 // Exact match or >= ? 
                 // Context of screenshot: "5星", "3星". Usually means that specific star.
                 // But for filtering, let's treat "5" as 4.5-5? Or just >= 5? 
                 // Let's assume buckets.
                 const r = Number(ratingVal);
                 // Simple logic for demo:
                 if (r === 3 && (item.rating < 3 || item.rating >= 4)) return false;
                 if (r === 5 && item.rating < 4.8) return false; // Strict 5 star
             }
        }

        return true;
    });
});

const handleServiceClick = (item: any) => {
    uni.showToast({ title: '选择了: ' + item.title, icon: 'none' });
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
