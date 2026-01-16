<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header pt-safe">
      <view class="header-row">
        <view @click="goBack" class="header-back">
          <AppIcon name="chevron-left" :size="28" style="color: #ffffff" />
        </view>
        <text class="header-title">开始服务</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- Content -->
    <view class="content">
      <!-- Instructions -->
      <view class="instruction-card">
        <AppIcon name="camera" :size="32" style="color: #10b981" />
        <text class="instruction-text">请拍照记录服务开始前的现场状态，并填写描述</text>
      </view>

      <!-- Photo Upload -->
      <view class="section">
        <text class="section-title">现场照片（可选）</text>
        <view class="photo-grid">
          <view v-for="(photo, index) in photos" :key="index" class="photo-item">
            <image :src="photo" mode="aspectFill" class="photo-img" />
            <view class="photo-remove" @click="removePhoto(index)">
              <AppIcon name="x" :size="16" style="color: #fff" />
            </view>
          </view>
          <view v-if="photos.length < 4" class="photo-add" @click="addPhoto">
            <AppIcon name="plus" :size="32" style="color: #9ca3af" />
            <text class="photo-add-text">添加照片</text>
          </view>
        </view>
      </view>

      <!-- Description -->
      <view class="section">
        <text class="section-title">状态描述 <text class="required">*</text></text>
        <textarea 
          v-model="description" 
          class="description-input"
          placeholder="请描述服务开始前的现场状态，例如：地面有灰尘，窗户有水渍..."
          :maxlength="500"
        />
        <text class="char-count">{{ description.length }}/500</text>
      </view>
    </view>

    <!-- Submit Button -->
    <view class="footer">
      <button class="submit-btn" :disabled="!canSubmit" @click="handleSubmit">
        {{ submitting ? '提交中...' : '确认开始服务' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import { ordersV2Api, getToken, API_BASE_URL } from '@/services/api';

const orderId = ref('');
const photos = ref<string[]>([]);
const description = ref('');
const submitting = ref(false);

const canSubmit = computed(() => description.value.trim().length > 0 && !submitting.value);

onLoad((options) => {
  if (options?.id) {
    orderId.value = options.id;
  }
});

const goBack = () => uni.navigateBack();

const addPhoto = () => {
  uni.chooseImage({
    count: 4 - photos.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      for (const tempPath of res.tempFilePaths) {
        try {
          uni.showLoading({ title: '上传中...' });
          // Upload to server
          const uploadRes = await new Promise<string>((resolve, reject) => {
            uni.uploadFile({
              url: `${API_BASE_URL}/upload`,
              filePath: tempPath,
              name: 'file',
              header: { Authorization: `Bearer ${getToken()}` },
              success: (res) => {
                const data = JSON.parse(res.data);
                if (data.success) resolve(data.url);
                else reject(new Error(data.message));
              },
              fail: reject
            });
          });
          photos.value.push(uploadRes);
        } catch (e) {
          console.error('Upload failed:', e);
          uni.showToast({ title: '图片上传失败，请重试', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};

const removePhoto = (index: number) => {
  photos.value.splice(index, 1);
};

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  submitting.value = true;
  try {
    const res = await ordersV2Api.startServiceV2(orderId.value, {
      photos: photos.value,
      description: description.value.trim()
    });

    if (res.success) {
      uni.showToast({ title: '服务已开始', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1500);
    } else {
      uni.showToast({ title: res.message || '提交失败', icon: 'none' });
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #111827;
  display: flex;
  flex-direction: column;
}
.header {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  padding: 0 16px;
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
.header-title { font-size: 18px; font-weight: bold; color: #ffffff; }
.header-placeholder { width: 40px; }

.content {
  flex: 1;
  padding: 16px;
}

.instruction-card {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.instruction-text {
  flex: 1;
  font-size: 14px;
  color: #10b981;
  line-height: 1.5;
}

.section {
  margin-bottom: 24px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}
.required { color: #ef4444; }

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.photo-item {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}
.photo-img { width: 100%; height: 100%; }
.photo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.photo-add {
  width: 80px;
  height: 80px;
  border: 2px dashed #374151;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.photo-add-text { font-size: 12px; color: #9ca3af; }

.description-input {
  width: 100%;
  height: 120px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  box-sizing: border-box;
  padding: 12px;
  font-size: 15px;
  color: #ffffff;
  line-height: 1.5;
}
.char-count {
  text-align: right;
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
}

.footer {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
.submit-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(90deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
}
.submit-btn[disabled] {
  background: #374151;
  color: #6b7280;
}
</style>
