<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header pt-safe">
      <view class="header-row">
        <view @click="goBack" class="header-back">
          <AppIcon name="chevron-left" :size="28" color="#ffffff" />
        </view>
        <text class="header-title">服务详情与验收</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- Error/Notice Tip (Role Mismatch) -->
    <view v-if="roleError" class="role-error-tip">
      <AppIcon name="alert-triangle" :size="16" color="#f59e0b" />
      <text class="role-error-text">您当前登录的是服务商账号，由于您不是下单用户，无法进行验收操作。若需通过，请登录对应用户端账号。</text>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="content-scroll">
      <view v-if="loading" class="loading-state">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载订单信息...</text>
      </view>

      <view v-else class="content-wrapper">
        <!-- Order Brief Card -->
        <view class="order-brief">
          <view class="brief-header">
            <text class="order-id">订单编号: {{ orderId.slice(0, 8) }}</text>
            <view class="status-badge" :class="orderStatus">
              {{ getStatusLabel(orderStatus) }}
            </view>
          </view>
          <text class="service-name">{{ orderTitle || '家庭服务' }}</text>
        </view>

        <!-- Dynamic Timeline Section -->
        <view class="section-container">
          <view class="section-header">
            <view class="header-dot"></view>
            <text class="section-title">服务动态</text>
          </view>
          
          <view class="timeline">
            <view v-for="(v, index) in verifications" :key="v.id" class="timeline-item">
              <view class="timeline-line" v-if="index !== verifications.length - 1"></view>
              <view class="timeline-node" :class="getTypeClass(v.type)">
                <AppIcon :name="getVIcon(v.type)" :size="14" color="#fff" />
              </view>
              <view class="timeline-content">
                <view class="v-header">
                  <text class="v-type-label">{{ getTypeLabel(v.type) }}</text>
                  <text class="v-time">{{ formatDate(v.created_at) }}</text>
                </view>
                
                <view v-if="v.photos?.length" class="photos-grid">
                  <image 
                    v-for="(photo, pIndex) in v.photos" 
                    :key="pIndex"
                    :src="photo"
                    mode="aspectFill"
                    class="timeline-photo"
                    @click="previewPhoto(v.photos, pIndex)"
                  />
                </view>

                <view v-if="v.description" class="v-desc-bubble">
                  <text class="v-desc-text">{{ v.description }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="bottom-spacer"></view>
      </view>
    </scroll-view>

    <!-- Action Section -->
    <view v-if="canRespond && !loading" class="action-footer">
      <view class="action-card">
        <text class="action-hint">服务已基本完成，请您验收。如有质量问题可申请返工。</text>
        <view class="action-buttons">
          <button 
            class="btn btn-issue" 
            :disabled="accepting"
            @click="showReworkModal = true"
          >
            <AppIcon name="alert-circle" :size="20" color="#ffffff" />
            <text class="btn-text">我有问题</text>
          </button>
          <button 
            class="btn btn-satisfied" 
            :class="{ 'btn-loading': accepting }"
            :disabled="accepting || roleError"
            @click="handleSatisfied"
          >
            <view v-if="accepting" class="mini-spinner"></view>
            <AppIcon v-else name="check-circle" :size="20" color="#ffffff" />
            <text class="btn-text">我很满意</text>
          </button>
        </view>
      </view>
    </view>

    <!-- Rework Modal (Standard UI) -->
    <AppModal
      v-model="showReworkModal"
      title="反馈问题"
      icon="alert-circle"
      icon-color="#f59e0b"
      icon-bg-color="rgba(245, 158, 11, 0.1)"
      confirm-text="提交反馈"
      :loading="reworking"
      :disabled="!reworkDescription.trim()"
      @confirm="handleRework"
    >
      <view class="rework-form">
        <text class="modal-label">上传照片证据</text>
        <view class="photo-uploader">
          <view v-for="(photo, index) in reworkPhotos" :key="index" class="uploaded-photo">
            <image :src="photo" mode="aspectFill" class="photo-img" />
            <view class="photo-remove" @click="reworkPhotos.splice(index, 1)">
              <AppIcon name="x" :size="12" color="#fff" />
            </view>
          </view>
          <view v-if="reworkPhotos.length < 3" class="photo-add" @click="addReworkPhoto">
            <AppIcon name="camera" :size="24" color="#4b5563" />
          </view>
        </view>

        <text class="modal-label">具体问题描述 <text class="required">*</text></text>
        <textarea 
          v-model="reworkDescription"
          class="rework-textarea"
          placeholder="请详细描述您遇到的问题，以便服务商准确改进..."
          :maxlength="200"
        />
      </view>
    </AppModal>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import AppModal from '@/components/AppModal.vue';
import { getToken, getUserInfo } from '@/services/api';

const orderId = ref('');
const loading = ref(true);
const accepting = ref(false);
const reworking = ref(false);
const verifications = ref<any[]>([]);
const orderStatus = ref('');
const orderTitle = ref('');
const roleError = ref(false);

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

const goBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        uni.reLaunch({ url: '/pages/index/index' });
    }
}

const fetchData = async () => {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const token = getToken();
    const user = getUserInfo();

    // Get order details first to check owner
    const oRes: any = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}` }
    });
    
    if (oRes.data?.success) {
        const order = oRes.data.order;
        orderStatus.value = order.status;
        orderTitle.value = order.title || order.service_name;
        
        // Check role conflict: if logged in as provider but it's a user verification page
        if (user && user.id !== order.user_id) {
            roleError.value = true;
        }
    }

    // Get verifications
    const vRes: any = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}/verifications`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}` }
    });
    verifications.value = vRes.data?.verifications || [];

  } catch (e) {
    console.error('Fetch data error:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'pending_verification': '待验收',
    'verified': '已验收',
    'completed': '已完成',
    'in_progress': '服务中'
  };
  return map[status] || status;
};

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'service_start': '服务已开始',
    'completion': '服务已完工',
    'rework_request': '客户请求返工',
    'rework_completion': '返工已完成'
  };
  return map[type] || type;
};

const getTypeClass = (type: string) => {
  if (type.includes('rework')) return 'node-rework';
  if (type === 'completion') return 'node-success';
  return 'node-blue';
};

const getVIcon = (type: string) => {
    if (type === 'service_start') return 'play';
    if (type === 'completion') return 'check';
    if (type === 'rework_request') return 'rotate-ccw';
    return 'check-circle';
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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
  if (accepting.value || roleError.value) return;

  uni.showModal({
    title: '确认验收',
    content: '服务验收通过后，我们将为您跳转评价页面并奖励积分奖励（视供应商设定而定）。是否确认满意操作？',
    confirmColor: '#10b981',
    success: async (res) => {
      if (res.confirm) {
        accepting.value = true;
        try {
          const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
          const apiRes: any = await uni.request({
            url: `${API_BASE}/orders-v2/${orderId.value}/accept-service`,
            method: 'POST',
            header: { Authorization: `Bearer ${getToken()}` }
          });
          
          if (apiRes.data?.success) {
            uni.showToast({ title: '验收成功', icon: 'success' });
            setTimeout(() => {
              // Redirect to review page with the hash context preserved
              uni.redirectTo({ 
                url: `/pages/order/review?id=${orderId.value}`
              });
            }, 1200);
          } else {
             const errMsg = apiRes.data?.message || '验收失败';
             if (apiRes.statusCode === 403) {
                 roleError.value = true;
                 uni.showToast({ title: '权限不足', icon: 'none' });
             } else {
                 uni.showToast({ title: errMsg, icon: 'none' });
             }
          }
        } catch (e) {
          uni.showToast({ title: '连接服务器失败', icon: 'none' });
        } finally {
          accepting.value = false;
        }
      }
    }
  });
};

const handleRework = async () => {
  if (!reworkDescription.value.trim() || reworking.value) return;

  reworking.value = true;
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const res: any = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}/request-rework-v2`,
      method: 'POST',
      header: { Authorization: `Bearer ${getToken()}` },
      data: {
        photos: reworkPhotos.value,
        description: reworkDescription.value.trim()
      }
    });
    
    if (res.data?.success) {
      uni.showToast({ title: '已提交申请', icon: 'success' });
      showReworkModal.value = false;
      setTimeout(() => fetchData(), 1500);
    } else {
      uni.showToast({ title: res.data?.message || '提交失败', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' });
  } finally {
    reworking.value = false;
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
  background: #1f2937; 
  padding: 0 16px; 
  border-bottom: 1px solid #374151;
  z-index: 100;
}
.pt-safe { padding-top: env(safe-area-inset-top); }
.header-row { display: flex; align-items: center; justify-content: space-between; height: 56px; }
.header-title { font-size: 18px; font-weight: bold; color: #ffffff; }
.header-back, .header-placeholder { width: 44px; display: flex; align-items: center; }

/* Role Error Tip */
.role-error-tip {
    background: rgba(245, 158, 11, 0.1);
    border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    padding: 12px 16px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: flex-start;
}
.role-error-text {
    font-size: 12px;
    color: #f59e0b;
    line-height: 1.5;
    flex: 1;
}

.content-scroll { flex: 1; }
.content-wrapper { padding: 16px; }

.loading-state {
    padding: 100px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.loading-spinner {
    width: 30px;
    height: 30px;
    border: 2px solid #374151;
    border-top-color: #10b981;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 10px;
}
.loading-text { color: #9ca3af; font-size: 14px; }

/* Brief Card */
.order-brief {
    background: #1f2937;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #374151;
}
.brief-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}
.order-id { font-size: 12px; color: #9ca3af; font-family: monospace; }
.status-badge {
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
}
.status-badge.pending_verification { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.status-badge.verified, .status-badge.completed { background: rgba(16, 185, 129, 0.2); color: #10b981; }

.service-name {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
}

/* Section Header */
.section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
}
.header-dot { width: 4px; height: 16px; border-radius: 2px; background: #10b981; }
.section-title { font-size: 16px; font-weight: 600; color: #ffffff; }

/* Timeline */
.timeline {
    padding-left: 10px;
}
.timeline-item {
    position: relative;
    padding-left: 36px;
    padding-bottom: 30px;
}
.timeline-line {
    position: absolute;
    left: 8px;
    top: 24px;
    bottom: -6px;
    width: 2px;
    background: #374151;
}
.timeline-node {
    position: absolute;
    left: 0;
    top: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4b5563;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow: 0 0 0 4px #111827;
}
.v-type-label { font-size: 15px; font-weight: 600; color: #ffffff; }
.v-time { font-size: 11px; color: #6b7280; }
.v-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.timeline-content {
    background: #1f2937;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #374151;
}

.node-blue { background: #3b82f6; }
.node-success { background: #10b981; }
.node-rework { background: #f59e0b; }

.photos-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}
.timeline-photo {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    background: #374151;
}

.v-desc-bubble {
    background: rgba(255,255,255,0.05);
    padding: 10px;
    border-radius: 8px;
}
.v-desc-text { font-size: 13px; color: #d1d5db; line-height: 1.5; }

/* Action Footer */
.action-footer {
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
    background: rgba(17, 24, 39, 0.8);
    backdrop-filter: blur(20px);
    border-top: 1px solid #374151;
}
.action-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.action-hint {
    font-size: 12px;
    color: #9ca3af;
    text-align: center;
}
.action-buttons {
    display: flex;
    gap: 12px;
}
.btn {
    flex: 1;
    height: 50px;
    border-radius: 14px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
}
.btn-text { font-size: 15px; font-weight: 600; color: #fff; }

.btn-issue { background: #374151; }
.btn-satisfied { background: #10b981; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3); }
.btn-loading { opacity: 0.7; }

.btn:disabled { opacity: 0.5; }

/* Modal Styles */
.rework-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.modal-label { font-size: 13px; color: #9ca3af; font-weight: 500; }
.required { color: #ef4444; }
.photo-uploader {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.uploaded-photo {
    width: 60px;
    height: 60px;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
}
.photo-img { width: 100%; height: 100%; }
.photo-remove {
    position: absolute; top: 2px; right: 2px; width: 16px; height: 16px;
    background: rgba(0,0,0,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.photo-add {
    width: 60px; height: 60px; border: 1.5px dashed #374151;
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
}
.rework-textarea {
    width: 100%; height: 120px; background: #111827; border: 1px solid #374151;
    border-radius: 12px; padding: 12px; color: #fff; font-size: 14px;
}

.mini-spinner {
    width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
}

.bottom-spacer { height: 40px; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
