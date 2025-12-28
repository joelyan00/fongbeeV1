<template>
  <view class="min-h-screen bg-standard-gray pb-24">
    <!-- Header Area -->
    <view class="bg-white pt-custom pb-2 px-4 shadow-sm">
      <text class="text-gray-900 text-2xl font-bold tracking-wide text-center mb-2 block">标准服务</text>
      
      <!-- Search Bar -->
      <view class="bg-gray-100 rounded-full flex flex-row items-center px-4 py-3 border border-transparent">
        <text class="text-gray-400 shrink-0" style="font-size: 18px;">🔍</text>
        <input 
          type="text" 
          placeholder="搜索服务内容" 
          class="flex-1 ml-2 outline-none bg-transparent text-gray-900 placeholder-gray-400 text-base"
        />
      </view>
    </view>

    <!-- Categories Grid (Swipeable) -->
    <view class="px-4 mt-6">
      <view class="bg-white rounded-2xl p-4 shadow-custom min-h-280">
        
        <swiper 
            class="h-64" 
            :indicator-dots="false" 
            @change="onSwiperChange"
        >
            <swiper-item v-for="(pageItems, pageIndex) in pages" :key="pageIndex">
                <view class="grid-cols-4 grid gap-y-4 gap-x-1 h-full">
                    <view 
                      v-for="(cat, idx) in pageItems" 
                      :key="idx" 
                      class="flex flex-col items-center gap-1 cursor-pointer active-opacity-70"
                      @click="emit('categorySelect', cat.name)"
                    >
                      <!-- Icon Container: 60px (w-15) to match home -->
                      <view 
                        class="w-15 h-15 rounded-full flex items-center justify-center mb-1" 
                        :style="{ backgroundColor: cat.bgColor }"
                      >
                         <AppIcon :name="cat.iconName" :size="32" :style="{ color: cat.iconColor }" />
                      </view>
                      <!-- Font size 15px to match home -->
                      <text class="text-base-15 font-bold text-gray-800 text-center leading-tight tracking-tight px-0.5 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        {{ cat.name }}
                      </text>
                    </view>
                </view>
            </swiper-item>
        </swiper>

        <!-- Pagination Dots -->
        <view class="flex justify-center mt-6 gap-1.5">
          <view
            v-for="(_, index) in pages"
            :key="index"
            @click="currentPage = index"
            class="transition-all duration-300 rounded-full h-1.5"
            :class="currentPage === index ? 'w-5 bg-emerald-600' : 'w-1-5 bg-gray-200'"
          />
        </view>

      </view>
    </view>

    <!-- Sections -->
    <view v-for="(section, idx) in SECTIONS" :key="idx" class="mt-6">
      <!-- Section Header -->
      <view class="px-6 flex flex-row items-center justify-between mb-3">
        <text class="text-xl font-bold text-gray-900">{{ section.title }}</text>
        <view 
          class="flex flex-row items-center gap-1 active-text-gray-600"
          @click="emit('categorySelect', section.title)"
        >
          <text class="text-gray-400 font-bold text-sm">更多</text>
          <text class="text-gray-400" style="font-size: 14px;">›</text>
        </view>
      </view>

      <!-- Vertical List -->
      <view class="flex flex-col px-4 gap-3">
        <view 
          v-for="item in section.items" 
          :key="item.id" 
          class="w-full bg-white rounded-xl overflow-hidden shadow-custom border border-gray-100 flex flex-row active-scale-98 transition-transform cursor-pointer"
          @click="emit('serviceClick', item)"
        >
          <!-- Horizontal Card Layout -->
          <view class="w-32 h-24 bg-gray-200 relative shrink-0">
            <image :src="item.image" mode="aspectFill" class="w-full h-full" />
            <view class="absolute inset-0 bg-black-5"></view>
          </view>
          <view class="p-3 flex flex-col flex-1 justify-between">
            <view>
              <text class="text-base font-bold text-gray-900 line-clamp-1 block">{{ item.title }}</text>
              <text class="text-xs text-gray-500 mt-1 line-clamp-1 block">{{ item.desc }}</text>
            </view>
            <view class="mt-1">
              <text class="text-red-500 font-bold text-lg">{{ item.price }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from './Icons.vue';

const emit = defineEmits(['categorySelect', 'serviceClick']);
const currentPage = ref(0);

const onSwiperChange = (e: any) => {
  currentPage.value = e.detail.current;
};

// Categories with specific colors and backgrounds
const CATEGORIES = [
  // Page 1
  { name: '美容美发', iconName: 'scissors', iconColor: '#db2777', bgColor: 'rgba(219, 39, 119, 0.1)' },
  { name: '房屋贷款', iconName: 'banknote', iconColor: '#047857', bgColor: 'rgba(4, 120, 87, 0.1)' },
  { name: '房产交易', iconName: 'building', iconColor: '#0d9488', bgColor: 'rgba(13, 148, 136, 0.1)' },
  { name: '汽车交易', iconName: 'car', iconColor: '#1d4ed8', bgColor: 'rgba(29, 78, 216, 0.1)' },
  { name: '顺心旅游', iconName: 'plane', iconColor: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.1)' },
  { name: '机票购买', iconName: 'ticket', iconColor: '#7c3aed', bgColor: 'rgba(124, 58, 237, 0.1)' },
  { name: '接机服务', iconName: 'car', iconColor: '#0891b2', bgColor: 'rgba(8, 145, 178, 0.1)' },
  { name: '家庭清洁', iconName: 'sparkles', iconColor: '#059669', bgColor: 'rgba(5, 150, 105, 0.1)' },
  
  // Page 2
  { name: '水管维修', iconName: 'droplet', iconColor: '#0891b2', bgColor: 'rgba(8, 145, 178, 0.1)' },
  { name: '电路维修', iconName: 'zap', iconColor: '#d97706', bgColor: 'rgba(217, 119, 6, 0.1)' },
  { name: '室内维修', iconName: 'home', iconColor: '#ea580c', bgColor: 'rgba(234, 88, 12, 0.1)' },
  { name: '屋顶翻修', iconName: 'hammer', iconColor: '#475569', bgColor: 'rgba(71, 85, 105, 0.1)' },
  { name: '车道翻修', iconName: 'truck', iconColor: '#2563eb', bgColor: 'rgba(37, 99, 235, 0.1)' },
  { name: '花园维护', iconName: 'sprout', iconColor: '#16a34a', bgColor: 'rgba(22, 163, 74, 0.1)' },
  { name: '会计报税', iconName: 'file-text', iconColor: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)' },
  { name: '网站开发', iconName: 'laptop', iconColor: '#7c3aed', bgColor: 'rgba(124, 58, 237, 0.1)' },

  // Page 3
  { name: '冬季扫雪', iconName: 'snowflake', iconColor: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.1)' },
  { name: '更换轮胎', iconName: 'disc', iconColor: '#52525b', bgColor: 'rgba(82, 82, 91, 0.1)' },
];

const SECTIONS = [
  {
    title: '家庭清洁',
    items: [
      { id: 4, title: '日常保洁 (2小时)', desc: '表面除尘，拖地，整理', price: '$100', image: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80' },
      { id: 5, title: '深度保洁套餐', desc: '厨房油污，卫生间水垢', price: '$350', image: 'https://images.unsplash.com/photo-1528740561666-dc24705f08a7?auto=format&fit=crop&w=300&q=80' },
      { id: 6, title: '退房保洁', desc: '通过房东验收标准', price: '$280', image: 'https://images.unsplash.com/photo-1527513060488-19fbf2695977?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    title: '接机服务',
    items: [
      { id: 10, title: '多伦多皮尔逊送机', desc: 'Markham/Richmond Hill出发', price: '$60', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=300&q=80' },
      { id: 11, title: '机场接机服务', desc: '举牌接机，免费等待60分钟', price: '$70', image: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=300&q=80' },
      { id: 12, title: '瀑布一日游包车', desc: '10小时包车，中文司机', price: '$300', image: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    title: '美容美发',
    items: [
      { id: 13, title: '上门剪发 (男士)', desc: '专业理发师上门服务', price: '$35', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80' },
      { id: 14, title: '女士剪发+造型', desc: '包含洗剪吹', price: '$68', image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=300&q=80' },
      { id: 15, title: '美甲护理', desc: '手部基础护理+单色', price: '$50', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80' }
    ]
  }
];

const ITEMS_PER_PAGE = 8;
const pages: any[] = [];
for (let i = 0; i < CATEGORIES.length; i += ITEMS_PER_PAGE) {
  pages.push(CATEGORIES.slice(i, i + ITEMS_PER_PAGE));
}
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-standard-gray { background-color: #f5f6fa; }

.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-2 { padding-bottom: 8px; }
.pb-24 { padding-bottom: 96px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.px-6 { padding-left: 24px; padding-right: 24px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.p-4 { padding: 16px; }
.p-3 { padding: 12px; }

.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-emerald-600 { background-color: #059669; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-custom { box-shadow: 0 2px 8px rgba(0,0,0,0.02); }

.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-1 { gap: 4px; }
.gap-1-5 { gap: 6px; }
.gap-3 { gap: 12px; }

.block { display: block; }
.shrink-0 { flex-shrink: 0; }
.flex-1 { flex: 1; }

.text-gray-900 { color: #111827; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-800 { color: #1f2937; }
.text-red-500 { color: #ef4444; }

.text-2xl { font-size: 24px; }
.text-xl { font-size: 20px; }
.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.text-lg { font-size: 18px; }

.font-bold { font-weight: 700; }
.text-center { text-align: center; }

.rounded-full { border-radius: 9999px; }
.rounded-2xl { border-radius: 16px; }
.rounded-xl { border-radius: 12px; }
.w-15 { width: 60px; } /* Manually added for consistency */
.h-15 { height: 60px; } 
.text-base-15 { font-size: 15px; }
.w-4-5-rem { width: 4.5rem; }
.h-4-5-rem { height: 4.5rem; }
.rounded-1-4-rem { border-radius: 1.4rem; }
.w-5 { width: 20px; }
.w-1-5 { width: 6px; }
.h-1-5 { height: 6px; }
.h-64 { height: 16rem; }


.overflow-hidden { overflow: hidden; }
.min-h-280 { min-height: 280px; }
.w-32 { width: 128px; }
.h-24 { height: 96px; }
.w-full { width: 100%; }
.h-full { height: 100%; }

.border { border-width: 1px; }
.border-transparent { border-color: transparent; }
.border-gray-100 { border-color: #f3f4f6; }

.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; left: 0; right: 0; bottom: 0; }
.bg-black-5 { background-color: rgba(0,0,0,0.05); }

.grid { display: grid; }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.gap-y-4 { row-gap: 16px; }
.gap-x-1 { column-gap: 4px; }

.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
.ml-2 { margin-left: 8px; }

/* Colors needed for icons */
.text-pink-500 { color: #ec4899; }
.text-emerald-600 { color: #059669; }
.text-teal-600 { color: #0d9488; }
.text-blue-600 { color: #2563eb; }
.text-sky-500 { color: #0ea5e9; }
.text-red-500 { color: #ef4444; }
.text-blue-500 { color: #3b82f6; }
.text-teal-400 { color: #2dd4bf; }
.text-cyan-500 { color: #06b6d4; }
.text-amber-500 { color: #f59e0b; }
.text-orange-500 { color: #f97316; }
.text-slate-600 { color: #475569; }
.text-emerald-500 { color: #10b981; }
.text-indigo-500 { color: #6366f1; }
.text-purple-500 { color: #a855f7; }
.text-sky-300 { color: #7dd3fc; }
.text-zinc-600 { color: #52525b; }
.active-scale-98:active { transform: scale(0.98); }
</style>
