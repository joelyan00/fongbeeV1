<template>
  <view class="confirm-page">
    <!-- Loading State -->
    <view v-if="loading" class="loading-container">
      <view class="spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Error State -->
    <view v-else-if="error" class="error-container">
      <text class="error-icon">⚠️</text>
      <text class="error-title">{{ error }}</text>
      <button class="retry-btn" @click="loadData">重试</button>
    </view>

    <!-- Success State (Already Confirmed) -->
    <view v-else-if="alreadyConfirmed" class="success-container">
      <text class="success-icon">✅</text>
      <text class="success-title">已确认</text>
      <text class="success-desc">您已确认过此请求，无须重复操作。</text>
    </view>

    <!-- Main Content -->
    <view v-else class="main-content">
      <!-- Header -->
      <view class="header">
        <view class="badge">{{ phaseText }}确认</view>
        <text class="title">服务商请求确认</text>
        <text class="desc">服务商已上传现场照片，请核对无误后点击下方按钮确认。系统将解锁定金给服务商。</text>
      </view>

      <!-- Remarks -->
      <view v-if="remarks" class="remarks-section">
        <text class="section-title">服务商说明</text>
        <view class="remarks-content">
          <text class="remarks-text">{{ remarks }}</text>
        </view>
      </view>

      <!-- Photos Grid -->
      <view class="photos-section" v-if="photos.length > 0">
        <text class="section-title">现场照片</text>
        <view class="photos-grid">
          <image 
            v-for="(photo, index) in photos" 
            :key="index"
            :src="photo"
            mode="aspectFill"
            class="photo-item"
            @click="previewImage(photo)"
          />
        </view>
      </view>

      <!-- Action -->
      <view class="action-section">
        <button 
          class="confirm-btn" 
          :disabled="confirming"
          @click="handleConfirm"
        >
          <text v-if="confirming">处理中...</text>
          <text v-else>{{ isAcceptance ? '确认验收' : '确认并支付定金' }}</text>
        </button>
        
        <button 
          v-if="isAcceptance"
          class="rework-btn" 
          :disabled="confirming"
          @click="showReworkModal = true"
        >有点问题</button>
      </view>
    </view>

    <!-- Confirm Success Modal -->
    <view v-if="showSuccessModal" class="modal-overlay">
      <view class="modal-content success-modal">
        <text class="modal-icon">🎉</text>
        <text class="modal-title">确认成功</text>
        <text class="modal-desc">{{ isAcceptance ? '感谢您的反馈，请对本次服务进行评价。' : '定金已解锁给服务商，服务即将开始。' }}</text>
        
        <!-- Rating Interface (only for acceptance) -->
        <view v-if="isAcceptance" class="rating-box">
            <view class="stars">
                <text 
                    v-for="i in 5" 
                    :key="i" 
                    :class="['star', rating >= i ? 'active' : '']"
                    @click="rating = i"
                >★</text>
            </view>
            <textarea v-model="ratingComment" class="rating-textarea" placeholder="填写评价内容（可选）"></textarea>
            <button class="modal-btn" :disabled="rating === 0 || ratingLoading" @click="submitRating">提交评价</button>
        </view>
        <button v-else class="modal-btn" @click="closeModal">知道了</button>
      </view>
    </view>

    <!-- Rework Modal -->
    <view v-if="showReworkModal" class="modal-overlay">
      <view class="modal-content rework-modal">
        <text class="modal-title">反馈问题</text>
        <text class="modal-desc">请详细说明您遇到的问题，服务商将看到您的反馈并改进。</text>
        
        <textarea v-model="reworkNotes" class="rework-textarea" placeholder="请描述具体哪里的服务需要改进... (必填)"></textarea>
        
        <!-- Optional Photos for Rework -->
        <view class="upload-section">
            <text class="upload-label">上传凭证 (可选)</text>
            <view class="photo-grid">
                <view class="photo-item" v-for="(p, idx) in reworkPhotos" :key="idx">
                    <image :src="p" mode="aspectFill" />
                </view>
                <view class="upload-btn" @click="chooseReworkImage" v-if="reworkPhotos.length < 3">+</view>
            </view>
        </view>

        <view class="modal-footer">
            <button class="btn-cancel" @click="showReworkModal = false">取消</button>
            <button class="btn-confirm" :disabled="!reworkNotes || reworkLoading" @click="submitRework">确认提交</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// State
const loading = ref(true);
const error = ref('');
const alreadyConfirmed = ref(false);
const confirming = ref(false);
const showSuccessModal = ref(false);
const phaseText = ref('开工前');
const photos = ref<string[]>([]);
const isAcceptance = ref(false);
const remarks = ref('');
const token = ref('');

// Rework State
const showReworkModal = ref(false);
const reworkNotes = ref('');
const reworkPhotos = ref<string[]>([]);
const reworkLoading = ref(false);

// Rating State
const rating = ref(0);
const ratingComment = ref('');
const ratingLoading = ref(false);

// Get token from URL
onMounted(() => {
  // Get query params
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  // @ts-ignore
  const options = currentPage?.options || {};
  token.value = options.token || '';
  
  if (token.value) {
    loadData();
  } else {
    loading.value = false;
    error.value = '无效链接';
  }
});

// Load verification data
const loadData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const res = await uni.request({
      url: `${baseUrl}/orders-v2/public/verification-data?token=${token.value}`,
      method: 'GET'
    });
    
    // @ts-ignore
    const data = res.data;
    
    if (data.success === false) {
      if (data.alreadyConfirmed) {
        alreadyConfirmed.value = true;
      } else {
        error.value = data.message || '加载失败';
      }
    } else {
      // @ts-ignore
      phaseText.value = data.phaseText || '开工前';
      // @ts-ignore
      photos.value = data.photos || [];
      // @ts-ignore
      remarks.value = data.notes || '';
      // @ts-ignore
      isAcceptance.value = data.isAcceptance || false;
    }
  } catch (e: any) {
    error.value = e.message || '网络错误';
  } finally {
    loading.value = false;
  }
};

// Preview image
const previewImage = (url: string) => {
  uni.previewImage({
    urls: photos.value,
    current: url
  });
};

// Handle confirm
const handleConfirm = async () => {
  if (confirming.value) return;
  confirming.value = true;
  
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const res = await uni.request({
      url: `${baseUrl}/orders-v2/public/confirm-start`,
      method: 'POST',
      data: { token: token.value }
    });
    
    // @ts-ignore
    const data = res.data;
    
    if (data.success) {
      showSuccessModal.value = true;
    } else {
      uni.showToast({ title: data.message || '确认失败', icon: 'none' });
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '网络错误', icon: 'none' });
  } finally {
    confirming.value = false;
  }
};

// Close modal
const closeModal = () => {
  showSuccessModal.value = false;
  alreadyConfirmed.value = true;
};

// Rework Functions
const chooseReworkImage = () => {
    uni.chooseImage({
        count: 3 - reworkPhotos.value.length,
        success: (res) => {
            reworkPhotos.value.push(...res.tempFilePaths);
        }
    });
};

const submitRework = async () => {
    if (!reworkNotes.value) return;
    reworkLoading.value = true;
    
    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        
        // Upload rework photos if any
        const uploadedUrls: string[] = [];
        for (const path of reworkPhotos.value) {
            const uploadRes = await uni.uploadFile({
                url: `${baseUrl}/upload-supabase`,
                filePath: path,
                name: 'file'
            });
            const data = JSON.parse(uploadRes.data);
            if (data.success) uploadedUrls.push(data.url);
        }

        const res = await uni.request({
            url: `${baseUrl}/orders-v2/public/submit-rework`,
            method: 'POST',
            data: {
                token: token.value,
                notes: reworkNotes.value,
                photoUrls: uploadedUrls.join(',')
            }
        });

        // @ts-ignore
        const data = res.data;
        if (data.success) {
            uni.showToast({ title: '已提交反馈', icon: 'success' });
            showReworkModal.value = false;
            alreadyConfirmed.value = true;
        } else {
            // @ts-ignore
            uni.showToast({ title: data.message || '提交失败', icon: 'none' });
        }
    } catch (e: any) {
        uni.showToast({ title: '提交失败', icon: 'none' });
    } finally {
        reworkLoading.value = false;
    }
};

const submitRating = async () => {
    ratingLoading.value = true;
    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const res = await uni.request({
            url: `${baseUrl}/orders-v2/public/rate`,
            method: 'POST',
            data: {
                token: token.value,
                rating: rating.value,
                comment: ratingComment.value
            }
        });
        // @ts-ignore
        if (res.data.success) {
            uni.showToast({ title: '评价成功', icon: 'success' });
            closeModal();
        }
    } catch (e) {
        uni.showToast({ title: '评价失败', icon: 'none' });
    } finally {
        ratingLoading.value = false;
    }
};
</script>

<style scoped>
.confirm-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
  padding: 20px;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  color: #6b7280;
}

/* Error */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  color: #374151;
  margin-bottom: 24px;
}

.retry-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
}

/* Success */
.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-title {
  font-size: 24px;
  font-weight: bold;
  color: #10b981;
  margin-bottom: 12px;
}

.success-desc {
  color: #6b7280;
  text-align: center;
}

/* Main Content */
.main-content {
  max-width: 500px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: #dbeafe;
  color: #2563eb;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.title {
  display: block;
  font-size: 22px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.desc {
  display: block;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

/* Remarks */
.remarks-section {
  background: #fefce8;
  border: 1px solid #fef08a;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.remarks-content {
  background: white;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid rgba(234, 179, 8, 0.2);
}

.remarks-text {
  font-size: 14px;
  color: #854d0e;
  line-height: 1.6;
}

/* Photos */
.photos-section {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.photo-item {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* Action */
.action-section {
  padding: 0 16px;
}

.confirm-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.confirm-btn:disabled {
  background: #9ca3af;
  box-shadow: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 85%;
  max-width: 320px;
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-title {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.modal-desc {
  display: block;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

.modal-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
}

.rework-btn {
  width: 100%;
  background: white;
  color: #ef4444;
  border: 1px solid #fee2e2;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 12px;
}

/* Rating Interface */
.rating-box {
  margin-top: 20px;
}

.stars {
  font-size: 32px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.star {
  color: #e5e7eb;
  cursor: pointer;
}

.star.active {
  color: #fbbf24;
}

.rating-textarea {
  width: 100%;
  height: 80px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  margin-bottom: 16px;
  box-sizing: border-box;
}

/* Rework Modal */
.rework-modal {
    padding: 24px !important;
}

.rework-textarea {
    width: 100%;
    height: 120px;
    background: #fef2f2;
    border: 1px solid #fee2e2;
    border-radius: 12px;
    padding: 12px;
    font-size: 14px;
    margin-bottom: 16px;
    box-sizing: border-box;
}

.upload-section {
    text-align: left;
    margin-bottom: 20px;
}

.upload-label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
    display: block;
}

.upload-btn {
    width: 60px;
    height: 60px;
    background: #f3f4f6;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #9ca3af;
}

.modal-footer {
    display: flex;
    gap: 12px;
}

.btn-cancel {
    flex: 1;
    background: #f3f4f6;
    color: #4b5563;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
}

.btn-confirm {
    flex: 2;
    background: #ef4444;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
}

.btn-confirm:disabled {
    background: #fca5a5;
}

</style>
