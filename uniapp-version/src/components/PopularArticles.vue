<template>
  <view class="px-4 pb-6 mt-4 md-px-8">
      <view class="flex items-center justify-between mb-2 px-1">
          <view class="flex items-center gap-2">
              <view class="w-1 h-4 rounded-full" style="background-color: #3D8E63;"></view>
              <text class="text-base font-bold text-gray-900">热门文章</text>
          </view>
          <view @click="$emit('view-article', { slug: 'all' })" class="text-xs text-gray-400 flex items-center gap-1 cursor-pointer active-opacity-60">
              <text>更多</text>
              <text class="chevron-icon">›</text>
          </view>
      </view>

      <view style="display: flex !important; flex-direction: column !important; gap: 16px !important; margin-bottom: 24px !important;">
          <view 
              v-for="article in (formattedArticles || [])" 
              :key="article.id" 
              style="width: auto !important; margin: 0 4px 0 4px !important; background-color: #ffffff !important; border-radius: 24px !important; padding: 20px !important; border: 1px solid rgba(255,255,255,0.8) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.06) !important; display: flex !important; flex-direction: column !important; min-height: 140px !important; box-sizing: border-box !important;"
              @click="$emit('article-click', article)"
          >
              <view>
                  <view class="flex justify-between items-start mb-2">
                       <text class="text-xs font-bold rounded" style="color: #3D8E63; background-color: #F5F7FA; border: 1px solid #e2e8f0; padding: 2px 8px;">
                          {{ article.tag || getLabel(article.category) }}
                       </text>
                  </view>
                  <text class="font-bold text-gray-900 text-lg line-clamp-2 leading-relaxed block" style="font-size: 16px !important; color: #1e293b !important; margin-bottom: 6px !important;">
                      {{ article.title }}
                  </text>
                  <text class="text-xs text-gray-500 line-clamp-2 block leading-relaxed" style="color: #64748b !important;">
                      {{ article.summary || article.desc || '由优服佳认证服务商提供的专业优质服务。' }}
                  </text>
              </view>
               <view style="display: flex !important; flex-direction: row !important; align-items: center !important; margin-top: 12px !important; color: #94a3b8 !important;">
                   <AppIcon name="file-text" :size="12" style="margin-right: 4px !important;" />
                   <text class="text-xs font-medium" style="font-size: 11px !important;">{{ article.views || 0 }} 阅读</text>
               </view>
          </view>
      </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { cmsApi } from '@/services/api';

const emit = defineEmits(['article-click', 'view-article']);

const articles = ref<any[]>([]);

// Fallback data if API fails or initially
const fallbackArticles = [
  {
      id: 1,
      title: '如何选择靠谱的维修师傅？',
      desc: '拒绝踩坑！这3点关键资质一定要看...',
      views: '2.3w',
      category: 'guide'
  },
  {
      id: 2,
      title: '家电清洗频率大揭秘',
      desc: '洗衣机不洗比马桶还脏？专家建议...',
      views: '1.5w',
      category: 'health'
  }
];

// Fetch from API
const fetchPopularArticles = async () => {
    try {
        const res = await cmsApi.getArticles({ type: 'article', sort: 'views', limit: 4 });
        if (res.articles && res.articles.length > 0) {
            articles.value = res.articles;
        }
    } catch (e) {
        console.error('Failed to fetch articles');
    }
};

const formattedArticles = computed(() => {
    return articles.value.length > 0 ? articles.value : fallbackArticles;
});

const getLabel = (key: string) => {
    const map: any = {
        'guide': '避坑指南',
        'health': '健康生活',
        'real_estate': '房产百科',
        'news': '行业资讯'
    };
    return map[key] || '文章';
}

onMounted(() => {
    fetchPopularArticles();
});
</script>

<style scoped>
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.flex-col { flex-direction: column; }

.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.gap-3 { gap: 12px; }

.bg-white { background-color: #ffffff; }
.bg-orange-400 { background-color: #fb923c; }
.bg-orange-50 { background-color: #fff7ed; }
.text-gray-900 { color: #111827; }
.text-gray-600 { color: #4b5563; }
.text-orange-500 { color: #f97316; }
.text-white { color: #ffffff; }

.border { border-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.border-orange-100 { border-color: #ffedd5; }

.shadow-custom { box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

.px-4 { padding-left: 16px; padding-right: 16px; }
.pb-6 { padding-bottom: 24px; }
.mt-4 { margin-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.p-3 { padding: 12px; }
.p-4 { padding: 20px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.py-half { padding-top: 2px; padding-bottom: 2px; }
.gap-2 { gap: 8px; }
.gap-half { gap: 2px; }
.gap-1 { gap: 4px; }

.w-1 { width: 4px; }
.h-5 { height: 20px; }
.h-40 { height: 160px; }

.rounded-full { border-radius: 9999px; }
.rounded-xl { border-radius: 16px; }
.rounded { border-radius: 4px; }

.text-xl { font-size: 20px; }
.text-lg { font-size: 17px; }
.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.font-bold { font-weight: 700; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
.active-scale-98:active { transform: scale(0.98); }
</style>
