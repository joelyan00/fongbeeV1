<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header pt-safe">
      <view class="header-row">
        <view @click="goBack" class="header-back">
          <AppIcon name="chevron-left" :size="28" style="color: #374151" />
        </view>
        <text class="header-title">服务评价</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- Content -->
    <view class="content">
      <text class="page-subtitle">请对本次服务进行评价</text>

      <!-- Rating Dimensions -->
      <view class="rating-section">
        <view class="rating-item">
          <text class="rating-label">专业程度</text>
          <view class="stars-row">
            <view 
              v-for="star in 5" 
              :key="star" 
              class="star"
              @click="ratings.professionalism = star"
            >
              <AppIcon 
                name="star" 
                :size="28" 
                :style="{ color: star <= ratings.professionalism ? '#f59e0b' : '#d1d5db' }" 
              />
            </view>
          </view>
        </view>

        <view class="rating-item">
          <text class="rating-label">服务态度</text>
          <view class="stars-row">
            <view 
              v-for="star in 5" 
              :key="star" 
              class="star"
              @click="ratings.attitude = star"
            >
              <AppIcon 
                name="star" 
                :size="28" 
                :style="{ color: star <= ratings.attitude ? '#f59e0b' : '#d1d5db' }" 
              />
            </view>
          </view>
        </view>

        <view class="rating-item">
          <text class="rating-label">准时程度</text>
          <view class="stars-row">
            <view 
              v-for="star in 5" 
              :key="star" 
              class="star"
              @click="ratings.punctuality = star"
            >
              <AppIcon 
                name="star" 
                :size="28" 
                :style="{ color: star <= ratings.punctuality ? '#f59e0b' : '#d1d5db' }" 
              />
            </view>
          </view>
        </view>

        <view class="rating-item">
          <text class="rating-label">整体满意度</text>
          <view class="stars-row">
            <view 
              v-for="star in 5" 
              :key="star" 
              class="star"
              @click="ratings.overall = star"
            >
              <AppIcon 
                name="star" 
                :size="28" 
                :style="{ color: star <= ratings.overall ? '#f59e0b' : '#d1d5db' }" 
              />
            </view>
          </view>
        </view>
      </view>

      <!-- Comment -->
      <view class="comment-section">
        <text class="section-label">评价内容（可选）</text>
        <textarea 
          v-model="comment"
          class="comment-input"
          placeholder="分享您的服务体验..."
          :maxlength="500"
        />
      </view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <button class="submit-btn" :disabled="!canSubmit" @click="handleSubmit">
        {{ submitting ? '提交中...' : '提交评价' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import { getToken } from '@/services/api';

const orderId = ref('');
const ratings = reactive({
  professionalism: 5,
  attitude: 5,
  punctuality: 5,
  overall: 5
});
const comment = ref('');
const submitting = ref(false);

const canSubmit = computed(() => 
  ratings.professionalism >= 1 && 
  ratings.attitude >= 1 && 
  ratings.punctuality >= 1 && 
  ratings.overall >= 1 &&
  !submitting.value
);

onLoad((options) => {
  if (options?.id) {
    orderId.value = options.id;
  }
});

const goBack = () => uni.navigateBack();

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  submitting.value = true;
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const res = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}/submit-review`,
      method: 'POST',
      header: { Authorization: `Bearer ${getToken()}` },
      data: {
        rating_professionalism: ratings.professionalism,
        rating_attitude: ratings.attitude,
        rating_punctuality: ratings.punctuality,
        rating_overall: ratings.overall,
        comment: comment.value.trim() || null
      }
    });

    const data = res.data as any;
    if (data.success) {
      const msg = data.rewardedPoints > 0 
        ? `评价成功，获得奖励 ${data.rewardedPoints} 积分！` 
        : '评价成功，感谢您的反馈！';
      
      uni.showToast({ 
        title: msg, 
        icon: 'success',
        duration: 2000
      });
      
      setTimeout(() => {
        uni.navigateBack({ delta: 2 });
      }, 2000);
    } else {
      uni.showToast({ title: data.message || '提交失败', icon: 'none' });
    }
  } catch (e: any) {
    uni.showToast({ title: '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
}
.header {
  background: #ffffff;
  padding: 0 16px;
  border-bottom: 1px solid #e5e7eb;
}
.pt-safe { padding-top: env(safe-area-inset-top); }
.header-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}
.header-back { width: 40px; height: 56px; display: flex; align-items: center; }
.header-title { font-size: 18px; font-weight: bold; color: #111827; }
.header-placeholder { width: 40px; }

.content {
  flex: 1;
  padding: 20px 16px;
}

.page-subtitle {
  font-size: 15px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 24px;
}

.rating-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.rating-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}
.rating-item:last-child {
  border-bottom: none;
}

.rating-label {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
}

.stars-row {
  display: flex;
  flex-direction: row;
  gap: 4px;
}

.star {
  padding: 4px;
}

.comment-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
}

.section-label {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
  display: block;
}

.comment-input {
  width: 100%;
  height: 120px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  font-size: 15px;
  color: #111827;
  line-height: 1.5;
}

.footer {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
}

.submit-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}
.submit-btn[disabled] {
  background: #d1d5db;
  color: #9ca3af;
}
</style>
