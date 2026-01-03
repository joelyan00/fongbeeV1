<template>
  <view class="page-container">
    <!-- Header -->
    <view class="custom-header" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="header-icon"><AppIcon name="chevron-left" :size="24" color="#374151" /></view>
       <text class="header-title">我的评价</text>
       <view class="header-placeholder"></view>
    </view>

    <!-- Tabs -->
    <view class="tabs" :style="{ top: (safeAreaTop + 44) + 'px' }">
        <view class="tab-item" :class="{'tab-active': activeTab==='standard'}" @click="activeTab='standard'">
            标准服务
        </view>
        <view class="tab-item" :class="{'tab-active': activeTab==='custom'}" @click="activeTab='custom'">
            定制服务
        </view>
    </view>

    <!-- List -->
    <view class="content-area">
        <view v-for="review in reviews" :key="review.id" class="review-card">
             <view class="review-header">
                 <image :src="review.serviceImage" class="service-image" mode="aspectFill" />
                 <view class="review-info">
                     <text class="service-name">{{ review.serviceName }}</text>
                     <text class="review-date">{{ review.date }}</text>
                 </view>
             </view>
             
             <view class="rating-stars">
                 <AppIcon v-for="i in 5" :key="i" name="star" :size="16" :color="i <= review.rating ? '#F59E0B' : '#E5E7EB'" />
             </view>

             <text class="review-content">{{ review.content }}</text>
             
             <view v-if="review.images && review.images.length" class="review-images">
                 <image v-for="(img, idx) in review.images" :key="idx" :src="img" class="review-img" mode="aspectFill" />
             </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

const safeAreaTop = ref(0);
const activeTab = ref('standard');

onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
});

const goBack = () => uni.navigateBack();

// Mock Data
const reviews = ref([
    { id: 1, serviceName: '家庭保洁 - 4小时', serviceImage: 'https://images.unsplash.com/photo-1581578731117-104f2a417954?w=100&h=100', date: '2023-12-10', rating: 5, content: '阿姨打扫非常干净，准时到达，很有礼貌。还会再来！', images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=100&h=100'] },
    { id: 2, serviceName: '空调维修', serviceImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&h=100', date: '2023-11-05', rating: 4, content: '师傅很专业，很快就修好了。价格也很公道。', images: [] },
]);
</script>

<style scoped>
.page-container {
    background-color: #f9fafb;
    min-height: 100vh;
    padding-bottom: 40px;
}
.custom-header {
    background-color: #fff;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid #f3f4f6;
}
.header-icon {
    padding: 4px;
}
.header-title {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
}
.header-placeholder {
    width: 24px;
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
    padding-bottom: 12px;
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
</style>
