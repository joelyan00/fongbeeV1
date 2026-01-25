<template>
  <view class="page-container bg-slate-50">
    <!-- Header: Explicit Flexbox -->
    <view class="premium-header bg-white">
        <view class="status-bar-height"></view>
        <view class="header-content">
            <view @click="emit('back')" class="back-btn active-opacity">
                <AppIcon name="chevron-left" :size="26" class="text-slate-900"/>
            </view>
            
            <view class="header-main">
                <text v-if="!isSearching" class="header-title">{{ categoryName }}</text>
                <view v-else class="search-input-wrap">
                    <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="搜索服务名称..." 
                        class="search-input"
                        confirm-type="search"
                        auto-focus
                    />
                    <view @click="toggleSearch" class="close-search">
                        <AppIcon name="x" :size="16" class="text-slate-400"/>
                    </view>
                </view>
            </view>
            
            <view class="header-actions">
                <view @click="toggleSearch" class="action-btn active-opacity">
                    <AppIcon name="search" :size="22" :class="isSearching ? 'text-red-500' : 'text-slate-700'"/>
                </view>
                <view @click="goHome" class="action-btn active-opacity">
                    <AppIcon name="home" :size="22" class="text-slate-700"/>
                </view>
                <view class="action-btn active-opacity">
                    <AppIcon name="more-horizontal" :size="22" class="text-slate-700"/>
                </view>
            </view>
        </view>
    </view>

    <!-- Sub-category Horizontal Scroll -->
    <view class="tab-section bg-white">
        <scroll-view scroll-x class="tab-scroll" :show-scrollbar="false">
            <view class="tab-inner">
                <!-- "All" Tab -->
                <view 
                    class="tab-item active-opacity"
                    @click="activeTab = 'all'"
                >
                    <view class="tab-icon-wrap" :class="{ 'active-bg': activeTab === 'all' }">
                        <AppIcon name="grid" :size="20" :class="activeTab === 'all' ? 'text-red-500' : 'text-slate-400'"/>
                    </view>
                    <text class="tab-label" :class="{ 'active-label': activeTab === 'all' }">全部服务</text>
                </view>

                <!-- Dynamic Tabs from Templates -->
                <view 
                    v-for="template in customTemplates" 
                    :key="template.id"
                    class="tab-item active-opacity"
                    @click="activeTab = template.id"
                >
                    <view class="tab-icon-wrap" :class="{ 'active-bg': activeTab === template.id }">
                        <AppIcon :name="getIconName(template.name)" :size="20" :class="activeTab === template.id ? 'text-red-500' : 'text-slate-400'"/>
                    </view>
                    <text class="tab-label" :class="{ 'active-label': activeTab === template.id }">{{ template.name }}</text>
                </view>
            </view>
        </scroll-view>
    </view>

    <!-- Content Area -->
    <scroll-view scroll-y class="content-scroll">
      
      <!-- Loading State -->
      <view v-if="loading" class="loading-state">
        <view class="spinner-dot"></view>
        <text class="loading-text">Loading Services</text>
      </view>

      <view v-else class="service-list">
        
        <!-- Unified High-Density List -->
        <view 
            v-for="service in filteredServices" 
            :key="service.id" 
            class="daowei-card bg-white active-opacity"
            @click="handleServiceClick(service)"
        >
            <!-- Left: Image & Badges -->
            <view class="card-left">
                <image 
                    :src="getServiceImage(service)" 
                    mode="aspectFill" 
                    class="service-img rounded-lg" 
                />
                <view class="badge-overlay">
                    <view class="mini-tag">
                        <AppIcon name="wrench" :size="7" class="mini-icon"/>
                        <text>含工具</text>
                    </view>
                    <view class="mini-tag">
                        <AppIcon name="clock" :size="7" class="mini-icon"/>
                        <text>准时到</text>
                    </view>
                </view>
            </view>

            <!-- Right: Information -->
            <view class="card-right">
                <view class="card-header">
                    <view class="header-top">
                        <view class="zhixuan-badge">直选</view>
                        <text class="service-title">{{ service.name || service.title }}</text>
                        <view class="eta-label">最快明日8点</view>
                    </view>
                    <text class="service-desc">
                        {{ service.description || '由专业团队提供的高品质上门服务，流程透明，售后保障。' }}
                    </text>
                </view>
                
                <view class="card-footer">
                    <view class="price-container">
                        <view class="price-row">
                            <text class="price-val">{{ service.price || '49' }}</text>
                            <text class="price-unit">元/{{ service.unit || (service.type ? '次' : '小时') }}</text>
                        </view>
                        <text class="direct-link">到位直选 ></text>
                    </view>

                    <view class="stats-row">
                        <text class="stat-text">已售{{ getSalesCount(service) }}+</text>
                        <text class="stat-text">好评98%</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- Empty State -->
        <view v-if="filteredServices.length === 0" class="empty-state">
           <AppIcon name="clipboard" :size="48" class="empty-icon"/>
           <text class="empty-text">No services available</text>
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

const loading = ref(true);
const activeTab = ref('all');
const standardServices = ref<any[]>([]);
const customTemplates = ref<any[]>([]);

// Search state
const isSearching = ref(false);
const searchQuery = ref('');

const toggleSearch = () => {
    isSearching.value = !isSearching.value;
    if (!isSearching.value) searchQuery.value = '';
};

const goHome = () => {
    uni.reLaunch({
        url: '/pages/index/index'
    });
};

const filteredServices = computed(() => {
    let result: any[] = [];
    if (activeTab.value === 'all') {
        result = [...customTemplates.value, ...standardServices.value];
    } else {
        // 1. Get matching custom templates
        const templates = customTemplates.value.filter(t => t.id === activeTab.value);
        
        // 2. Get matching standard services
        const selectedTemplate = customTemplates.value.find(t => t.id === activeTab.value);
        const standards = standardServices.value.filter(s => {
            // Match by explicit templateId
            if (s.templateId === activeTab.value) return true;
            // Match by category name if the template name matches the service category
            if (selectedTemplate && s.category === selectedTemplate.name) return true;
            return false;
        });
        
        result = [...templates, ...standards];
    }

    // Apply search query filter if active
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
    // If categoryName is "All Services", fetch everything without filter
    const isAll = !props.categoryName || props.categoryName === '全部服务' || props.categoryName === '服务分类';
    const catParam = isAll ? undefined : props.categoryName;

    const standardRes = await servicesApi.getOfferings({ 
      city: props.currentCity || '', 
      category: catParam
    });
    standardServices.value = standardRes.services || [];

    const customRes = await formTemplatesApi.getPublished(undefined, catParam);
    customTemplates.value = (customRes.templates || []).filter(
      (t: any) => ['custom', 'complex'].includes(t.type) && t.status === 'published'
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
  if (props.categoryName) fetchData();
});

const handleServiceClick = (service: any) => {
    if (service.type) {
        emit('template-click', service);
    } else {
        emit('service-click', service);
    }
};

const getSalesCount = (service: any) => {
  const idStr = String(service.id);
  // Hash string to number for consistent-ish sales count
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash += idStr.charCodeAt(i);
  }
  return (hash % 10) * 1000 + 1000;
};

const getServiceImage = (service: any) => {
    if (service.images?.[0]) return service.images[0];
    if (service.icon) return service.icon;
    const defaults: Record<string, string> = {
        '保洁': 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=200',
        '搬家': 'https://images.unsplash.com/photo-1600518464441-9154a4dba246?auto=format&fit=crop&q=80&w=200',
        '维修': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=200'
    };
    for (const key of Object.keys(defaults)) {
        if ((service.name || service.title)?.includes(key)) return defaults[key];
    }
    return 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=200';
};

const getIconName = (name: string) => {
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
    min-height: 100vh;
}

/* Redefine critical layout utilities to bypass Tailwind issues */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.flex-1 { flex: 1; }
.shrink-0 { flex-shrink: 0; }
.bg-white { background-color: #ffffff; }
.bg-slate-50 { background-color: #f8fafc; }

/* Header Component */
.premium-header {
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom: 0.5px solid #f1f5f9;
}
.status-bar-height {
    height: env(safe-area-inset-top);
}
.header-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 48px;
    padding: 0 16px;
}
.back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -4px;
    flex-shrink: 0;
}
.header-main {
    flex: 1;
    margin-left: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: center;
}
.header-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.search-input-wrap {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #f1f5f9;
    padding: 4px 12px;
    border-radius: 8px;
    margin-right: 8px;
}
.search-input {
    flex: 1;
    font-size: 14px;
    color: #0f172a;
    height: 24px;
}
.close-search {
    padding: 4px;
    margin-left: 4px;
}
.header-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}
.action-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Tab System */
.tab-section {
    border-bottom: 0.5px solid #f1f5f9;
    padding: 12px 0;
}
.tab-scroll {
    width: 100%;
    white-space: nowrap;
}
.tab-inner {
    display: flex;
    flex-direction: row;
    padding: 0 16px;
    gap: 24px;
}
.tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}
.tab-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background-color: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0.5px solid #f1f5f9;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.active-bg {
    background-color: #fff1f2;
    border-color: #fecaca;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);
}
.tab-label {
    font-size: 11px;
    color: #64748b;
}
.active-label {
    color: #ef4444;
    font-weight: bold;
}

/* Content Area */
.content-scroll {
    flex: 1;
    width: 100%;
}
.service-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding-top: 8px;
}

/* Card Component */
.daowei-card {
    display: flex;
    flex-direction: row;
    padding: 16px;
    gap: 16px;
    border-bottom: 0.5px solid #f8fafc;
}
.card-left {
    position: relative;
    width: 90px;
}
.service-img {
    width: 90px;
    height: 90px;
    background-color: #f8fafc;
}
.badge-overlay {
    position: absolute;
    bottom: 6px;
    left: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.mini-tag {
    font-size: 8px;
    font-weight: 800;
    padding: 2px 4px;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.95);
    color: #475569;
    border: 0.5px solid #f1f5f9;
}
.mini-icon { margin-right: 2px; }

.card-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2px 0;
    min-width: 0;
}
.header-top {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
}
.zhixuan-badge {
    background: linear-gradient(135deg, #45423c, #1a1a1a);
    color: #f8e1c3;
    font-size: 9px;
    font-weight: 900;
    padding: 1px 5px;
    border-radius: 4px;
    letter-spacing: 0.5px;
}
.service-title {
    flex: 1;
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.eta-label {
    color: #ef4444;
    font-size: 9px;
    font-weight: 900;
    border: 1px solid #fee2e2;
    padding: 1px 5px;
    border-radius: 4px;
    background-color: #fef2f2;
}
.service-desc {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-bottom: 12px;
}

.card-footer {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
}
.price-row {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    margin-bottom: 4px;
}
.price-val {
    font-size: 18px;
    font-weight: 700;
    color: #ef4444;
}
.price-unit {
    font-size: 11px;
    font-weight: 700;
    color: #ef4444;
    margin-left: 2px;
}
.direct-link {
    font-size: 10px;
    color: #cbd5e1;
    font-weight: 700;
}
.stats-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
}
.stat-text {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 600;
}

/* States */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 160px 0;
    gap: 16px;
}
.spinner-dot {
    width: 32px;
    height: 32px;
    border: 3px solid #f1f5f9;
    border-top: 3px solid #ef4444;
    border-radius: 50%;
    animation: rotate 0.8s infinite linear;
}
@keyframes rotate { to { transform: rotate(360deg); } }

.loading-text {
    font-size: 10px;
    font-weight: 700;
    color: #cbd5e1;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 160px 0;
}
.empty-icon { color: #f1f5f9; margin-bottom: 16px; }
.empty-text {
    font-size: 12px;
    font-weight: 700;
    color: #cbd5e1;
    text-transform: uppercase;
}

.active-opacity:active { opacity: 0.7; }
.rounded-lg { border-radius: 8px; }
</style>
