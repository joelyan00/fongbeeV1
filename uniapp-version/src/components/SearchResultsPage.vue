<template>
  <view class="search-results-page bg-slate-50">
    <!-- Sophisticated Header -->
    <view class="search-header pt-custom bg-white">
      <view class="header-content flex flex-row items-center px-4">
        <view @click="emit('back')" class="back-btn active-opacity">
          <AppIcon name="chevron-left" :size="26" class="text-slate-900" />
        </view>
        <view class="search-bar-inner flex-1 flex flex-row items-center px-4 py-2 bg-slate-100 rounded-lg ml-2">
          <AppIcon name="search" :size="18" class="text-slate-400 mr-2" />
          <input 
            type="text" 
            v-model="localQuery" 
            class="flex-1 text-sm text-slate-900" 
            placeholder="搜索服务..."
            confirm-type="search"
            @confirm="handleSearch"
          />
          <view v-if="localQuery" @click="localQuery = ''" class="ml-2">
            <AppIcon name="x" :size="16" class="text-slate-400" />
          </view>
        </view>
      </view>
    </view>

    <!-- Results Area -->
    <scroll-view scroll-y class="results-container">
      <view v-if="loading" class="loading-state">
        <view class="spinner-dot"></view>
        <text class="loading-text">正在加载中...</text>
      </view>

      <view v-else-if="results.length > 0 || articleResults.length > 0" class="results-scroll-content">
        <!-- Services Section -->
        <view v-if="results.length > 0" class="service-list bg-white">
          <view class="section-header px-4 py-2 bg-slate-50 flex flex-row items-center">
            <AppIcon name="grid" :size="12" class="text-slate-400 mr-2" />
            <text class="text-xs font-bold text-slate-400">推荐服务</text>
          </view>
          
          <view 
            v-for="service in results" 
            :key="service.id" 
            class="daowei-card bg-white active-opacity"
            @click="handleServiceClick(service)"
          >
            <!-- Left: Image & Badges -->
            <view class="card-left">
              <image :src="getServiceImage(service)" mode="aspectFill" class="service-img rounded-lg" />
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
                        <view :class="service.type ? 'custom-badge' : 'zhixuan-badge'">
                          {{ service.type ? '定制服务' : '标准服务' }}
                        </view>
                        <text class="service-title truncate">{{ service.title || service.name }}</text>
                        <view class="eta-label">最快上门 今天10点</view>
                    </view>
                    <text class="service-desc truncate-2">
                        {{ service.description || '专业服务团队，品质保障，满意为止。价格透明，无额外加费。' }}
                    </text>
                </view>
                
                <view class="card-footer">
                    <view class="price-container">
                        <view class="price-row">
                            <text class="price-val">{{ service.price || '0' }}</text>
                            <text class="price-unit">元/{{ service.unit || '次' }}</text>
                        </view>
                        <text class="direct-link">到位直选 ></text>
                    </view>

                    <view class="stats-row">
                        <text class="stat-text">已售{{ getSalesCount(service) }}+</text>
                        <text class="stat-text">好评{{ 95 + (getSalesCount(service) % 5) }}%</text>
                    </view>
                </view>
            </view>
          </view>
        </view>

        <!-- Articles Section -->
        <view v-if="articleResults.length > 0" class="article-list bg-slate-50 mt-2 px-4 py-4">
          <view class="section-header mb-3 flex flex-row items-center">
            <AppIcon name="book-open" :size="14" class="text-slate-400 mr-2" />
            <text class="text-sm font-bold text-slate-500">百科资讯</text>
          </view>
          
          <view 
            v-for="article in articleResults" 
            :key="article.id" 
            class="article-full-card bg-white rounded-2xl p-5 mb-4 shadow-sm active-opacity"
            @click="emit('articleClick', article)"
          >
            <!-- Top Badge -->
            <view class="article-category-badge mb-3">
              <text class="category-badge-text">{{ getArticleCategory(article) }}</text>
            </view>
            
            <!-- Content Body -->
            <text class="article-full-title text-lg font-bold text-slate-900 block mb-2">{{ article.title }}</text>
            <text class="article-full-summary text-sm text-slate-500 line-clamp-2">{{ article.summary || article.content?.replace(/<[^>]*>/g, '').substring(0, 80) }}...</text>
            
            <!-- Footer Meta -->
            <view class="article-full-footer flex flex-row items-center mt-6">
              <AppIcon name="file-text" :size="16" class="text-slate-300 mr-2" />
              <text class="text-sm text-slate-400 font-medium">{{ getArticleViews(article) }} 阅读</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-else class="empty-state px-6 pt-20">
        <view class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <AppIcon name="search" :size="40" class="text-slate-200" />
        </view>
        <text class="text-slate-900 font-bold text-lg mb-2">未找到匹配的结果</text>
        <text class="text-slate-400 text-sm text-center mb-10">没找到您想要的？没关系，您可以发布定制需求，让服务商为您专属定制。</text>
        
        <view 
          class="custom-req-btn bg-[#3D8E63] rounded-xl w-full py-4 flex flex-row items-center justify-center active-opacity shadow-lg"
          @click="emit('publishCustom')"
        >
          <AppIcon name="edit-3" :size="20" color="#fff" class="mr-2" />
          <text class="text-white font-bold text-base">发布定制需求</text>
        </view>
      </view>
      
      <view class="h-20"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import AppIcon from './Icons.vue';
import { servicesApi, formTemplatesApi, cmsApi } from '@/services/api';

const props = defineProps<{
  query: string;
  currentCity: string;
}>();

const emit = defineEmits(['back', 'serviceClick', 'publishCustom', 'articleClick']);

const localQuery = ref(props.query);
const loading = ref(false);
const results = ref<any[]>([]);
const articleResults = ref<any[]>([]);

const performSearch = async () => {
    if (!localQuery.value.trim()) {
        results.value = [];
        articleResults.value = [];
        return;
    }
    
    loading.value = true;
    try {
        const [standardRes, customRes, cmsRes] = await Promise.all([
            servicesApi.getOfferings({ city: props.currentCity }),
            formTemplatesApi.getPublished(),
            cmsApi.getArticles({ status: 'published', limit: 50 })
        ]);
        
        const q = localQuery.value.toLowerCase();
        
        // 1. Process Standard Services
        const standardList = (standardRes.services || []).filter((s: any) => 
            (s.title || '').toLowerCase().includes(q) || 
            (s.description || '').toLowerCase().includes(q) ||
            (s.category || '').toLowerCase().includes(q)
        );

        // 2. Process Custom Templates
        const customList = (customRes.templates || []).filter((t: any) => 
            ['custom', 'complex'].includes(t.type) && 
            t.status === 'published' &&
            ((t.name || '').toLowerCase().includes(q) || 
             (t.description || '').toLowerCase().includes(q) ||
             (t.service_category || '').toLowerCase().includes(q))
        );

        // 3. Process Articles
        articleResults.value = (cmsRes.articles || []).filter((a: any) =>
            (a.title || '').toLowerCase().includes(q) ||
            (a.content || '').toLowerCase().includes(q) ||
            (a.summary || '').toLowerCase().includes(q)
        );

        results.value = [...customList, ...standardList];
    } catch (e) {
        console.error('Search failed', e);
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    performSearch();
};

const handleServiceClick = (service: any) => {
    emit('serviceClick', service);
};

const getSalesCount = (service: any) => {
  const idStr = String(service.id || '0');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash += idStr.charCodeAt(i);
  }
  return (hash % 10) * 500 + 500;
};

const getArticleViews = (article: any) => {
  const idStr = String(article.id || '0');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash += idStr.charCodeAt(i);
  }
  return (hash % 20 + 5) * 1000;
};

const getArticleCategory = (article: any) => {
  if (article.category_name) return article.category_name;
  const title = (article.title || '').toLowerCase();
  if (title.includes('家政')) return '家政百科';
  if (title.includes('房产')) return '房产百科';
  if (title.includes('避坑')) return '避坑指南';
  if (title.includes('健康')) return '健康生活';
  return '推荐阅读';
};

const getServiceImage = (service: any) => {
    if (service.image) return service.image;
    if (service.images?.[0]) return service.images[0];
    if (service.icon && (service.icon.startsWith('http') || service.icon.startsWith('/static'))) return service.icon;
    if (service.iconName && (service.iconName.startsWith('http') || service.iconName.startsWith('/static'))) return service.iconName;
    
    const name = (service.title || service.name || '').toLowerCase();
    const defaults: Record<string, string> = {
        '保洁': 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=200',
        '搬家': 'https://images.unsplash.com/photo-1600518464441-9154a4dba246?auto=format&fit=crop&q=80&w=200',
        '维修': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=200',
        '接送': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=200'
    };
    for (const key of Object.keys(defaults)) {
        if (name.includes(key)) return defaults[key];
    }
    return 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=200';
};

watch(() => props.query, (newVal) => {
    localQuery.value = newVal;
    performSearch();
});

onMounted(() => {
    performSearch();
});
</script>

<style scoped>
.search-results-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.search-header {
  border-bottom: 0.5px solid #f1f5f9;
}

.pt-custom {
  padding-top: env(safe-area-inset-top);
}

.header-content {
  height: 48px;
}

.results-container {
  flex: 1;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
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
    height: 90px;
}

.service-img {
    width: 90px;
    height: 90px;
    background-color: #f8fafc;
    border-radius: 8px;
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
    white-space: nowrap;
}

.custom-badge {
    background: linear-gradient(135deg, #3D8E63, #2A6B4A);
    color: #ffffff;
    font-size: 9px;
    font-weight: 900;
    padding: 1px 5px;
    border-radius: 4px;
    white-space: nowrap;
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
    white-space: nowrap;
}

.service-desc {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-bottom: 8px;
}

.card-footer {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
}

.price-container {
    display: flex;
    flex-direction: column;
}

.price-row {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    margin-bottom: 2px;
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

/* Redesigned Article Card Styling */
.article-list {
  background-color: #f8fafc;
}

.article-full-card {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
}

.article-category-badge {
  background-color: #fff7ed;
  padding: 4px 12px;
  border-radius: 6px;
  align-self: flex-start;
  display: inline-block;
}

.category-badge-text {
  font-size: 12px;
  font-weight: 800;
  color: #ea580c;
}

.article-full-title {
  font-size: 18px;
  line-height: 1.4;
  letter-spacing: -0.2px;
}

.article-full-summary {
  line-height: 1.6;
  color: #64748b;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
}

.active-opacity:active {
  opacity: 0.7;
}

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

/* Common Utilities */
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.flex-1 { flex: 1; }
.flex-shrink-0 { flex-shrink: 0; }
.min-w-0 { min-width: 0; }

.bg-white { background-color: #ffffff; }
.bg-slate-50 { background-color: #f8fafc; }
.bg-slate-100 { background-color: #f1f5f9; }
.bg-emerald-600 { background-color: #10b981; }

.rounded-lg { border-radius: 8px; }
.rounded-xl { border-radius: 12px; }
.rounded-2xl { border-radius: 16px; }
.rounded-full { border-radius: 9999px; }

.text-slate-900 { color: #0f172a; }
.text-slate-400 { color: #94a3b8; }
.text-slate-200 { color: #e2e8f0; }
.text-slate-300 { color: #cbd5e1; }
.text-slate-500 { color: #64748b; }

.ml-2 { margin-left: 8px; }
.mr-2 { margin-right: 8px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-10 { margin-bottom: 40px; }
.mt-2 { margin-top: 8px; }
.mt-6 { margin-top: 24px; }
.p-4 { padding: 16px; }
.p-5 { padding: 20px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.px-6 { padding-left: 24px; padding-right: 24px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }

.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-base { font-size: 16px; }
.text-lg { font-size: 18px; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
