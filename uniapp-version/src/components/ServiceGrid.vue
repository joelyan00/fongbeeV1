<template>
  <view class="service-grid-wrapper" :style="{ paddingLeft: capsuleMargin + 'px', paddingRight: capsuleMargin + 'px', paddingTop: '0px', paddingBottom: '4px' }">
    <!-- Green Title Bar -->
    <view class="title-bar" style="background: linear-gradient(135deg, #3D8E63 0%, #2A6B4A 100%); border-radius: 12px; padding: 14px 24px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
      <text class="title-text" style="color: #ffffff; font-size: 16px; font-weight: 700; text-align: center; display: block; letter-spacing: 0.5px;">标准服务，省时，省心</text>
    </view>
    
    <!-- White Card Container (Prominent Block Style) -->
    <view class="bg-white pt-6 pb-6 px-1 shadow-sm relative" style="border-radius: 30px !important; border: 1px solid rgba(255,255,255,0.8) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.06) !important; margin-bottom: 24px !important; width: auto !important; margin-left: 4px !important; margin-right: 4px !important;">
      <!-- #ifdef MP-WEIXIN -->
      <swiper 
        style="height: 240px;"
        :indicator-dots="false"
        @change="onSwiperChange"
      >
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <swiper 
        class="h-60"
        :indicator-dots="false"
        @change="onSwiperChange"
      >
      <!-- #endif -->
        <swiper-item v-for="(pageItems, pageIndex) in (pages || [])" :key="pageIndex" style="width: 100%; height: 100%;">
          <view style="display: flex; flex-wrap: wrap; width: 100%; padding: 4px 0; box-sizing: border-box;">
            <view 
              v-for="(service, idx) in (pageItems || [])" 
              :key="idx" 
              style="width: 25%; display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;"
              @click="emit('categorySelect', service.name)"
            >
              <!-- Icon Container: 60px Circular Match Standard Page -->
              <view 
                 class="w-15 h-15 rounded-full flex items-center justify-center mb-2 overflow-hidden"
                 style="box-shadow: 0 4px 10px rgba(0,0,0,0.04);"
                 :style="{ backgroundColor: service.bgColor || 'rgba(107, 114, 128, 0.05)' }"
              >
                 <image 
                   v-if="service.iconName && (service.iconName.startsWith('http') || service.iconName.startsWith('/'))" 
                   :src="service.iconName" 
                   style="width: 32px; height: 32px; border-radius: 9999px;"
                   mode="aspectFit"
                 />
                 <AppIcon v-else :name="service.iconName || 'grid'" :size="32" :color="service.iconColor || '#6b7280'"/>
              </view>
              <text class="text-base-15 font-bold text-gray-800 text-center truncate w-full px-1" style="letter-spacing: -0.2px;">{{ service.name }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
      
      <!-- Pagination Dots -->
      <view class="flex flex-row justify-center gap-2 mt-4 absolute bottom-2 left-0 right-0">
        <view
          v-for="(_, index) in pages"
          :key="index"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="currentPage === index ? 'w-4 bg-emerald-600' : 'w-1.5 bg-slate-200'"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppIcon from './Icons.vue';
import { categoriesApi } from '@/services/api';

// #ifdef MP-WEIXIN
defineOptions({
  options: {
    styleIsolation: 'shared'
  }
})
// #endif

const emit = defineEmits(['categorySelect']);

defineProps<{
  selectedCategory?: string
}>();

const currentPage = ref(0);
const services = ref<any[]>([]);
const capsuleMargin = ref(12); // Default fallback

const onSwiperChange = (e: any) => {
  currentPage.value = e.detail.current;
};

// Pastel colors for icons
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
  '全部服务': { iconName: 'grid', iconColor: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
};

const ITEMS_PER_PAGE = 8;
const pages = computed(() => {
    const p: any[] = [];
    for (let i = 0; i < services.value.length; i += ITEMS_PER_PAGE) {
        p.push(services.value.slice(i, i + ITEMS_PER_PAGE));
    }
    return p;
});

onMounted(async () => {
    const info = uni.getSystemInfoSync();
    
    // #ifdef MP-WEIXIN
    try {
      const capsule = uni.getMenuButtonBoundingClientRect();
      const margin = info.screenWidth - capsule.right;
      if (margin > 0) {
        capsuleMargin.value = margin;
      }
    } catch (e) {
      console.error('ServiceGrid: Get capsule info failed', e);
    }
    // #endif

    const cacheKey = 'home_categories_cache';
    
    // 1. Load from cache immediately
    try {
        const cached = uni.getStorageSync(cacheKey);
        if (cached && Array.isArray(cached.services)) {
            services.value = cached.services;
        }
    } catch (e) {}

    try {
        const [standardRes, customRes] = await Promise.all([
            categoriesApi.getAll({ service_type: 'standard' }),
            categoriesApi.getAll({ service_type: 'custom' })
        ]);

        const remoteVersion = (standardRes as any).sync_version + (customRes as any).sync_version;
        const cached = uni.getStorageSync(cacheKey);

        if (!cached || cached.version !== remoteVersion || services.value.length === 0) {
            const stdCats = standardRes.categories || [];
            const custCats = customRes.categories || [];

            const unifiedMap = new Map();
            custCats.forEach((cat: any) => {
                unifiedMap.set(cat.name, {
                    name: cat.name,
                    iconName: cat.icon || 'grid',
                    type: 'custom'
                });
            });
            stdCats.forEach((cat: any) => {
                unifiedMap.set(cat.name, {
                    name: cat.name,
                    iconName: cat.icon || 'grid',
                    type: 'standard'
                });
            });

            const merged = Array.from(unifiedMap.values());
            merged.push({ name: '全部服务', iconName: 'grid', type: 'all' });

            const finalServices = merged.map((cat: any) => {
                const remoteIcon = cat.iconName;
                const isUrl = remoteIcon && (remoteIcon.startsWith('http') || remoteIcon.startsWith('/'));
                const catName = (cat.name || '').trim();
                const iconInfo = CATEGORY_ICON_MAP[catName] || { 
                    iconName: remoteIcon || 'grid', 
                    iconColor: '#6b7280', 
                    bgColor: 'rgba(107, 114, 128, 0.05)' 
                };

                return {
                    name: cat.name,
                    iconName: isUrl ? remoteIcon : iconInfo.iconName,
                    iconColor: iconInfo.iconColor,
                    bgColor: iconInfo.bgColor,
                    type: cat.type
                };
            });

            services.value = finalServices;
            uni.setStorageSync(cacheKey, {
                services: finalServices,
                version: remoteVersion
            });
        }

    } catch (e) {
        console.error('Fetch categories failed', e);
    }
});
</script>

<style scoped>
.service-grid-wrapper {
  padding: 0 12px 12px 12px;
}

.title-bar {
  background: linear-gradient(135deg, #3D8E63 0%, #2A6B4A 100%);
  border-radius: 12px;
  padding: 14px 24px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(61, 142, 99, 0.15);
}

.title-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  display: block;
  letter-spacing: 0.5px;
}
</style>
