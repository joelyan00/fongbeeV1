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

    <!-- Access Denied View -->
    <view v-if="accessDenied" class="error-container">
      <AppIcon name="shield-off" :size="48" color="#ef4444" />
      <text class="error-title">无权访问</text>
      <text class="error-desc">您当前登录的账户（{{ user?.phone || '未知' }}）不是此订单的下单用户，无法查看订单详情。</text>
      <view class="btn-group-center">
        <view class="action-btn outline" @click="handleSwitchAccount">切换账号</view>
        <view class="action-btn primary" @click="goHome">返回首页</view>
      </view>
    </view>

    <!-- Content -->
    <template v-else>
      <scroll-view scroll-y class="content-scroll">
        <view v-if="loading" class="loading-state">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
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

                  <view v-if="v.description" class="v-desc-bubble" :class="{ 'is-action': v.description.includes('再次验证') }">
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
              :class="{ 'btn-restricted': roleError, 'btn-loading': accepting }"
              @click="handleIssueClick"
            >
              <AppIcon name="alert-circle" :size="20" color="#ffffff" />
              <text class="btn-text">我有问题</text>
            </button>
            <button 
              class="btn btn-satisfied" 
              :class="{ 'btn-restricted': roleError, 'btn-loading': accepting }"
              @click="handleSatisfied"
            >
              <view v-if="accepting" class="mini-spinner"></view>
              <template v-else>
                <AppIcon name="check-circle" :size="20" color="#ffffff" />
                <text class="btn-text">我很满意</text>
              </template>
            </button>
          </view>
        </view>
      </view>
    </template>

    <!-- Rework Modal -->
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

    <!-- Satisfied Confirm Modal -->
    <AppModal
      v-model="showSatisfiedModal"
      title="确认验收"
      description="服务验收通过后，我们将为您跳转评价页面并奖励积分（具体视供应商设定而定）。确认满意吗？"
      icon="check-circle"
      icon-color="#10b981"
      icon-bg-color="rgba(16, 185, 129, 0.1)"
      confirm-text="确认满意"
      cancel-text="再等等"
      :loading="accepting"
      @confirm="onConfirmSatisfied"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import AppModal from '@/components/AppModal.vue';
import { getToken, getUserInfo, clearAuth, API_BASE_URL } from '@/services/api';

const orderId = ref('');
const loading = ref(true);
const accepting = ref(false);
const reworking = ref(false);
const verifications = ref<any[]>([]);
const orderStatus = ref('');
const orderTitle = ref('');
const roleError = ref(false);
const user = ref<any>(null);
const accessDenied = ref(false);

const showReworkModal = ref(false);
const reworkPhotos = ref<string[]>([]);
const reworkDescription = ref('');

const showSatisfiedModal = ref(false);

const canRespond = computed(() => orderStatus.value === 'pending_verification');

onLoad((options) => {
  // Auth check
  if (!getToken()) {
    const currentPage = `/pages/order/verification-confirm${options?.id ? `?id=${options.id}` : ''}`;
    const loginUrl = `/pages/index/register?redirect=${encodeURIComponent(currentPage)}`;
    uni.redirectTo({ url: loginUrl });
    return;
  }
  
  user.value = getUserInfo();

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

const goHome = () => uni.reLaunch({ url: '/pages/index/index' });

const handleSwitchAccount = () => {
    clearAuth();
    const currentPage = `/pages/order/verification-confirm?id=${orderId.value}`;
    uni.reLaunch({ url: `/pages/index/register?redirect=${encodeURIComponent(currentPage)}` });
};

const fetchData = async () => {
  try {
    const API_BASE = API_BASE_URL;
    const token = getToken();

    // Get order details first to check owner
    const oRes: any = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}` }
    });
    
    if (oRes.statusCode === 403) {
        accessDenied.value = true;
        loading.value = false;
        return;
    }

    if (oRes.data?.success) {
        const order = oRes.data.order;
        orderStatus.value = order.status;
        orderTitle.value = order.title || order.service_name;
        
        // Check role conflict: if logged in as provider but it's a user verification page
        if (user.value && user.value.id !== order.user_id) {
            roleError.value = true;
        }
    } else {
        uni.showToast({ title: oRes.data?.message || '加载失败', icon: 'none' });
    }

    // Get verifications (Only if access allowed)
    if (!accessDenied.value) {
        const vRes: any = await uni.request({
          url: `${API_BASE}/orders-v2/${orderId.value}/verifications`,
          method: 'GET',
          header: { Authorization: `Bearer ${token}` }
        });
        verifications.value = vRes.data?.verifications || [];
    }

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

const previewPhoto = (photos: string[], index: any) => {
  uni.previewImage({ current: Number(index), urls: photos });
};

const addReworkPhoto = () => {
  uni.chooseImage({
    count: 3 - reworkPhotos.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      for (const tempPath of res.tempFilePaths) {
        try {
          uni.showLoading({ title: '上传中...' });
          const API_BASE = API_BASE_URL;
          const uploadRes = await new Promise<string>((resolve, reject) => {
            uni.uploadFile({
              url: `${API_BASE}/upload`,
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
          reworkPhotos.value.push(uploadRes);
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

const handleIssueClick = () => {
  if (accepting.value || reworking.value) return;
  if (roleError.value) {
    uni.showToast({ title: '抱歉，服务商账号无法发起验收异议', icon: 'none', duration: 2500 });
    return;
  }
  showReworkModal.value = true;
};

const handleSatisfied = async () => {
  if (accepting.value || reworking.value) return;
  if (roleError.value) {
    uni.showToast({ title: '抱歉，服务商账号无法进行验收', icon: 'none', duration: 2500 });
    return;
  }
  showSatisfiedModal.value = true;
};

const onConfirmSatisfied = async () => {
  accepting.value = true;
  try {
    const API_BASE = API_BASE_URL;
    const apiRes: any = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}/accept-service`,
      method: 'POST',
      header: { Authorization: `Bearer ${getToken()}` }
    });
    
    if (apiRes.data?.success) {
      uni.showToast({ title: '已通过验收', icon: 'success' });
      showSatisfiedModal.value = false;
      setTimeout(() => {
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
};

const handleRework = async () => {
  if (!reworkDescription.value.trim() || reworking.value) return;
  reworking.value = true;
  try {
    const API_BASE = API_BASE_URL;
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

.content-scroll { flex: 1; overflow: hidden; }
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
.btn-text { font-size: 15px; font-weight: 600; color: #ffffff !important; }

.btn-issue { background: #374151 !important; }
.btn-satisfied { 
    background-color: #10b981 !important; 
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.btn-loading { opacity: 0.7; }

.btn-restricted {
    opacity: 0.5;
    filter: grayscale(1);
    background-color: #4b5563 !important;
}

.timeline-content .v-desc-bubble:has(.v-desc-text:empty) {
    display: none;
}

/* Timeline Activity Styling */
.v-desc-bubble.is-action {
    display: inline-block;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    padding: 6px 12px;
    border-radius: 6px;
    margin-top: 8px;
}
.v-desc-bubble.is-action .v-desc-text {
    color: #10b981;
    font-size: 12px;
    font-weight: 600;
}

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
    box-sizing: border-box;
}

.mini-spinner {
    width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
}

.bottom-spacer { height: 40px; }

/* Access Denied Styles */
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  text-align: center;
  background-color: #111827;
}
.error-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin-top: 16px;
  margin-bottom: 8px;
}
.error-desc {
  font-size: 14px;
  color: #9ca3af;
  line-height: 1.6;
  margin-bottom: 32px;
}
.btn-group-center {
  display: flex;
  gap: 16px;
  width: 100%;
}
.action-btn {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
}
.action-btn.outline {
  border: 1px solid #374151;
  color: #d1d5db;
  background: transparent;
}
.action-btn.primary {
  background: #10b981;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
