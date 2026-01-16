<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header-light pt-safe">
       <view class="header-row">
         <view @click="goBack" class="header-back"><AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" /></view>
         <text class="header-title">我的评价</text>
         <view class="header-placeholder"></view>
       </view>
    </view>

    <!-- Tabs -->
    <view class="tabs" style="top: calc(env(safe-area-inset-top) + 56px);">
        <view class="tab-item" :class="{'tab-active': activeTab==='standard'}" @click="activeTab='standard'">
            标准服务
        </view>
        <view class="tab-item" :class="{'tab-active': activeTab==='custom'}" @click="activeTab='custom'">
            定制服务
        </view>
    </view>

    <!-- List -->
    <view class="content-area">
        <view v-if="loading" class="loading-state">
            <view class="spinner"></view>
            <text class="loading-text">加载评价中...</text>
        </view>

        <view v-else-if="reviews.length === 0" class="empty-state">
            <AppIcon name="message-circle" :size="48" color="#d1d5db" />
            <text class="empty-text">暂无评价记录</text>
        </view>

        <view v-else v-for="review in reviews" :key="review.id" class="review-card">
             <view class="review-header">
                 <image v-if="review.serviceImage" :src="review.serviceImage" class="service-image" mode="aspectFill" />
                 <view v-else class="service-image-placeholder">
                     <AppIcon name="hammer" :size="24" color="#cbd5e1" />
                 </view>
                 <view class="review-info">
                     <text class="service-name">{{ review.serviceName }}</text>
                     <text class="review-date">{{ review.date }}</text>
                 </view>
             </view>
             
             <view class="rating-stars">
                 <AppIcon v-for="i in 5" :key="i" name="star" :size="16" :color="i <= review.rating ? '#10b981' : '#d1d5db'" />
             </view>

             <text class="review-content">{{ review.content }}</text>
             
             <view v-if="review.images && review.images.length" class="review-images">
                 <image 
                   v-for="(img, idx) in review.images" 
                   :key="idx" 
                   :src="img" 
                   class="review-img" 
                   mode="aspectFill"
                   @click="previewImages(review.images, idx)"
                 />
             </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { getToken, API_BASE_URL } from '@/services/api';

const safeAreaTop = ref(0);
const activeTab = ref('standard');
const allReviews = ref<any[]>([]);
const loading = ref(true);

const fetchReviews = async () => {
    loading.value = true;
    try {
        const res: any = await uni.request({
            url: `${API_BASE_URL}/users/me/reviews`,
            method: 'GET',
            header: { Authorization: `Bearer ${getToken()}` }
        });
        allReviews.value = res.data?.reviews || [];
    } catch (e) {
        console.error('Fetch reviews error:', e);
    } finally {
        loading.value = false;
    }
};

const reviews = computed(() => {
    if (activeTab.value === 'standard') {
        // Standard reviews are those with order_no / service details
        return allReviews.value.filter(r => r.id && r.serviceName !== '旧订单服务');
    } else {
        // Others or specifically marked as legacy
        return allReviews.value.filter(r => r.serviceName === '旧订单服务');
    }
});

onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
    fetchReviews();
});

const goBack = () => uni.navigateBack();

const previewImages = (urls: string[], current: any) => {
    uni.previewImage({ urls, current });
};
</script>

<style scoped>
.page-container {
    background-color: #f9fafb;
    min-height: 100vh;
    padding-bottom: 40px;
}
.header-light {
    background: #ffffff;
    padding-left: 16px;
    padding-right: 16px;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid #f3f4f6;
}
.header-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 56px;
}
.header-back {
    width: 40px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: 6px;
}
.header-title {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
    line-height: 56px;
}
.header-placeholder {
    width: 40px;
}
.pt-safe {
    padding-top: env(safe-area-inset-top);
}
.tabs {
    display: flex;
    flex-direction: row;
    background-color: #fff;
    border-bottom: 1px solid #f3f4f6;
    position: sticky;
    z-index: 10;
}
.tab-item {
    flex: 1;
    text-align: center;
    padding-top: 12px;
    padding-bottom: 16px;
    border-bottom: 2px solid transparent;
    color: #6b7280;
    font-size: 14px;
}
.tab-active {
    border-bottom-color: #059669;
    color: #059669;
    font-weight: bold;
}
.content-area {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.review-card {
    background-color: #fff;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.review-header {
    display: flex;
    flex-direction: row;
    gap: 12px;
    margin-bottom: 12px;
}
.service-image {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background-color: #f3f4f6;
}
.review-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.service-name {
    font-size: 14px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 4px;
}
.review-date {
    font-size: 12px;
    color: #6b7280;
}
.rating-stars {
    display: flex;
    flex-direction: row;
    gap: 4px;
    margin-bottom: 8px;
}
.review-content {
    font-size: 14px;
    color: #374151;
    line-height: 1.6;
    margin-bottom: 12px;
    display: block;
}
.review-images {
    display: flex;
    flex-direction: row;
    gap: 8px;
    margin-top: 8px;
}
.review-img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    background-color: #f9fafb;
}
.service-image-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background-color: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
}
.loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 100px;
}
.loading-text, .empty-text {
    margin-top: 12px;
    font-size: 14px;
    color: #9ca3af;
}
.spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #10b981;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>

