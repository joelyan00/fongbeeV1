<template>
  <view class="bg-standard-gray min-h-screen">
    <!-- Header Area: Capsule Aligned (Fixed) -->
    <view class="fixed-header bg-white shadow-sm z-50" style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; z-index: 9999 !important;">
        <!-- Status Bar -->
        <view :style="{ height: statusBarHeight + 'px', width: '100%' }"></view>
        
        <!-- Row 1: Nav Area (Align with Capsule) -->
        <view class="header-nav-area" :style="{ 
            height: navBarHeight + 'px', 
            paddingLeft: '16px',
            paddingRight: capsuleWidth + 'px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start'
        }">
             <view class="flex flex-row items-center">
                <AppIcon name="map-pin" :size="20" color="#111827" style="margin-right: 4px;" />
                <text style="font-size: 17px; font-weight: 700; color: #111827;">多伦多</text>
                <AppIcon name="chevron-right" :size="16" color="#9ca3af" style="margin-left: 2px;" />
             </view>
        </view>

        <!-- Row 2: Search Area (Below Nav) -->
        <view class="search-row" style="padding: 6px 16px 12px 16px; width: 100%; box-sizing: border-box;">
            <view 
                class="search-bar-new bg-gray-100 rounded-full px-3 h-9 flex flex-row items-center border border-gray-200"
                style="background-color: #F3F4F6 !important; border: 1px solid #E5E7EB !important; border-radius: 18px !important;"
            >
                <AppIcon name="search" :size="16" color="#9ca3af" style="margin-right: 8px;" />
                <input 
                    type="text" 
                    placeholder="搜索标准服务..." 
                    class="flex-1 outline-none bg-transparent text-gray-900 text-sm h-full"
                    style="font-size: 14px; background: transparent; border: none;"
                />
            </view>
        </view>
    </view>

    <!-- Spacer -->
    <view :style="{ height: (statusBarHeight + navBarHeight + 50) + 'px' }"></view>
    
    <!-- Content Area (Native Scroll) -->
    <view class="pb-24">
        <!-- Categories Grid (Swipeable) -->
        <view class="px-4 mt-6">
        <view class="bg-white rounded-2xl p-4 shadow-custom min-h-280">
            
            <swiper 
                class="h-64" 
                :indicator-dots="false" 
                @change="onSwiperChange"
            >
                <swiper-item v-for="(pageItems, pageIndex) in (pages || [])" :key="'page_' + pageIndex">
                    <view class="grid-cols-4 grid gap-y-4 gap-x-1 h-full">
                        <template v-for="(cat, idx) in (pageItems || [])" :key="'cat_' + pageIndex + '_' + idx">
                        <view 
                            class="flex flex-col items-center gap-1 cursor-pointer active-opacity-70"
                            @click="cat && cat.name && emit('categorySelect', cat.name)"
                            v-if="cat"
                        >
                            <!-- Icon Container: 60px (w-15) to match home -->
                            <view 
                            class="w-15 h-15 rounded-full flex items-center justify-center mb-1 overflow-hidden" 
                            :style="{ backgroundColor: cat.bgColor || 'rgba(107, 114, 128, 0.1)' }"
                            >
                            <image 
                                v-if="cat.iconName && (cat.iconName.startsWith('http') || cat.iconName.startsWith('/'))" 
                                :src="cat.iconName" 
                                class="w-8 h-8 rounded-full" 
                                mode="aspectFit" 
                            />
                            <AppIcon v-else :name="cat.iconName || 'grid'" :size="32" :color="cat.iconColor || '#6b7280'" />
                            </view>
                            <!-- Font size 15px to match home -->
                            <text class="text-base-15 font-bold text-gray-800 text-center leading-tight tracking-tight px-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                            {{ cat.name || '' }}
                            </text>
                        </view>
                        </template>
                    </view>
                </swiper-item>
            </swiper>

            <!-- Pagination Dots -->
            <view class="flex justify-center mt-6 gap-1" v-if="(pages || []).length > 1">
            <view
                v-for="(_, index) in (pages || [])"
                :key="index"
                @click="currentPage = index"
                class="transition-all duration-300 rounded-full h-1"
                :class="currentPage === index ? 'w-5 bg-emerald-600' : 'w-1-5 bg-gray-200'"
            />
            </view>

        </view>
        </view>

        <!-- Sections -->
        <template v-for="(secGroup, idx) in (SECTIONS || [])" :key="'sec_' + idx">
        <view class="mt-6" v-if="secGroup && secGroup.items && (secGroup.items.length > 0)">
            <!-- Section Header -->
            <view class="px-6 flex flex-row items-center justify-between mb-3">
            <text class="text-xl font-bold text-gray-900">{{ secGroup.title || '服务' }}</text>
            <view 
                class="flex flex-row items-center gap-1 active-text-gray-600"
                @click="emit('categorySelect', secGroup.title)"
                v-if="secGroup && secGroup.title"
            >
                <text class="text-gray-400 font-bold text-sm">更多</text>
                <AppIcon name="chevron-right" :size="14" color="#9ca3af" />
            </view>
            </view>

            <!-- Vertical List -->
            <view class="flex flex-col px-4 gap-3">
            <template v-for="(item, itemIdx) in (secGroup.items || [])" :key="(item && (item.id || item.title)) || ('item_' + idx + '_' + itemIdx)">
                <view 
                class="daowei-card bg-white active-opacity"
                style="display: flex !important; flex-direction: row !important; padding: 14px !important; gap: 14px !important; background-color: #ffffff !important; border-radius: 30px !important; box-shadow: 0 12px 40px rgba(0,0,0,0.06) !important; margin-bottom: 8px !important; align-items: stretch !important;"
                @click="emit('serviceClick', item)"
                v-if="item"
                >
                <!-- Left: Image -->
                <view class="card-left" style="position: relative !important; width: 100px !important; height: 100px !important; flex-shrink: 0 !important;">
                <image v-if="item.image" :src="item.image" mode="aspectFill" class="service-img" style="width: 100% !important; height: 100% !important; border-radius: 12px !important;" />
                <view v-else class="service-img bg-gray-50 flex items-center justify-center" style="width: 100% !important; height: 100% !important; border-radius: 12px !important;">
                    <AppIcon name="image" :size="30" color="#e2e8f0" />
                </view>
                <view class="badge-overlay" style="position: absolute !important; bottom: 4px !important; left: 4px !important; background: rgba(255,255,255,0.9) !important; padding: 1px 4px !important; border-radius: 3px !important; display: flex !important; flex-direction: row !important; align-items: center !important;">
                    <AppIcon name="clock" :size="7" style="margin-right: 2px !important;"/>
                    <text style="font-size: 8px !important; font-weight: 800 !important; color: #475569 !important;">准时到</text>
                </view>
                </view>
                
                <!-- Right: Details -->
                <view class="card-right" style="flex: 1 !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; min-width: 0 !important; padding: 2px 0 !important;">
                <view>
                    <text class="service-title" style="font-size: 15px !important; font-weight: 700 !important; color: #0f172a !important; display: block !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important;">{{ item.title || '无标题' }}</text>
                    <text class="service-desc" style="font-size: 11px !important; color: #94a3b8 !important; display: block !important; margin-top: 4px !important; line-clamp: 1 !important;">{{ item.desc || '暂无描述' }}</text>
                </view>
                <view class="card-footer" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; width: 100% !important;">
                    <text class="price-val" style="font-size: 16px !important; font-weight: 800 !important; color: #ef4444 !important;">{{ item.price || '面议' }}</text>
                    <view class="flex flex-row items-center gap-1">
                    <text class="go-detail" style="font-size: 11px !important; color: #3b82f6 !important; font-weight: 700 !important;">了解更多</text>
                    <AppIcon name="chevron-right" :size="10" color="#3b82f6" />
                    </view>
                </view>
                </view>
            </view>
            </template>
            </view>
        </view>
        </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import AppIcon from './Icons.vue';
import { servicesApi, categoriesApi } from '@/services/api';

const props = defineProps<{
  currentCity?: string;
}>();

const emit = defineEmits(['categorySelect', 'serviceClick']);

// --- 1. State & Refs ---
const currentPage = ref(0);
const dynamicServices = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(false);

const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

// --- 2. Static Data ---
const CATEGORY_ICON_MAP: Record<string, { iconName: string; iconColor: string; bgColor: string }> = {
  '美容美发': { iconName: 'scissors', iconColor: '#db2777', bgColor: 'rgba(219, 39, 119, 0.1)' },
  '房屋贷款': { iconName: 'banknote', iconColor: '#047857', bgColor: 'rgba(4, 120, 87, 0.1)' },
  '房产交易': { iconName: 'building', iconColor: '#0d9488', bgColor: 'rgba(13, 148, 136, 0.1)' },
  '税务理财': { iconName: 'dollar-sign', iconColor: '#7c3aed', bgColor: 'rgba(124, 58, 237, 0.1)' },
  '教育培训': { iconName: 'graduation-cap', iconColor: '#2563eb', bgColor: 'rgba(37, 99, 235, 0.1)' },
  '接送服务': { iconName: 'car', iconColor: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  '日常保洁': { iconName: 'droplets', iconColor: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  '房屋保养': { iconName: 'wrench', iconColor: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  '庭院维护': { iconName: 'sun', iconColor: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  '汽车服务': { iconName: 'car', iconColor: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  '水管维修': { iconName: 'droplet', iconColor: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  '电路维修': { iconName: 'zap', iconColor: '#7c3aed', bgColor: 'rgba(124, 58, 237, 0.1)' },
  '热门服务': { iconName: 'sparkles', iconColor: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
};

const STATIC_SECTIONS = [
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

// --- 3. Computeds ---
const SECTIONS = computed(() => {
  try {
    // 1. Deep clone static sections safely
    const finalSections: any[] = STATIC_SECTIONS ? JSON.parse(JSON.stringify(STATIC_SECTIONS)) : [];
    
    // 2. Group dynamic services
    const groupedDynamic: Record<string, any[]> = {};
    const dynServices = dynamicServices.value;
    
    if (dynServices && Array.isArray(dynServices)) {
      dynServices.forEach(svc => {
        if (!svc) return;
        const cat = svc.category || '其他服务';
        if (!groupedDynamic[cat]) groupedDynamic[cat] = [];
        groupedDynamic[cat].push({
          id: svc.id,
          isDynamic: true,
          title: svc.title || '未知服务',
          desc: svc.description || svc.desc || '暂无描述',
          price: svc.price ? (svc.price.toString().startsWith('$') ? svc.price : `$${svc.price}`) : '面议',
          image: svc.image || svc.img || 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80',
          provider: svc.provider,
          original: svc
        });
      });
    }

    // 3. Merge into static sections
    Object.keys(groupedDynamic).forEach(catName => {
      if (!catName) return;
      const exIdx = finalSections.findIndex((s: any) => 
        s && s.title && (s.title === catName || s.title.includes(catName))
      );
      if (exIdx !== -1) {
        finalSections[exIdx].items = [...(finalSections[exIdx].items || []), ...(groupedDynamic[catName] || [])];
      } else {
        finalSections.push({ title: catName, items: groupedDynamic[catName] || [] });
      }
    });

    // 4. Final cleaning and validation
    return finalSections
      .filter((s: any) => s && s.title && s.items && Array.isArray(s.items))
      .map((s: any) => ({
        ...s,
        items: Array.isArray(s.items) ? s.items.filter(Boolean) : []
      }));
  } catch (err) {
    console.error('Fatal crash in SECTIONS computed:', err);
    return [];
  }
});

const ITEMS_PER_PAGE = 8;
const pages = computed(() => {
  try {
    const cats = categories.value;
    if (!cats || !Array.isArray(cats)) return [[]];
    
    const result: any[][] = [];
    for (let i = 0; i < cats.length; i += ITEMS_PER_PAGE) {
      result.push(cats.slice(i, i + ITEMS_PER_PAGE));
    }
    return result.length > 0 ? result : [[]];
  } catch (err) {
    console.error('Fatal crash in pages computed:', err);
    return [[]];
  }
});

// --- 4. Logic & Methods ---
const initHeaderMetrics = () => {
    // #ifdef MP-WEIXIN
    try {
        const sysInfo = uni.getSystemInfoSync();
        statusBarHeight.value = sysInfo.statusBarHeight || 44;
        const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
        capsuleWidth.value = menuButtonInfo.width;
        navBarHeight.value = (menuButtonInfo.top - statusBarHeight.value) * 2 + menuButtonInfo.height;
    } catch (e) {
        console.warn('Init header metrics failed', e);
    }
    // #endif

    // #ifdef H5
    statusBarHeight.value = 0;
    navBarHeight.value = 54;
    capsuleWidth.value = 0;
    // #endif
};

const onSwiperChange = (e: any) => {
  currentPage.value = e.detail.current;
};

const loadCategories = async () => {
  const cacheKey = 'standard_categories_cache';
  try {
    const cached = uni.getStorageSync(cacheKey);
    if (cached && Array.isArray(cached.categories)) {
      categories.value = cached.categories;
    }
  } catch (e) {}

  try {
    const res = await categoriesApi.getAll({ service_type: 'standard' });
    const remoteVersion = (res as any).sync_version;
    const cached = uni.getStorageSync(cacheKey);
    if (!cached || cached.version !== remoteVersion || categories.value.length === 0) {
      const cats = (res.categories || []).map((cat: any) => {
        const remoteIcon = cat.icon;
        const isUrl = remoteIcon && (remoteIcon.startsWith('http') || remoteIcon.startsWith('/'));
        const catName = (cat.name || '').trim();
        const iconInfo = CATEGORY_ICON_MAP[catName] || { 
          iconName: remoteIcon || 'grid', iconColor: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' 
        };
        return {
          id: cat.id, name: cat.name, iconName: isUrl ? remoteIcon : iconInfo.iconName,
          iconColor: iconInfo.iconColor, bgColor: iconInfo.bgColor, isRemoteUrl: isUrl
        };
      });
      categories.value = cats;
      uni.setStorageSync(cacheKey, { categories: cats, version: remoteVersion });
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
};

const loadServices = async () => {
  loading.value = true;
  try {
    const res = await servicesApi.getOfferings({ city: props.currentCity });
    if (res && res.services) {
      dynamicServices.value = res.services;
    } else {
      dynamicServices.value = [];
    }
  } catch (e) {
    console.error('StandardServicesPage: Load services failed', e);
    dynamicServices.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.currentCity, () => {
  loadServices();
});

onMounted(() => {
  initHeaderMetrics();
  loadCategories();
  loadServices();
});
</script>

<style scoped>
.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
}

.header-nav-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 16px;
}

.search-bar-wrapper {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
}

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

.bg-white { background-color: #ffffff !important; }
.bg-main-gray { background-color: #f0f3f6 !important; }
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
