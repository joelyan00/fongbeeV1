<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);">
    <!-- Header -->
    <!-- Global Navbar -->
    <GlobalNavbar 
      title="收到的评论" 
      background-color="#0f172a" 
      title-color="#ffffff" 
      icon-color="#ffffff"
      :show-back="true"
      :custom-back="goBack"
      :fixed="true"
    />

    <!-- Stats Section -->
    <view style="padding: 8px 16px 0 16px;">
      <view style="background: #1f2937; border-radius: 16px; padding: 20px; display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
        <view style="flex: 1; text-align: center;">
          <text style="font-size: 24px; font-weight: 700; color: #fbbf24; display: block;">{{ stats.avg }}</text>
          <text style="font-size: 12px; color: #9ca3af; margin-top: 4px; display: block;">平均评分</text>
        </view>
        <view style="width: 1px; height: 32px; background: #374151;"></view>
        <view style="flex: 1; text-align: center;">
          <text style="font-size: 24px; font-weight: 700; color: #ffffff; display: block;">{{ stats.count }}</text>
          <text style="font-size: 12px; color: #9ca3af; margin-top: 4px; display: block;">评论数量</text>
        </view>
        <view style="width: 1px; height: 32px; background: #374151;"></view>
        <view style="flex: 1; text-align: center;">
          <text style="font-size: 24px; font-weight: 700; color: #10b981; display: block;">{{ stats.goodRate }}%</text>
          <text style="font-size: 12px; color: #9ca3af; margin-top: 4px; display: block;">好评率</text>
        </view>
      </view>
    </view>

    <!-- Filter Tabs -->
    <view style="padding: 16px 16px 8px 16px;">
      <scroll-view scroll-x :show-scrollbar="false" style="white-space: nowrap;">
        <view style="display: flex; flex-direction: row; gap: 10px;">
          <view 
            v-for="(tab, index) in tabs" 
            :key="index"
            @click="activeTab = index"
            :style="{
              padding: '6px 16px',
              borderRadius: '100px',
              background: activeTab === index ? 'rgba(16, 185, 129, 0.15)' : '#1f2937',
              border: activeTab === index ? '1px solid #10b981' : '1px solid #374151'
            }"
          >
            <text :style="{ fontSize: '13px', color: activeTab === index ? '#10b981' : '#9ca3af' }">{{ tab }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Reviews List -->
    <scroll-view scroll-y :style="{ height: listHeight }">
      
      <view v-if="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
        <view style="width: 24px; height: 24px; border: 2px solid rgba(16, 185, 129, 0.3); border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite;"></view>
        <text style="font-size: 14px; color: #9ca3af; margin-top: 12px;">加载中...</text>
      </view>
      
      <view v-else-if="filteredReviews.length === 0" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 80px;">
        <view style="width: 80px; height: 80px; background: rgba(31, 41, 55, 0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <AppIcon name="star" :size="40" color="#6b7280" />
        </view>
        <text style="font-size: 14px; color: #6b7280;">暂无相关评论</text>
      </view>

      <view v-else style="padding: 0 16px 32px 16px;">
        <view v-for="review in filteredReviews" :key="review.id" style="background: #1f2937; border-radius: 16px; padding: 16px; margin-bottom: 12px; border: 1px solid #374151;">
          <!-- Header: User info & Date -->
          <view style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <view style="display: flex; flex-direction: row; align-items: center; gap: 10px;">
              <view style="width: 36px; height: 36px; background: linear-gradient(135deg, #374151 0%, #4b5563 100%); border-radius: 18px; display: flex; align-items: center; justify-content: center;">
                <text style="font-size: 14px; font-weight: 600; color: #ffffff;">{{ review.userName.charAt(0) }}</text>
              </view>
              <view>
                <text style="font-size: 14px; font-weight: 500; color: #ffffff; display: block;">{{ review.userName }}</text>
                <view style="margin-top: 2px; padding: 2px 6px; background: rgba(59, 130, 246, 0.15); border-radius: 4px; display: inline-block;">
                  <text style="font-size: 10px; color: #60a5fa;">{{ review.orderType }}</text>
                </view>
              </view>
            </view>
            <text style="font-size: 12px; color: #6b7280;">{{ review.date }}</text>
          </view>
          
          <!-- Rating -->
          <view style="display: flex; flex-direction: row; align-items: center; margin-bottom: 12px;">
            <view style="display: flex; flex-direction: row; margin-right: 8px;">
              <AppIcon 
                v-for="star in 5" 
                :key="star"
                name="star" 
                :size="14" 
                :color="star <= review.rating ? '#fbbf24' : '#4b5563'" 
                style="margin-right: 2px;"
              />
            </view>
            <text style="font-size: 14px; font-weight: 600; color: #fbbf24;">{{ review.rating.toFixed(1) }}</text>
          </view>
          
          <!-- Content -->
          <text style="font-size: 14px; color: #e5e7eb; line-height: 1.5; margin-bottom: 12px; display: block;">{{ review.content }}</text>
          
          <!-- Images -->
          <view v-if="review.images && review.images.length" style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
            <image 
                v-for="(img, idx) in review.images" 
                :key="idx" 
                :src="img" 
                style="width: 80px; height: 80px; border-radius: 8px; background: #374151;"
                mode="aspectFill"
                @click.stop="previewImages(review.images, idx)"
            />
          </view>
          
          <!-- Reply Section -->
          <view v-if="review.reply" style="background: rgba(16, 185, 129, 0.05); border-radius: 12px; padding: 12px; margin-top: 12px; border: 1px solid rgba(16, 185, 129, 0.1);">
            <view style="display: flex; flex-direction: row; align-items: center; gap: 6px; margin-bottom: 6px;">
              <view style="width: 6px; height: 6px; border-radius: 3px; background: #10b981;"></view>
              <text style="font-size: 12px; font-weight: 500; color: #10b981;">您的回复 ({{ review.reply_at?.split('T')[0] }})</text>
            </view>
            <text style="font-size: 13px; color: #d1d5db; line-height: 1.5;">{{ review.reply }}</text>
          </view>
          
          <!-- Reply Action -->
          <view v-else style="margin-top: 12px; display: flex; justify-content: flex-end;">
            <view @click="handleReply(review)" style="display: flex; flex-direction: row; align-items: center; gap: 4px; padding: 6px 12px; background: rgba(16, 185, 129, 0.1); border-radius: 100px;">
              <AppIcon name="message-circle" :size="14" color="#10b981" />
              <text style="font-size: 12px; color: #10b981; font-weight: 500;">回复评论</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';
import { getToken, API_BASE_URL } from '@/services/api';

const loading = ref(true);
const activeTab = ref(0);
const tabs = ['全部', '好评', '中评', '差评', '待回复'];
// Adjust height based on header + stats + tabs
const listHeight = 'calc(100vh - 240px)';

interface Review {
  id: string;
  userName: string;
  orderType: string;
  rating: number;
  content: string;
  date: string;
  reply?: string;
  reply_at?: string;
  images?: string[];
}

const allReviews = ref<Review[]>([]);

const previewImages = (urls: string[], current: number) => {
    uni.previewImage({
        urls,
        current: urls[current]
    });
};

const stats = computed(() => {
  if (allReviews.value.length === 0) return { avg: 0, count: 0, goodRate: 0 };
  
  const sum = allReviews.value.reduce((s, r) => s + r.rating, 0);
  const avg = Math.round((sum / allReviews.value.length) * 10) / 10;
  const goodCount = allReviews.value.filter(r => r.rating >= 4).length;
  const goodRate = Math.round((goodCount / allReviews.value.length) * 100);
  
  return { avg, count: allReviews.value.length, goodRate };
});

const fetchReviews = async () => {
    loading.value = true;
    try {
        const res: any = await uni.request({
            url: `${API_BASE_URL}/users/me/reviews?type=received`,
            method: 'GET',
            header: { Authorization: `Bearer ${getToken()}` }
        });
        
        if (res.data?.reviews) {
            allReviews.value = res.data.reviews.map((r: any) => ({
                id: r.id,
                userName: r.users?.name || '匿名用户',
                orderType: r.orders?.service_title || '未知服务',
                rating: r.rating_overall,
                content: r.comment,
                date: r.created_at?.split('T')[0] || '',
                reply: r.reply_content,
                images: r.photos || []
            }));
        }
    } catch (e) {
        console.error('Fetch reviews error:', e);
        uni.showToast({ title: '获取评价失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

const handleReply = (review: Review) => {
    uni.showModal({
        title: '回复评论',
        editable: true,
        placeholderText: '请输入您的回复内容...',
        success: async (res) => {
            if (res.confirm && res.content) {
                try {
                    const replyRes: any = await uni.request({
                        url: `${API_BASE_URL}/orders-v2/reviews/${review.id}/reply`,
                        method: 'POST',
                        header: { Authorization: `Bearer ${getToken()}` },
                        data: { replyContent: res.content }
                    });
                    
                    if (replyRes.data?.success) {
                        uni.showToast({ title: '回复成功', icon: 'success' });
                        fetchReviews(); // Refresh list
                    } else {
                        uni.showToast({ title: replyRes.data?.message || '回复失败', icon: 'none' });
                    }
                } catch (e) {
                    console.error('Reply error:', e);
                    uni.showToast({ title: '回复失败', icon: 'none' });
                }
            }
        }
    });
};

const filteredReviews = computed(() => {
  switch(activeTab.value) {
    case 1: return allReviews.value.filter(r => r.rating >= 4);
    case 2: return allReviews.value.filter(r => r.rating === 3);
    case 3: return allReviews.value.filter(r => r.rating < 3);
    case 4: return allReviews.value.filter(r => !r.reply);
    default: return allReviews.value;
  }
});

onMounted(() => {
    fetchReviews();
});

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};
</script>

<style scoped>

/* Standard Header & Page */
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 30px;
  display: flex;
  flex-direction: column;
}

/* Standard Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 40px 16px; /* Added bottom padding for stats card overlap */
  flex-shrink: 0;
}

.back-btn, .placeholder-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.placeholder-btn {
  background: transparent;
}

.header-center-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
}

.header-subtitle {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  margin-top: 2px;
  text-align: center;
}


/* Stats Card */
.stats-container {
  padding: 0 16px;
  margin-top: -20px;
  position: relative;
  z-index: 5;
  margin-bottom: 20px;
}

.stats-grid {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #374151;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
}

.text-yellow { color: #fbbf24; }
.text-white { color: #ffffff; }
.text-emerald { color: #10b981; }

/* Filter Tabs */
.tabs-scroll-view {
  padding: 0 16px;
  margin-bottom: 16px;
}

.tabs-scroll {
  white-space: nowrap;
  width: 100%;
}

.tabs-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.tab-item {
  padding: 6px 16px;
  background: rgba(255,255,255,0.05); /* Track bg */
  border-radius: 20px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.tab-active {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.tab-text {
  font-size: 13px;
  color: #9ca3af;
}

.tab-text-active {
  color: #10b981;
  font-weight: 600;
}

/* Reviews List */
.content-scroll {
  flex: 1;
}

.reviews-list {
  padding: 0 16px 40px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 16px;
  padding: 16px;
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: #d1d5db;
  font-size: 18px;
  font-weight: 600;
}

.user-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

.service-tag {
  background: rgba(255,255,255,0.05);
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  align-self: flex-start;
}

.service-tag-text {
  font-size: 10px;
  color: #9ca3af;
}

.review-date {
  font-size: 12px;
  color: #6b7280;
}

.rating-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
  gap: 4px;
}

.stars {
  display: flex;
  flex-direction: row;
}

.rating-score {
  font-size: 14px;
  color: #fbbf24;
  font-weight: 700;
  margin-left: 4px;
}

.review-content {
  font-size: 15px;
  color: #d1d5db;
  line-height: 1.5;
  margin-bottom: 12px;
}

.reply-box {
  background: rgba(17, 24, 39, 0.6);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

.reply-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
  gap: 6px;
}

.reply-dot {
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background: #10b981;
}

.reply-label {
  font-size: 12px;
  color: #9ca3af;
}

.reply-content {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.4;
}

.action-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  border-top: 1px solid #374151;
  padding-top: 12px;
  margin-top: 4px;
}

.reply-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
}

.reply-btn-text {
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.review-images {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.review-img {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  background: #374151;
}

/* States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(16, 185, 129, 0.3);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #9ca3af;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.empty-icon-bg {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border: 1px solid #374151;
}

.empty-text {
  font-size: 14px;
  color: #6b7280;
}
</style>
