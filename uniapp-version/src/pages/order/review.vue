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
          <view class="rating-info">
            <text class="rating-label">专业程度</text>
            <text class="rating-desc">供应商展示的技术水平和解决问题的专业能力</text>
          </view>
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
                :style="{ color: star <= ratings.professionalism ? '#10b981' : '#d1d5db' }" 
              />
            </view>
          </view>
        </view>

        <view class="rating-item">
          <view class="rating-info">
            <text class="rating-label">服务态度</text>
            <text class="rating-desc">供应商在服务过程中的沟通质量和态度</text>
          </view>
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
                :style="{ color: star <= ratings.attitude ? '#10b981' : '#d1d5db' }" 
              />
            </view>
          </view>
        </view>

        <view class="rating-item">
          <view class="rating-info">
            <text class="rating-label">准时程度</text>
            <text class="rating-desc">供应商是否准时到达并按计划完成服务</text>
          </view>
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
                :style="{ color: star <= ratings.punctuality ? '#10b981' : '#d1d5db' }" 
              />
            </view>
          </view>
        </view>

        <view class="rating-item">
          <view class="rating-info">
            <text class="rating-label">整体满意度</text>
            <text class="rating-desc">您对本次服务的综合满意程度</text>
          </view>
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
                :style="{ color: star <= ratings.overall ? '#10b981' : '#d1d5db' }" 
              />
            </view>
          </view>
        </view>
      </view>

      <!-- Comment & Photos -->
      <view class="comment-section">
        <text class="section-label">评价内容（可选）</text>
        <textarea 
          v-model="comment"
          class="comment-input"
          placeholder="分享您的服务体验..."
          :maxlength="500"
        />

        <view class="photo-section">
          <text class="section-label">上传图片（可选）</text>
          <view class="photo-list">
            <view 
              v-for="(url, idx) in photoUrls" 
              :key="url" 
              class="photo-item"
              @click="previewPhoto(idx)"
            >
              <image :src="url" mode="aspectFill" class="photo" />
              <view class="remove-btn" @click.stop="removePhoto(idx)">
                <AppIcon name="x" :size="14" style="color: #fff" />
              </view>
            </view>
            <view 
              v-if="photoUrls.length < 3" 
              class="upload-btn" 
              @click="choosePhoto"
            >
              <AppIcon name="camera" :size="24" style="color: #9ca3af" />
              <text class="upload-text">添加图片</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Footer Action -->
    <view class="footer">
      <button 
        class="submit-btn" 
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交评价' }}
      </button>
    </view>

    <!-- Points Awarded Modal -->
    <AppModal
      v-model="showPointsModal"
      title="评价成功"
      :description="`感谢您的评价！核销该服务商赠送的 ${earnedPoints} 积分已存入您的账户。`"
      icon="award"
      icon-color="#f59e0b"
      icon-bg-color="rgba(245, 158, 11, 0.1)"
      confirm-text="太棒了"
      @confirm="onPointsModalClose"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import AppModal from '@/components/AppModal.vue';
import { getToken, API_BASE_URL } from '@/services/api';

const orderId = ref('');
const ratings = reactive({
  professionalism: 5,
  attitude: 5,
  punctuality: 5,
  overall: 5
});
const comment = ref('');
const photoUrls = ref<string[]>([]);
const submitting = ref(false);
const showPointsModal = ref(false);
const earnedPoints = ref(0);

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

const onPointsModalClose = () => {
  showPointsModal.value = false;
  uni.navigateBack({ delta: 2 });
};

const previewPhoto = (index: number) => {
  uni.previewImage({ current: index, urls: photoUrls.value });
};

const removePhoto = (index: number) => {
  photoUrls.value.splice(index, 1);
};

const choosePhoto = () => {
  uni.chooseImage({
    count: 3 - photoUrls.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      for (const tempPath of res.tempFilePaths) {
        try {
          uni.showLoading({ title: '上传中...' });
          // const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
          const uploadRes = await new Promise<string>((resolve, reject) => {
            uni.uploadFile({
              url: `${API_BASE_URL}/upload`,
              filePath: tempPath,
              name: 'file',
              header: { Authorization: `Bearer ${getToken()}` },
              success: (uploadResult) => {
                const data = JSON.parse(uploadResult.data);
                if (data.success) resolve(data.url);
                else reject(new Error(data.message || '上传失败'));
              },
              fail: reject
            });
          });
          photoUrls.value.push(uploadRes);
        } catch (e) {
          console.error('Upload failed:', e);
          uni.showToast({ title: '图片上传失败', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};

const handleSubmit = async () => {
  console.log('Submit clicked. Can submit:', canSubmit.value);
  if (!canSubmit.value) return;

  submitting.value = true;
  try {
    // const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const res = await uni.request({
      url: `${API_BASE_URL}/orders-v2/${orderId.value}/submit-review`,
      method: 'POST',
      header: { Authorization: `Bearer ${getToken()}` },
      data: {
        rating_professionalism: ratings.professionalism,
        rating_attitude: ratings.attitude,
        rating_punctuality: ratings.punctuality,
        rating_overall: ratings.overall,
        comment: comment.value.trim() || null,
        photos: photoUrls.value
      }
    });

    const data = res.data as any;
    if (data.success) {
      if (data.rewardedPoints > 0) {
        earnedPoints.value = data.rewardedPoints;
        showPointsModal.value = true;
      } else {
        uni.showToast({ title: '评价成功', icon: 'success' });
        setTimeout(() => uni.navigateBack({ delta: 2 }), 1500);
      }
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

.rating-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.rating-label {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.rating-desc {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
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
  height: 100px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  font-size: 15px;
  color: #111827;
  line-height: 1.5;
  margin-bottom: 20px;
}

.photo-section {
  margin-top: 10px;
}

.photo-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
}

.photo-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.photo {
  width: 100%;
  height: 100%;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}

.upload-text {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
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
  background: linear-gradient(90deg, #047857, #059669);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-btn[disabled] {
  background: #d1d5db;
  color: #9ca3af;
}
</style>
