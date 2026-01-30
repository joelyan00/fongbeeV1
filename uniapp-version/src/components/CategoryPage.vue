<template>
  <view class="page-container bg-main-gray">
    <!-- Status Bar Area -->
    <view :style="{ height: statusBarHeight + 'px', width: '100%', backgroundColor: '#ffffff' }"></view>

    <!-- Header: Premium H5 Style (Capsule Aligned) -->
    <view class="premium-header bg-white shadow-sm flex flex-col items-stretch border-b border-slate-100">
        <view class="header-nav-area" :style="{ 
            height: navBarHeight + 'px', 
            display: 'flex !important', 
            flexDirection: 'row !important', 
            alignItems: 'center !important', 
            padding: '0 16px',
            paddingRight: (capsuleWidth + 16) + 'px'
        }">
            <!-- Left: Back + Title -->
            <view class="flex flex-row items-center gap-2">
                <view @click="emit('back')" class="back-btn-new active-opacity flex items-center justify-center w-8 h-8">
                    <AppIcon name="chevron-left" :size="24" color="#1e293b"/>
                </view>
                <text v-if="!isSearching" class="text-lg font-bold text-slate-900">{{ categoryName }}</text>
            </view>

            <!-- Middle: Search Input (when active) -->
            <view v-if="isSearching" class="flex-1 flex flex-row items-center bg-slate-100 px-3 py-1.5 rounded-full mx-2">
                <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="搜索服务..." 
                    confirm-type="search"
                    auto-focus
                    class="flex-1 text-sm text-slate-900 h-7"
                />
                <view @click="toggleSearch" class="p-1">
                    <AppIcon name="x" :size="14" color="#94a3b8"/>
                </view>
            </view>
            
            <view v-else class="flex-1"></view>

            <!-- Right: Actions -->
            <view class="flex flex-row items-center gap-2">
                <view @click="toggleSearch" v-if="!isSearching" class="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center active-opacity">
                    <AppIcon name="search" :size="18" color="#334155"/>
                </view>
                <view @click="goHome" class="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center active-opacity">
                    <AppIcon name="home" :size="18" color="#334155"/>
                </view>
            </view>
        </view>
    </view>

    <!-- Sub-category Tabs: Horizontal Premium Scroll -->
    <view class="bg-white py-3 border-b border-slate-50">
        <scroll-view scroll-x class="w-full" :show-scrollbar="false">
            <view class="flex flex-row px-3 gap-3 min-w-full">
                <!-- "All" Tab -->
                <view 
                    class="flex flex-col items-center justify-center gap-1 active-opacity shrink-0 w-20 h-20 rounded-xl transition-all duration-200"
                    @click="activeTab = 'all'"
                    :style="{ 
                        backgroundColor: activeTab === 'all' ? '#fff1f2' : '#ffffff', 
                        border: activeTab === 'all' ? '1px solid #fecaca' : '1px solid #f1f5f9',
                        boxShadow: activeTab === 'all' ? '0 4px 12px rgba(251, 113, 133, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)'
                    }"
                >
                    <AppIcon name="grid" :size="24" :color="activeTab === 'all' ? '#ef4444' : '#64748b'"/>
                    <text class="text-xs font-bold transition-colors duration-200" 
                        :style="{ color: activeTab === 'all' ? '#ef4444' : '#64748b' }">推荐服务</text>
                </view>

                <!-- Dynamic Tabs from Templates -->
                <template v-for="template in (customTemplates || [])" :key="template.id">
                    <view 
                        v-if="template"
                        class="flex flex-col items-center justify-center gap-1 active-opacity shrink-0 w-20 h-20 rounded-xl transition-all duration-200"
                        @click="activeTab = template.id"
                        :style="{ 
                            backgroundColor: activeTab === template.id ? '#fff1f2' : '#ffffff', 
                            border: activeTab === template.id ? '1px solid #fecaca' : '1px solid #f1f5f9',
                            boxShadow: activeTab === template.id ? '0 4px 12px rgba(251, 113, 133, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)'
                        }"
                    >
                    <AppIcon :name="getIconName(template.name)" :size="24" :color="activeTab === template.id ? '#ef4444' : '#64748b'"/>
                    <text class="text-xs font-bold transition-colors duration-200" 
                        :style="{ color: activeTab === template.id ? '#ef4444' : '#64748b' }">{{ template.name }}</text>
                </view>
            </template>
            </view>
        </scroll-view>
    </view>

    <!-- Content Area -->
    <scroll-view scroll-y class="flex-1 w-full" :enable-back-to-top="true">
      
      <!-- Loading State -->
      <view v-if="loading" class="flex flex-col items-center pt-24">
        <view class="animate-spin w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full"></view>
        <text class="text-xs text-slate-400 mt-4">加载中...</text>
      </view>

      <view v-else class="p-4 flex flex-col gap-3">
        
        <!-- Service Cards -->
        <template v-for="(service, sIdx) in (filteredServices || [])" :key="service.id || sIdx">
          <view 
              class="daowei-card bg-white active-opacity"
              style="display: flex !important; flex-direction: row !important; padding: 14px !important; gap: 14px !important; background-color: #ffffff !important; border-radius: 24px !important; box-shadow: 0 8px 30px rgba(0,0,0,0.04) !important; margin-bottom: 4px !important;"
              @click="handleServiceClick(service)"
              v-if="service"
          >
              <!-- Left: Image & Badges -->
              <view class="relative w-24 h-24 shrink-0">
                  <image 
                      :src="getServiceImage(service)" 
                      mode="aspectFill" 
                      class="w-full h-full rounded-xl bg-slate-100" 
                  />
                  <view class="absolute bottom-1.5 left-1.5 flex flex-col gap-0.5">
                      <view class="bg-white/95 px-1 rounded flex flex-row items-center border border-slate-50">
                          <AppIcon name="clock" :size="7" color="#475569" style="margin-right: 2px;"/>
                          <text style="font-size: 8px; font-weight: 800; color: #475569;">准时到</text>
                      </view>
                  </view>
              </view>

              <!-- Right: Information -->
              <view class="flex-1 flex flex-col justify-between py-1 min-w-0 h-full">
                  <view>
                      <view class="flex flex-row items-center gap-1.5 mb-1.5">
                          <view class="bg-black px-1.5 py-0.5 rounded-sm shrink-0 flex items-center justify-center">
                              <text class="text-white font-bold tracking-wider" style="font-size: 9px;">直选</text>
                          </view>
                          <text class="flex-1 text-base font-bold text-slate-900 truncate">{{ service.name || service.title || '服务项目' }}</text>
                          
                          <!-- Optional: Right Side Badge (e.g. Fastest arrival) -->
                          <view class="bg-red-50 px-1.5 py-0.5 rounded flex items-center justify-center" v-if="service.fastestArrival">
                              <text class="text-red-500 font-medium" style="font-size: 9px;">最快明日8点</text>
                          </view>
                      </view>
                      
                      <text class="text-xs text-slate-500 line-clamp-1 mb-3 leading-relaxed">
                          {{ service.description || '专业团队 • 全屋清洁 • 包含工具' }}
                      </text>

                      <!-- Tags Row (Optional) -->
                      <view class="flex flex-row items-center gap-3 mb-2">
                          <view class="flex flex-row items-center gap-1">
                              <AppIcon name="tool" :size="10" color="#94a3b8"/>
                              <text class="text-xs text-slate-500">含工具</text>
                          </view>
                          <view class="flex flex-row items-center gap-1">
                              <AppIcon name="clock" :size="10" color="#94a3b8"/>
                              <text class="text-xs text-slate-500">准时到</text>
                          </view>
                      </view>
                  </view>
                  
                  <view class="flex flex-row items-center justify-between mt-1">
                      <view class="flex flex-row items-baseline">
                          <text class="text-3xl font-black text-rose-500 leading-none">{{ service.price || '99' }}</text>
                          <text class="text-xs font-bold text-rose-500 ml-0.5">元/{{ service.unit || '次' }}</text>
                      </view>
                      
                      <view class="flex flex-col items-end gap-0.5">
                          <text class="text-xs text-slate-400">已售{{ getSalesCount(service) }}+ 好评98%</text>
                          <view class="flex flex-row items-center">
                              <text class="text-xs font-bold text-blue-600">到位直选</text>
                              <AppIcon name="chevron-right" :size="10" color="#2563eb"/>
                          </view>
                      </view>
                  </view>
              </view>
          </view>
        </template>

        <!-- Empty State -->
        <view v-if="!filteredServices || filteredServices.length === 0" class="flex flex-col items-center pt-32 gap-4">
           <AppIcon name="clipboard" :size="64" color="#f1f5f9"/>
           <text class="text-slate-300 font-bold text-sm">该分类暂无可用服务</text>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import AppIcon from './Icons.vue';
import { servicesApi, formTemplatesApi } from '@/services/api';

const props = withDefaults(defineProps<{
  categoryName: string;
  currentCity?: string;
  mode?: 'all' | 'standard' | 'custom';
}>(), {
  mode: 'all',
  categoryName: '服务分类'
});

const emit = defineEmits(['back', 'service-click', 'template-click']);

// --- 1. State & Metrics ---
const loading = ref(true);
const activeTab = ref('all');
const standardServices = ref<any[]>([]);
const customTemplates = ref<any[]>([]);
const isSearching = ref(false);
const searchQuery = ref('');

const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

// --- 2. Logic & Methods ---
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

const toggleSearch = () => {
    isSearching.value = !isSearching.value;
    if (!isSearching.value) searchQuery.value = '';
};

const goHome = () => {
    uni.reLaunch({ url: '/pages/index/index' });
};

const filteredServices = computed(() => {
    let result: any[] = [];
    const safeTemplates = customTemplates.value || [];
    const safeStandards = standardServices.value || [];

    if (activeTab.value === 'all') {
        result = [...safeTemplates, ...safeStandards];
    } else {
        const templates = safeTemplates.filter(t => t && t.id === activeTab.value);
        const selectedTemplate = safeTemplates.find(t => t && t.id === activeTab.value);
        const standards = safeStandards.filter(s => {
            if (!s) return false;
            if (s.templateId === activeTab.value) return true;
            if (selectedTemplate && s.category === selectedTemplate.name) return true;
            return false;
        });
        result = [...templates, ...standards];
    }

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(s => 
            (s.name || s.title || '').toLowerCase().includes(query) ||
            (s.description || '').toLowerCase().includes(query)
        );
    }
    return result;
});

const fetchData = async () => {
  loading.value = true;
  try {
    const isAll = !props.categoryName || props.categoryName === '全部服务' || props.categoryName === '服务分类';
    const catParam = isAll ? undefined : props.categoryName;

    const standardRes = await servicesApi.getOfferings({ city: props.currentCity || '', category: catParam });
    standardServices.value = standardRes?.services || [];

    const customRes = await formTemplatesApi.getPublished(undefined, catParam);
    customTemplates.value = (customRes?.templates || []).filter(
      (t: any) => t && ['custom', 'complex'].includes(t.type) && t.status === 'published'
    );
  } catch (error) {
    console.error('Failed to fetch category data:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => [props.categoryName, props.currentCity], () => {
  if (props.categoryName) fetchData();
}, { immediate: true });

onMounted(() => {
  initHeaderMetrics();
});

const handleServiceClick = (service: any) => {
    if (!service) return;
    if (service.type) {
        emit('template-click', service);
    } else {
        emit('service-click', service);
    }
};

const getSalesCount = (service: any) => {
  if (!service?.id) return 1000;
  const idStr = String(service.id);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) hash += idStr.charCodeAt(i);
  return (hash % 10) * 1000 + 1000;
};

const getServiceImage = (service: any) => {
    if (!service) return '';
    if (service.images?.[0]) return service.images[0];
    if (service.icon) return service.icon;
    const defaults: Record<string, string> = {
        '保洁': 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300',
        '搬家': 'https://images.unsplash.com/photo-1600518464441-9154a4dba246?auto=format&fit=crop&w=300',
        '维修': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=300'
    };
    for (const key of Object.keys(defaults)) {
        if ((service.name || service.title || '')?.includes(key)) return defaults[key];
    }
    return 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=300';
};

const getIconName = (name: string) => {
  if (!name) return 'clipboard';
  const iconMap: Record<string, string> = {
    '搬家': 'truck', '清洁': 'sparkles', '保洁': 'sparkles', '维修': 'wrench',
    '接送': 'car', '安装': 'settings', '疏通': 'tool', '月嫂': 'heart',
  };
  for (const key of Object.keys(iconMap)) {
    if (name.includes(key)) return iconMap[key];
  }
  return 'clipboard';
};
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background-color: #f8fafc;
    overflow: hidden;
}

.premium-header {
    flex-shrink: 0;
    z-index: 100;
}

.active-opacity:active { opacity: 0.7; }

.line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.w-13 { width: 52px; }
.h-13 { height: 52px; }
.text-xs-13 { font-size: 13px; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }

/* Hide scrollbar */
::-webkit-scrollbar { display: none; width: 0; height: 0; background: transparent; }
</style>
