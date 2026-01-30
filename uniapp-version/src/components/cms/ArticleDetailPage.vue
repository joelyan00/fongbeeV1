<template>
  <view class="article-detail-page" style="min-height: 100vh !important; background-color: #f9fafb !important; width: 100% !important;">
    <!-- Manual Navbar with Aggressive Inline Styles -->
    <view class="fixed-navbar" style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; z-index: 9999 !important; background-color: #ffffff !important; border-bottom: 0.5px solid #f1f5f9 !important;">
      <!-- Status Bar Spacer -->
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      
      <!-- Nav Content Row -->
      <view style="display: flex !important; flex-direction: row !important; align-items: center !important; position: relative !important; width: 100% !important; box-sizing: border-box !important;" :style="{ height: navBarHeight + 'px', paddingRight: (capsuleWidth + 16) + 'px' }">
        <!-- Back Button Area -->
        <view @click="$emit('back')" style="display: flex !important; align-items: center !important; justify-content: center !important; width: 44px !important; height: 100% !important; flex-shrink: 0 !important;">
          <AppIcon name="chevron-left" :size="24" color="#111827" />
        </view>
        
        <!-- Truly Centered Title -->
        <view style="position: absolute !important; left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) !important; display: flex !important; align-items: center !important; justify-content: center !important; width: 180px !important; pointer-events: none !important;">
          <text style="font-size: 17px !important; font-weight: 700 !important; color: #111827 !important; white-space: nowrap !important; text-align: center !important;">文章详情</text>
        </view>
      </view>
    </view>

    <!-- Spacer to push content below fixed navbar -->
    <view :style="{ height: (statusBarHeight + navBarHeight) + 'px' }"></view>

    <view v-if="loading" class="loading-container" style="padding-top: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <text class="loading-text" style="color: #9ca3af; font-size: 14px;">加载中...</text>
    </view>
    
    <view v-else-if="error" class="error-container" style="padding-top: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-left: 20px; padding-right: 20px;">
        <text class="error-text" style="color: #ef4444; font-size: 14px; text-align: center;">{{ error }}</text>
        <button class="retry-btn" @click="fetchArticle" style="margin-top: 16px; font-size: 14px; background-color: #f3f4f6; padding: 0 20px;">重试</button>
    </view>

    <!-- Card Wrapper -->
    <view v-else class="content-wrapper" style="padding: 16px; padding-top: 16px; padding-bottom: 80px;">
        <view class="article-card" style="background-color: #ffffff !important; border-radius: 16px !important; padding: 24px 20px !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important; width: 100% !important; box-sizing: border-box !important;">
           <text class="article-title" style="font-size: 24px !important; font-weight: 800 !important; color: #111827 !important; line-height: 1.4 !important; margin-bottom: 16px !important; display: block !important;">{{ article.title }}</text>
           
           <view class="article-meta" style="display: flex !important; align-items: center !important; gap: 12px !important; margin-bottom: 24px !important;">
               <text class="meta-tag" v-if="article.category || article.type === 'policy'" style="font-size: 12px !important; color: #f97316 !important; background-color: #fff7ed !important; padding: 2px 8px !important; border-radius: 4px !important;">{{ getLabel(article.category || article.type) }}</text>
               <text class="meta-date" style="font-size: 13px !important; color: #9ca3af !important;">{{ formatDate(article.updated_at || article.created_at) }}</text>
               <text class="meta-views" v-if="article.views" style="font-size: 13px !important; color: #9ca3af !important;">{{ article.views }} 阅读</text>
           </view>

           <image 
              v-if="article.cover_image" 
              :src="article.cover_image" 
              mode="widthFix" 
              class="cover-image"
              style="width: 100% !important; border-radius: 12px !important; margin-bottom: 24px !important; display: block !important;"
            />

           <!-- Rich Text Content -->
           <view class="rich-content" style="font-size: 17px !important; color: #374151 !important; line-height: 1.8 !important;">
               <rich-text :nodes="formatRichText(article.content)"></rich-text>
           </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { cmsApi } from '@/services/api';
import AppIcon from '@/components/Icons.vue';

const props = defineProps<{
    articleId?: number | string;
    articleSlug?: string;
}>();

const emit = defineEmits(['back']);

const article = ref<any>({});
const loading = ref(true);
const error = ref('');

// Header metrics
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);
const capsuleTop = ref(0);
const capsuleHeight = ref(32);

// Computed margin top for nav content to align with capsule
const navContentMarginTop = computed(() => {
    return Math.max(0, capsuleTop.value - statusBarHeight.value);
});

const initHeaderMetrics = () => {
    // #ifdef MP-WEIXIN
    // Use timeout to ensure API returns correct data in simulator
    setTimeout(() => {
        try {
            const sysInfo = uni.getSystemInfoSync();
            statusBarHeight.value = sysInfo.statusBarHeight || 44;
            const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
            capsuleWidth.value = menuButtonInfo.width;
            capsuleTop.value = menuButtonInfo.top;
            capsuleHeight.value = menuButtonInfo.height;
            // Proven formula from GlobalNavbar
            navBarHeight.value = (menuButtonInfo.top - statusBarHeight.value) * 2 + menuButtonInfo.height;
        } catch (e) {
            console.warn('Init header metrics failed', e);
        }
    }, 100);
    // #endif

    // #ifdef H5
    statusBarHeight.value = 0;
    navBarHeight.value = 54;
    capsuleWidth.value = 0;
    capsuleTop.value = 0;
    capsuleHeight.value = 32;
    // #endif
};

const fetchArticle = async () => {
    loading.value = true;
    error.value = '';
    try {
        let res;
        if (props.articleId) {
            res = await cmsApi.getArticleById(props.articleId);
        } else if (props.articleSlug) {
            res = await cmsApi.getArticleBySlug(props.articleSlug);
        } else {
            throw new Error('No article ID provided');
        }

        if (res && res.article) {
            article.value = res.article;
        } else {
            error.value = '文章加载失败';
        }
    } catch (e: any) {
        console.error(e);
        error.value = '无法连接到服务器';
    } finally {
        loading.value = false;
    }
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const getLabel = (key: string) => {
    const map: any = {
        'guide': '避坑指南',
        'health': '健康生活',
        'real_estate': '房产百科',
        'policy': '平台协议',
        'news': '行业资讯',
        '协议政策': '平台协议',
        'CMS': '内容管理'
    };
    return map[key] || key;
}

const formatRichText = (html: string) => {
    if (!html) return '';
    // Fix image styling for rich-text component
    return html.replace(/<img/g, '<img style="max-width:100%;height:auto;border-radius:8px;margin:10px 0;"');
}

onMounted(() => {
    initHeaderMetrics();
    fetchArticle();
});
</script>

<style scoped>
.article-detail-page {
    min-height: 100vh;
    background-color: #f9fafb;
}

/* Navbar Container - Fixed at top */
.navbar-container {
    width: 100%;
    background-color: #ffffff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    position: relative;
    box-sizing: border-box;
}

.nav-left {
    display: flex;
    align-items: center;
    min-width: 40px;
    height: 100%;
}

.back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.back-btn:active {
    opacity: 0.6;
}

.nav-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.nav-title {
    font-size: 17px;
    font-weight: 700;
    color: #111827;
    white-space: nowrap;
}

.loading-container, .error-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 100px;
}

.retry-btn {
    margin-top: 16px;
    font-size: 14px;
    background-color: #f3f4f6;
}

/* Content wrapper with visible background */
.content-wrapper {
    padding: 16px;
    padding-bottom: 80px;
}

/* Card style for article content - enhanced visibility */
.article-card {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 24px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.article-title {
    font-size: 24px;
    font-weight: 800;
    color: #111827;
    line-height: 1.4;
    margin-bottom: 16px;
    display: block;
}

.article-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
}

.meta-tag {
    font-size: 12px;
    color: #f97316;
    background-color: #fff7ed;
    padding: 2px 8px;
    border-radius: 4px;
}

.meta-date, .meta-views {
    font-size: 13px;
    color: #9ca3af;
}

.cover-image {
    width: 100%;
    border-radius: 12px;
    margin-bottom: 24px;
}

.rich-content {
    font-size: 17px;
    color: #374151;
    line-height: 1.8;
}
</style>
