<template>
  <view class="min-h-screen bg-custom-gray pb-24">
    <!-- Header Area -->
    <view class="bg-white pt-custom pb-2 px-4 shadow-sm">
      <text class="text-gray-900 text-2xl font-bold tracking-wide text-center mb-2 block">定制服务</text>
      
      <!-- Search Bar -->
      <view class="bg-gray-100 rounded-full flex flex-row items-center px-4 py-3 border border-transparent">
        <text class="text-gray-400 shrink-0" style="font-size: 18px;">🔍</text>
        <input 
          type="text" 
          placeholder="搜索定制服务" 
          class="flex-1 ml-2 outline-none bg-transparent text-gray-900 placeholder-gray-400 text-base"
        />
      </view>
    </view>

    <!-- Service Categories Section -->
    <view class="px-4 mt-4">
      <text class="text-lg font-bold text-gray-900 mb-3 block">服务分类</text>
      
      <view class="grid-cols-4 grid gap-y-4 gap-x-2">
        <view 
          v-for="(cat, idx) in CATEGORIES" 
          :key="idx" 
          class="flex flex-col items-center gap-2 cursor-pointer"
          @click="handleCategoryClick(cat)"
        >
          <!-- Icon Container: 60px Match Home -->
          <view 
            class="w-15 h-15 rounded-full flex items-center justify-center border-2 overflow-hidden"
            :class="selectedCategory === cat.name ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'"
          >
            <image 
               v-if="cat.iconName?.startsWith('http')" 
               :src="cat.iconName" 
               class="w-8 h-8 rounded-full"
               mode="aspectFill"
             />
            <AppIcon v-else :name="cat.iconName" :size="32" :style="{ color: cat.iconColor }" />
          </view>
          <text 
            class="text-base font-bold text-center"
            :class="selectedCategory === cat.name ? 'text-emerald-600' : 'text-gray-800'"
          >
            {{ cat.name }}
          </text>
        </view>
      </view>
    </view>

    <!-- Hot Services Section (From API) -->
    <view class="mt-6 px-4">
      <view class="flex flex-row items-center mb-3">
        <view class="w-1 h-5 bg-emerald-600 rounded-full mr-2"></view>
        <text class="text-lg font-bold text-gray-900">热门服务</text>
        <text v-if="loading" class="text-sm text-gray-400 ml-2">加载中...</text>
      </view>
      
      <!-- Loading State -->
      <view v-if="loading" class="flex flex-row gap-4">
        <view v-for="i in 3" :key="i" class="w-24 h-24 rounded-2xl bg-gray-100 animate-pulse"></view>
      </view>
      
      <!-- Published Templates from API -->
      <view v-else class="whitespace-nowrap hide-scrollbar w-full" style="overflow-x: auto;">
        <view class="flex flex-row gap-4">
          <view 
            v-for="(template, idx) in publishedTemplates" 
            :key="template.id || idx" 
            class="flex flex-col items-center gap-2 cursor-pointer shrink-0"
            @click="handleTemplateClick(template)"
          >
            <view 
              class="w-24 h-24 rounded-2xl flex items-center justify-center"
              :style="{ backgroundColor: getTemplateColor(template) + '20' }"
            >
              <AppIcon :name="getIconName(template.name)" :size="40" :style="{ color: getTemplateColor(template) }" />
            </view>
            <text class="text-base font-bold text-gray-800 text-center max-w-24 truncate">{{ template.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Popular Custom Services List -->
    <view class="mt-6 px-4">
      <view class="flex flex-row items-center justify-between mb-3">
        <view class="flex flex-row items-center">
          <view class="w-1 h-5 bg-emerald-600 rounded-full mr-2"></view>
          <text class="text-lg font-bold text-gray-900">推荐服务商</text>
        </view>
        <text class="text-gray-400 text-sm">更多 ›</text>
      </view>
      
      <view class="flex flex-col gap-3">
        <view 
          v-for="item in PROVIDERS" 
          :key="item.id" 
          class="bg-white rounded-xl p-4 shadow-sm flex flex-row gap-3"
        >
          <view class="w-16 h-16 rounded-xl overflow-hidden shrink-0">
            <image :src="item.avatar" mode="aspectFill" class="w-full h-full" />
          </view>
          <view class="flex-1 flex flex-col justify-between">
            <view>
              <text class="text-base font-bold text-gray-900 block">{{ item.name }}</text>
              <text class="text-xs text-gray-500 mt-1 block">{{ item.desc }}</text>
            </view>
            <view class="flex flex-row items-center justify-between">
              <text class="text-xs text-emerald-600">{{ item.category }}</text>
              <text class="text-xs text-gray-400">{{ item.distance }}</text>
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

const selectedCategory = ref('热门服务');
const loading = ref(false);
const publishedTemplates = ref<any[]>([]);

// Load published templates from API
const loadPublishedTemplates = async () => {
  loading.value = true;
  try {
    const response = await formTemplatesApi.getPublished();
    publishedTemplates.value = response.templates || [];
    console.log('加载到', publishedTemplates.value.length, '个已发布模板');
  } catch (error) {
    console.error('Failed to load templates:', error);
  } finally {
    loading.value = false;
  }
};

const loadCategories = async () => {
    try {
        const res = await categoriesApi.getAll({ service_type: 'custom' });
        const colors = [
             { icon: '#f59e0b', bg: '#fff' }, // Placeholder for hot/all if needed
             { icon: '#6b7280', bg: '#fff' }, 
             { icon: '#3b82f6', bg: '#fff' },
             { icon: '#06b6d4', bg: '#fff' },
             { icon: '#22c55e', bg: '#fff' },
             { icon: '#8b5cf6', bg: '#fff' },
             { icon: '#3b82f6', bg: '#fff' },
        ];
        
        let newCats: any[] = [];
        // Optional: Keep 'Hot' or 'All' if desired, or replace completely.
        // User request is "Add large categories". Usually this means replacing the list.
        // To be safe, I'll prepend "Hot" and "All" if they are special features, 
        // OR just list actual categories. 
        // The existing code handles "selectedCategory" filtering.
        // Let's prepend '热门服务' and '全部服务' as static items since they are meta-categories?
        // Lines 196-197: { name: '热门服务', ... }, { name: '全部服务', ... }
        
        const staticCats = [
             { name: '热门服务', iconName: 'sparkles', iconColor: '#f59e0b' },
             { name: '全部服务', iconName: 'grid', iconColor: '#6b7280' },
        ];
        
        const fetchedCats = (res.categories || []).map((cat: any, index: number) => {
            // Cycle thru colors starting from index 2
            const colorIdx = (index + 2) % colors.length;
            return {
                name: cat.name,
                iconName: cat.icon || 'grid',
                iconColor: colors[colorIdx].icon 
            };
        });
        
        CATEGORIES.value = [...staticCats, ...fetchedCats];
    } catch (e) {
        console.error('Fetch categories failed', e);
    }
}

onMounted(() => {
  loadPublishedTemplates();
  loadCategories();
});

const handleCategoryClick = (cat: any) => {
  selectedCategory.value = cat.name;
  emit('publishClick', cat.name);
};

// Handle clicking on a published template
const handleTemplateClick = (template: any) => {
  emit('serviceSelect', template);
};

// Get icon name based on template name
const getIconName = (name: string) => {
  const iconMap: Record<string, string> = {
    '搬家': 'truck',
    '搬家服务': 'truck',
    '清洁': 'sparkles',
    '家庭清洁': 'sparkles',
    '机场接送': 'plane',
    '机场': 'plane',
    '接送': 'car',
    '维修': 'wrench',
    '电器': 'zap',
    '装修': 'hammer',
    '保姆': 'users',
    '月嫂': 'baby',
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key)) return icon;
  }
  return 'clipboard'; // default icon
};

// Get color based on template color or name
const getTemplateColor = (template: any) => {
  if (template.color) return template.color;
  
  const colorMap: Record<string, string> = {
    '搬家': '#0891b2',
    '清洁': '#059669',
    '机场': '#8b5cf6',
    '维修': '#f59e0b',
  };
  
  for (const [key, color] of Object.entries(colorMap)) {
    if (template.name.includes(key)) return color;
  }
  return '#10b981';
};

// Service Categories
const CATEGORIES = ref([
  { name: '热门服务', iconName: 'sparkles', iconColor: '#f59e0b' },
  { name: '全部服务', iconName: 'grid', iconColor: '#6b7280' },
]);

// Service Providers
const PROVIDERS = [
  { 
    id: 1, 
    name: '张师傅水电维修', 
    desc: '15年经验，专业水电维修', 
    category: '水管维修', 
    distance: '2.5km',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 2, 
    name: '李师傅搬家服务', 
    desc: '安全高效，价格透明', 
    category: '搬家服务', 
    distance: '3.2km',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 3, 
    name: '王师傅杂工服务', 
    desc: '家具安装、挂画、小维修', 
    category: '杂工服务', 
    distance: '1.8km',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
  },
];
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-custom-gray { background-color: #f5f6fa; }

.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-2 { padding-bottom: 8px; }
.pb-24 { padding-bottom: 96px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.p-4 { padding: 16px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mr-2 { margin-right: 8px; }
.mt-1 { margin-top: 4px; }
.ml-2 { margin-left: 8px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-emerald-50 { background-color: rgba(16, 185, 129, 0.1); }
.bg-emerald-600 { background-color: #059669; }

.text-gray-900 { color: #111827; }
.text-gray-800 { color: #1f2937; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-emerald-600 { color: #059669; }

.text-2xl { font-size: 24px; }
.text-lg { font-size: 18px; }
.text-base { font-size: 15px; } /* Adjusted to 15px to match home */
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }

.font-bold { font-weight: 700; }
.text-center { text-align: center; }

.rounded-full { border-radius: 9999px; }
.rounded-2xl { border-radius: 16px; }
.rounded-xl { border-radius: 12px; }

.w-1 { width: 4px; }
.w-15 { width: 60px; } /* Manually added */
.w-16 { width: 64px; }
.w-24 { width: 96px; }
.w-full { width: 100%; }
.h-5 { height: 20px; }
.h-15 { height: 60px; } /* Manually added */
.h-16 { height: 64px; }
.h-24 { height: 96px; }
.h-full { height: 100%; }

.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.grid { display: grid; }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.gap-y-4 { row-gap: 16px; }
.gap-x-2 { column-gap: 8px; }

.block { display: block; }
.shrink-0 { flex-shrink: 0; }
.overflow-hidden { overflow: hidden; }
.whitespace-nowrap { white-space: nowrap; }

.border-2 { border-width: 2px; }
.border-gray-200 { border-color: #e5e7eb; }
.border-emerald-500 { border-color: #10b981; }
.border-transparent { border-color: transparent; }

.shadow-sm { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }

.cursor-pointer { cursor: pointer; }

.max-w-24 { max-width: 96px; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
.hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>
