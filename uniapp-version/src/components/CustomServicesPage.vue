<template>
  <view class="bg-gray-50 min-h-screen">
    <!-- Header: Unified Search & Capsule (Static Spacer Built-in) -->
    <!-- Note: Header logic for Custom page might need similar fixed treatment if not reusing global header -->
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
                    v-model="searchQuery" 
                    placeholder="搜索定制服务..." 
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
        <!-- Categories Grid -->
        <view class="px-4 mt-6">
          <view class="bg-white rounded-2xl p-4 shadow-sm">
            <view class="grid-layout" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px 4px;">
              <template v-for="(cat, idx) in (CATEGORIES || [])" :key="idx">
                <view 
                  class="flex flex-col items-center gap-1 active-opacity"
                  @click="handleCategoryClick(cat)"
                  v-if="cat"
                >
                  <view 
                    class="w-15 h-15 rounded-full flex items-center justify-center mb-1 shadow-sm"
                    style="box-shadow: 0 4px 10px rgba(0,0,0,0.04);"
                    :style="{ backgroundColor: cat.bgColor || '#f3f4f6' }"
                  >
                    <image v-if="cat.isRemoteUrl" :src="cat.iconName" style="width: 32px; height: 32px; border-radius: 9999px;" mode="aspectFit" />
                    <AppIcon v-else :name="cat.iconName || 'grid'" :size="32" :color="cat.iconColor || '#6b7280'" />
                  </view>
                  <text class="text-xs font-bold text-gray-800 text-center w-full truncate px-1">{{ cat.name || '' }}</text>
                </view>
              </template>
            </view>
          </view>
        </view>

        <!-- Popular Custom Templates -->
        <view class="mt-8 px-4" v-if="publishedTemplates && publishedTemplates.length > 0">
          <view class="flex flex-row items-center justify-between mb-4 px-2">
            <text class="text-lg font-bold text-gray-900">推荐定制</text>
            <view class="flex flex-row items-center gap-1 active-text-blue-600" @click="emit('categorySelect', '全部')">
              <text class="text-blue-500 text-sm font-bold">查看全部</text>
              <AppIcon name="chevron-right" :size="14" color="#3b82f6" />
            </view>
          </view>

          <view class="template-scroll" style="display: flex; flex-direction: row; white-space: nowrap; gap: 12px; padding: 4px 0; overflow-x: auto;">
            <view 
              v-for="(template, idx) in (publishedTemplates || [])" 
              :key="idx"
              class="template-card-mini bg-white active-scale shadow-sm"
              style="display: inline-flex; flex-direction: column; width: 140px; padding: 16px; border-radius: 20px; flex-shrink: 0; border-left: 4px solid;"
              :style="{ borderLeftColor: getTemplateColor(template) }"
              @click="handleTemplateClick(template)"
            >
              <view class="mb-3 w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: getTemplateColor(template) + '15' }">
                <AppIcon :name="getIconName(template.name)" :size="20" :color="getTemplateColor(template)" />
              </view>
              <text class="text-sm font-bold text-gray-900 mb-1 truncate w-full">{{ template.name }}</text>
              <text class="text-xs text-gray-400">立即定制</text>
            </view>
          </view>
        </view>

        <!-- Featured Providers -->
        <view class="mt-8 px-4">
          <view class="flex flex-row items-center justify-between mb-4 px-2">
            <text class="text-lg font-bold text-gray-900">推荐服务商</text>
          </view>

          <view class="flex flex-col gap-4">
            <view 
              v-for="provider in (PROVIDERS || [])" 
              :key="provider.id"
              class="bg-white rounded-2xl p-4 flex flex-row items-center gap-4 shadow-sm active-opacity"
            >
              <image :src="provider.avatar" class="w-16 h-16 rounded-full border-2 border-white shadow-sm" mode="aspectFill" />
              <view class="flex-1">
                <view class="flex flex-row items-center justify-between mb-1">
                  <text class="text-base font-bold text-gray-900">{{ provider.name }}</text>
                  <text class="text-xs text-gray-400">{{ provider.distance }}</text>
                </view>
                <text class="text-sm text-gray-500 line-clamp-1 mb-2">{{ provider.desc }}</text>
                <view class="flex flex-row items-center gap-2">
                  <view class="bg-blue-50 px-2 py-0.5 rounded text-xs text-blue-600 font-medium">{{ provider.category }}</view>
                  <view class="bg-emerald-50 px-2 py-0.5 rounded text-xs text-emerald-600 font-medium">100%好评</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from './Icons.vue';
import { formTemplatesApi, categoriesApi } from '../services/api';

const emit = defineEmits(['serviceSelect', 'categorySelect', 'publishClick']);

// --- 1. State & Refs (MUST BE DEFINED BEFORE LOGIC) ---
const CATEGORIES = ref<any[]>([
  { name: '热门服务', iconName: 'sparkles', iconColor: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
]);

const PROVIDERS = ref([
  { id: 1, name: '张师傅水电维修', desc: '15年经验，专业水电维修', category: '水管维修', distance: '2.5km', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
  { id: 2, name: '李师傅搬家服务', desc: '安全高效，价格透明', category: '搬家服务', distance: '3.2km', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
  { id: 3, name: '王师傅杂工服务', desc: '家具安装、挂画、小维修', category: '杂工服务', distance: '1.8km', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
]);

const selectedCategory = ref('热门服务');
const loading = ref(false);
const searchQuery = ref('');
const publishedTemplates = ref<any[]>([]);

// Header Metrics
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

// --- 2. Static Mappings ---
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
  '其他服务': { iconName: 'grid', iconColor: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
};

// --- 3. Logic & Methods ---
const initHeaderMetrics = () => {
    // #ifdef MP-WEIXIN
    try {
        const sysInfo = uni.getSystemInfoSync();
        statusBarHeight.value = sysInfo.statusBarHeight || 44;
        const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
        capsuleWidth.value = menuButtonInfo.width;
        navBarHeight.value = (menuButtonInfo.top - statusBarHeight.value) * 2 + menuButtonInfo.height;
    } catch (e) {}
    // #endif

    // #ifdef H5
    statusBarHeight.value = 0;
    navBarHeight.value = 54;
    capsuleWidth.value = 0;
    // #endif
};

const loadPublishedTemplates = async () => {
  loading.value = true;
  try {
    const response = await formTemplatesApi.getPublished();
    const templates = response?.templates || [];
    publishedTemplates.value = (templates || []).filter((t: any) => t && t.is_popular && ['custom', 'complex'].includes(t.type));
  } catch (error) {
    publishedTemplates.value = [];
  } finally {
    loading.value = false;
  }
};

const loadCategories = async () => {
  const cacheKey = 'custom_categories_cache';
  try {
    const cached = uni.getStorageSync(cacheKey);
    if (cached && Array.isArray(cached.categories)) {
      CATEGORIES.value = cached.categories;
    }
  } catch (e) {}

  try {
    const res = await categoriesApi.getAll({ service_type: 'custom' });
    if (!res) return;
    const remoteVersion = (res as any).sync_version;
    const cached = uni.getStorageSync(cacheKey);
    if (!cached || cached.version !== remoteVersion || CATEGORIES.value.length <= 1) {
      const staticCats = [{ name: '热门服务', iconName: 'sparkles', iconColor: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' }];
      const fetchedCats = (res.categories || []).map((cat: any) => {
        const remoteIcon = cat.icon;
        const isUrl = remoteIcon && (remoteIcon.startsWith('http') || remoteIcon.startsWith('/'));
        const catName = (cat.name || '').trim();
        const iconInfo = CATEGORY_ICON_MAP[catName] || { iconName: remoteIcon || 'grid', iconColor: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
        return { 
           id: cat.id, name: cat.name, iconName: isUrl ? remoteIcon : iconInfo.iconName,
           iconColor: iconInfo.iconColor, bgColor: iconInfo.bgColor, isRemoteUrl: isUrl 
        };
      });
      const finalCats = [...staticCats, ...fetchedCats];
      CATEGORIES.value = finalCats;
      uni.setStorageSync(cacheKey, { categories: finalCats, version: remoteVersion });
    }
  } catch (error) {}
};

onMounted(() => {
  initHeaderMetrics();
  loadPublishedTemplates();
  loadCategories();
});

const handleCategoryClick = (cat: any) => {
  if (!cat) return;
  selectedCategory.value = cat.name;
  emit('publishClick', cat.name);
};

const handleTemplateClick = (template: any) => {
  if (!template) return;
  emit('serviceSelect', template);
};

const getIconName = (name: string) => {
  if (!name) return 'clipboard';
  const iconMap: Record<string, string> = {
    '搬家': 'truck', '清洁': 'sparkles', '接送': 'car', '维修': 'wrench',
    '电器': 'zap', '装修': 'hammer', '保姆': 'users', '月嫂': 'baby',
  };
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key)) return icon;
  }
  return 'clipboard';
};

const getTemplateColor = (template: any) => {
  if (template?.color) return template.color;
  const name = template?.name || '';
  const colorMap: Record<string, string> = { '搬家': '#0891b2', '清洁': '#059669', '机场': '#8b5cf6', '维修': '#f59e0b' };
  for (const [key, color] of Object.entries(colorMap)) {
    if (name.includes(key)) return color;
  }
  return '#10b981';
};
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
.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-emerald-50 { background-color: #ecfdf5; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.rounded-full { border-radius: 9999px; }
.rounded-2xl { border-radius: 16px; }
.rounded-lg { border-radius: 8px; }

.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.flex-1 { flex: 1; }
.shrink-0 { flex-shrink: 0; }

.text-gray-900 { color: #111827; }
.text-gray-800 { color: #1f2937; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-blue-500 { color: #3b82f6; }
.text-blue-600 { color: #2563eb; }
.text-emerald-600 { color: #10b981; }

.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }

.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.tracking-wide { letter-spacing: 0.025em; }

.w-12 { width: 48px; }
.h-12 { height: 48px; }
.w-10 { width: 40px; }
.h-10 { height: 40px; }
.w-6 { width: 24px; }
.h-6 { height: 24px; }
.w-16 { width: 64px; }
.h-16 { height: 64px; }
.w-full { width: 100%; }

.px-4 { padding-left: 16px; padding-right: 16px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.px-1 { padding-left: 4px; padding-right: 4px; }
.pb-4 { padding-bottom: 16px; }
.p-4 { padding: 16px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-0.5 { padding-top: 2px; padding-bottom: 2px; }

.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.ml-2 { margin-left: 8px; }

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }

.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.line-clamp-1 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; overflow: hidden; }

.active-opacity:active { opacity: 0.7; }
.active-scale:active { transform: scale(0.98); }
.active-text-blue-600:active text { color: #2563eb; }

.template-scroll::-webkit-scrollbar { display: none; }
</style>
