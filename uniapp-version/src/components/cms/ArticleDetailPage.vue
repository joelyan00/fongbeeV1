<template>
  <view class="article-detail-page">
    <!-- Navbar -->
    <view class="navbar">
      <view class="nav-back" @click="$emit('back')">
         <text class="back-arrow">&lt;</text>
      </view>
      <text class="nav-title">文章详情</text>
      <view class="nav-placeholder"></view>
    </view>

    <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="error" class="error-container">
        <text class="error-text">{{ error }}</text>
        <button class="retry-btn" @click="fetchArticle">重试</button>
    </view>

    <scroll-view v-else scroll-y class="content-scroll">
       <view class="article-container">
           <text class="article-title">{{ article.title }}</text>
           
           <view class="article-meta">
               <text class="meta-tag" v-if="article.category || article.type === 'policy'">{{ getLabel(article.category || article.type) }}</text>
               <text class="meta-date">{{ formatDate(article.updated_at || article.created_at) }}</text>
               <text class="meta-views" v-if="article.views">{{ article.views }} 阅读</text>
           </view>

           <image 
              v-if="article.cover_image" 
              :src="article.cover_image" 
              mode="widthFix" 
              class="cover-image"
            />

           <!-- Rich Text Content -->
           <view class="rich-content">
               <rich-text :nodes="formatRichText(article.content)"></rich-text>
           </view>
       </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
    articleId?: number | string;
    articleSlug?: string;
}>();

const emit = defineEmits(['back']);

const article = ref<any>({});
const loading = ref(true);
const error = ref('');

const API_BASE = 'http://localhost:3001/api/cms'; // In real app, use config

const fetchArticle = async () => {
    loading.value = true;
    error.value = '';
    try {
        let url = API_BASE;
        if (props.articleId) {
            url += `/${props.articleId}`;
        } else if (props.articleSlug) {
            url += `/slug/${props.articleSlug}`;
        } else {
            throw new Error('No article ID provided');
        }

        const res = await uni.request({ url });
        if (res.statusCode === 200) {
            article.value = res.data.article;
        } else {
            error.value = '文章加载失败';
        }
    } catch (e) {
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
        'news': '行业资讯'
    };
    return map[key] || key;
}

const formatRichText = (html: string) => {
    if (!html) return '';
    // Fix image styling for rich-text component
    return html.replace(/<img/g, '<img style="max-width:100%;height:auto;border-radius:8px;margin:10px 0;"');
}

onMounted(() => {
    fetchArticle();
});
</script>

<style scoped>
.article-detail-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #ffffff;
    z-index: 100;
    display: flex;
    flex-direction: column;
}

.navbar {
    height: 44px;
    padding-top: env(safe-area-inset-top);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 16px;
    padding-right: 16px;
    border-bottom: 1px solid #f3f4f6;
    background-color: #ffffff;
}

.nav-back {
    width: 40px;
}
.back-arrow {
    font-size: 24px;
    font-weight: bold;
}
.nav-title {
    font-size: 18px;
    font-weight: 700;
}
.nav-placeholder {
    width: 40px;
}

.loading-container, .error-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.retry-btn {
    margin-top: 16px;
    font-size: 14px;
    background-color: #f3f4f6;
}

.content-scroll {
    flex: 1;
    height: 0; /* Important for flex-grow to work in scroll-view vertical */
}

.article-container {
    padding: 24px 20px;
    padding-bottom: 80px;
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
