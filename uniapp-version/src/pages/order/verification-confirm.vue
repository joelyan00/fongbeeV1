<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header pt-safe">
      <view class="header-row">
        <view @click="goBack" class="header-back">
          <AppIcon name="chevron-left" :size="28" style="color: #374151" />
        </view>
        <text class="header-title">服务验收</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Content -->
    <view v-else class="content">
      <!-- Verification History -->
      <view v-for="(v, index) in verifications" :key="v.id" class="verification-card">
        <view class="verification-header">
          <view class="verification-type" :class="getTypeClass(v.type)">
            {{ getTypeLabel(v.type) }}
          </view>
          <text class="verification-time">{{ formatDate(v.created_at) }}</text>
        </view>

        <view v-if="v.photos?.length" class="photos-row">
          <image 
            v-for="(photo, pIndex) in v.photos" 
            :key="pIndex"
            :src="photo"
            mode="aspectFill"
            class="photo-thumb"
            @click="previewPhoto(v.photos, pIndex)"
          />
        </view>

        <text class="verification-desc">{{ v.description }}</text>
      </view>

      <!-- Actions (for latest pending verification) -->
      <view v-if="canRespond" class="action-section">
        <text class="action-title">请确认服务完成情况</text>
        <view class="action-buttons">
          <button class="action-btn satisfied" @click="handleSatisfied">
            <AppIcon name="check" :size="20" style="color: #fff" />
            <text>我很满意</text>
          </button>
          <button class="action-btn issue" @click="showReworkModal = true">
            <AppIcon name="alert-circle" :size="20" style="color: #fff" />
            <text>我有问题</text>
          </button>
        </view>
      </view>
    </view>

    <!-- Rework Modal -->
    <view v-if="showReworkModal" class="modal-overlay" @click="showReworkModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">反馈问题</text>
        
        <view class="modal-section">
          <text class="modal-label">照片（可选）</text>
          <view class="photo-grid">
            <view v-for="(photo, index) in reworkPhotos" :key="index" class="photo-item-small">
              <image :src="photo" mode="aspectFill" class="photo-img-small" />
              <view class="photo-remove-small" @click="reworkPhotos.splice(index, 1)">×</view>
            </view>
            <view v-if="reworkPhotos.length < 3" class="photo-add-small" @click="addReworkPhoto">+</view>
          </view>
        </view>

        <view class="modal-section">
          <text class="modal-label">问题描述 <text class="required">*</text></text>
          <textarea 
            v-model="reworkDescription"
            class="modal-textarea"
            placeholder="请描述需要返工的问题..."
          />
        </view>

        <view class="modal-buttons">
          <button class="modal-btn cancel" @click="showReworkModal = false">取消</button>
          <button class="modal-btn confirm" :disabled="!reworkDescription.trim()" @click="handleRework">提交</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import { getToken } from '@/services/api';

const orderId = ref('');
const loading = ref(true);
const verifications = ref<any[]>([]);
const orderStatus = ref('');
const showReworkModal = ref(false);
const reworkPhotos = ref<string[]>([]);
const reworkDescription = ref('');

const canRespond = computed(() => orderStatus.value === 'pending_verification');

onLoad((options) => {
  if (options?.id) {
    orderId.value = options.id;
    fetchData();
  }
});

const goBack = () => uni.navigateBack();

const fetchData = async () => {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    
    // Get verifications
    const vRes = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}/verifications`,
      method: 'GET',
      header: { Authorization: `Bearer ${getToken()}` }
    });
    verifications.value = (vRes.data as any).verifications || [];

    // Get order status
    const oRes = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}`,
      method: 'GET',
      header: { Authorization: `Bearer ${getToken()}` }
    });
    orderStatus.value = (oRes.data as any).order?.status || '';
  } catch (e) {
    console.error('Fetch data error:', e);
  } finally {
    loading.value = false;
  }
};

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'service_start': '服务开始',
    'completion': '服务完成',
    'rework_request': '返工请求',
    'rework_completion': '返工完成'
  };
  return map[type] || type;
};

const getTypeClass = (type: string) => {
  if (type.includes('rework')) return 'type-rework';
  if (type === 'completion') return 'type-completion';
  return 'type-start';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const previewPhoto = (photos: string[], index: number) => {
  uni.previewImage({ current: index, urls: photos });
};

const addReworkPhoto = () => {
  uni.chooseImage({
    count: 3 - reworkPhotos.value.length,
    success: (res) => {
      reworkPhotos.value.push(...res.tempFilePaths);
    }
  });
};

const handleSatisfied = async () => {
  uni.showModal({
    title: '确认验收',
    content: '确认对服务满意吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
          const res = await uni.request({
            url: `${API_BASE}/orders-v2/${orderId.value}/accept-service`,
            method: 'POST',
            header: { Authorization: `Bearer ${getToken()}` }
          });
          
          if ((res.data as any).success) {
            uni.showToast({ title: '验收成功', icon: 'success' });
            // Navigate to review page
            setTimeout(() => {
              uni.redirectTo({ url: `/pages/order/review?id=${orderId.value}` });
            }, 1000);
          }
        } catch (e) {
          uni.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    }
  });
};

const handleRework = async () => {
  if (!reworkDescription.value.trim()) return;

  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const res = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}/request-rework-v2`,
      method: 'POST',
      header: { Authorization: `Bearer ${getToken()}` },
      data: {
        photos: reworkPhotos.value,
        description: reworkDescription.value.trim()
      }
    });
    
    if ((res.data as any).success) {
      uni.showToast({ title: '已发送给服务商', icon: 'success' });
      showReworkModal.value = false;
      setTimeout(() => uni.navigateBack(), 1500);
    } else {
      uni.showToast({ title: (res.data as any).message || '提交失败', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' });
  }
};
</script>

<style scoped>
.page-container { min-height: 100vh; background-color: #f9fafb; display: flex; flex-direction: column; }
.header { background: #fff; padding: 0 16px; border-bottom: 1px solid #e5e7eb; }
.pt-safe { padding-top: env(safe-area-inset-top); }
.header-row { display: flex; align-items: center; justify-content: space-between; height: 56px; }
.header-back { width: 40px; height: 56px; display: flex; align-items: center; }
.header-title { font-size: 18px; font-weight: bold; color: #111827; }
.header-placeholder { width: 40px; }

.loading-container { flex: 1; display: flex; align-items: center; justify-content: center; }
.loading-text { color: #9ca3af; }

.content { flex: 1; padding: 16px; }

.verification-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.verification-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.verification-type { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.type-start { background: #dbeafe; color: #1d4ed8; }
.type-completion { background: #d1fae5; color: #047857; }
.type-rework { background: #fef3c7; color: #92400e; }
.verification-time { font-size: 12px; color: #9ca3af; }
.photos-row { display: flex; gap: 8px; margin-bottom: 12px; overflow-x: auto; }
.photo-thumb { width: 80px; height: 60px; border-radius: 6px; flex-shrink: 0; }
.verification-desc { font-size: 14px; color: #374151; line-height: 1.5; }

.action-section { background: #fff; border-radius: 12px; padding: 20px; margin-top: 16px; }
.action-title { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 16px; display: block; text-align: center; }
.action-buttons { display: flex; gap: 12px; }
.action-btn { flex: 1; height: 48px; border: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px; font-weight: 600; color: #fff; }
.action-btn.satisfied { background: linear-gradient(90deg, #10b981, #059669); }
.action-btn.issue { background: linear-gradient(90deg, #f59e0b, #d97706); }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: #fff; border-radius: 16px; padding: 20px; width: 90%; max-width: 400px; }
.modal-title { font-size: 18px; font-weight: bold; color: #111827; text-align: center; margin-bottom: 20px; }
.modal-section { margin-bottom: 16px; }
.modal-label { font-size: 14px; color: #374151; margin-bottom: 8px; display: block; }
.required { color: #ef4444; }
.photo-grid { display: flex; gap: 8px; flex-wrap: wrap; }
.photo-item-small { width: 60px; height: 60px; position: relative; border-radius: 6px; overflow: hidden; }
.photo-img-small { width: 100%; height: 100%; }
.photo-remove-small { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,0.6); border-radius: 50%; color: #fff; font-size: 12px; display: flex; align-items: center; justify-content: center; }
.photo-add-small { width: 60px; height: 60px; border: 1px dashed #d1d5db; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 24px; }
.modal-textarea { width: 100%; height: 100px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; font-size: 14px; }
.modal-buttons { display: flex; gap: 12px; margin-top: 20px; }
.modal-btn { flex: 1; height: 44px; border-radius: 8px; font-size: 15px; font-weight: 600; }
.modal-btn.cancel { background: #f3f4f6; color: #374151; border: none; }
.modal-btn.confirm { background: #10b981; color: #fff; border: none; }
.modal-btn.confirm[disabled] { background: #d1d5db; }
</style>
