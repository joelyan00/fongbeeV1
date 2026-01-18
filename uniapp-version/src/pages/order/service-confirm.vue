<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header pt-safe">
      <view class="header-row">
        <view @click="goBack" class="header-back">
          <AppIcon name="chevron-left" :size="28" style="color: #374151" />
        </view>
        <text class="header-title">确认服务开始</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Access Denied View -->
    <view v-else-if="accessDenied" class="error-container">
      <AppIcon name="shield-off" :size="48" color="#ef4444" />
      <text class="error-title">无权访问</text>
      <text class="error-desc">您当前登录的账户（{{ user?.phone || '未知' }}）不是此订单的下单用户，无法查看订单详情。</text>
      <view class="btn-group-center">
        <view class="action-btn outline" @click="handleSwitchAccount">切换账号</view>
        <view class="action-btn primary" @click="goHome">返回首页</view>
      </view>
    </view>

    <!-- Content -->
    <view v-else class="content">
      <view v-if="verification" class="verification-content">
        <!-- Photos -->
        <view v-if="verification?.photos?.length" class="photos-section">
          <text class="section-title">现场照片</text>
          <scroll-view scroll-x class="photos-scroll">
            <view class="photos-row">
              <image 
                v-for="(photo, index) in verification.photos" 
                :key="index"
                :src="photo"
                mode="aspectFill"
                class="photo-img"
                @click="previewPhoto(Number(index))"
              />
            </view>
          </scroll-view>
        </view>

        <!-- Description -->
        <view class="description-section">
          <text class="section-title">报告内容</text>
          <view class="description-box">
            <text class="description-text">{{ verification?.description }}</text>
          </view>
        </view>
      </view>

      <!-- Placeholder for Direct Start -->
      <view v-else class="direct-start-box">
        <view class="info-card">
          <view class="info-header">
            <AppIcon name="user" :size="20" style="color: #10b981" />
            <text class="info-title">服务进行中</text>
          </view>
          <text class="info-time">服务商已直接开始工作</text>
          <text class="direct-desc">该订单已设置为快速开始，无需提交照片报告。</text>
        </view>
      </view>

      <!-- Notice -->
      <view v-if="!isExpired && !order?.deposit_transferred_at" class="notice-card">
        <AppIcon name="alert-circle" :size="20" style="color: #f59e0b" />
        <text class="notice-text">服务已在进行中。如果您对现场状态有异议，请在2小时内拒绝，否则定金将自动放行。</text>
      </view>

      <view v-if="order?.deposit_transferred_at" class="notice-card success">
        <AppIcon name="check-circle" :size="20" style="color: #10b981" />
        <text class="notice-text">定金已释放给服务商，服务正在进行中。</text>
      </view>

      <!-- Expired Notice -->
      <view v-if="isExpired && !order?.deposit_transferred_at" class="notice-card expired">
        <AppIcon name="alert-circle" :size="20" style="color: #ef4444" />
        <text class="notice-text">该请求已超时，定金将由系统后台逻辑自动放行。</text>
      </view>
    </view>

    <!-- AppModal: Confirm Deposit Release -->
    <AppModal
      v-model="showConfirmModal"
      title="放行定金"
      content="如果您现在确认，定金将立即支付给服务商。确定继续吗？"
      icon="dollar-sign"
      iconColor="#10b981"
      iconBgColor="rgba(16, 185, 129, 0.1)"
      :loading="confirming"
      @confirm="executeConfirm"
    />

    <!-- Refusal Modal (Converted Style) -->
    <view v-if="showRefuseModal" class="modal-mask" @click="showRefuseModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">拒绝开工请求</text>
        </view>
        <view class="modal-body">
          <textarea 
            v-model="refuseReason" 
            placeholder="请输入拒绝理由（必填）" 
            class="reason-input"
            focus
          />
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showRefuseModal = false">取消</view>
          <view 
            class="modal-btn confirm" 
            :class="{ 'btn-disabled': refusing || refuseReason.length === 0 }"
            @click="handleRefuseSubmit"
          >
            {{ refusing ? '提交中...' : '确认拒绝' }}
          </view>
        </view>
      </view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <view class="btn-group">
        <view v-if="!isExpired && !order?.deposit_transferred_at" class="refuse-btn" :class="{ 'btn-disabled': confirming || refusing }" @click="showRefuseModal = true">
          <text class="btn-text">拒绝并反馈</text>
        </view>
        <view class="confirm-btn" :class="{ 'btn-disabled': confirming || refusing || isExpired || order?.deposit_transferred_at }" @click="handleConfirm">
          <text class="btn-text">{{ confirming ? '处理中...' : (isExpired ? '已失效' : (order?.deposit_transferred_at ? '定金已放行' : '确认开始服务')) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import AppModal from '@/components/AppModal.vue';
import { getToken, getUserInfo, clearAuth, API_BASE_URL, ordersV2Api } from '@/services/api';

const orderId = ref('');
const loading = ref(true);
const confirming = ref(false);
const refusing = ref(false);
const verification = ref<any>(null);
const order = ref<any>(null);
const user = ref<any>(null);
const isExpired = ref(false);
const showRefuseModal = ref(false);
const showConfirmModal = ref(false);
const refuseReason = ref('');

const accessDenied = ref(false);

onLoad((options) => {
  // Auth check
  if (!getToken()) {
      const currentPage = `/pages/order/service-confirm${options ? `?id=${options.id}` : ''}`;
      const loginUrl = `/pages/index/register?redirect=${encodeURIComponent(currentPage)}`;
      uni.redirectTo({ url: loginUrl });
      return;
  }
  
  user.value = getUserInfo();

  if (options?.id) {
    orderId.value = options.id;
    fetchVerification();
  }
});

const goBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        // Fallback to user profile/orders page if no history
        uni.reLaunch({ url: '/pages/index/index?tab=profile' });
    }
};
const goHome = () => uni.reLaunch({ url: '/pages/index/index' });

const handleSwitchAccount = () => {
    clearAuth();
    const currentPage = `/pages/order/service-confirm?id=${orderId.value}`;
    uni.reLaunch({ url: `/pages/index/register?redirect=${encodeURIComponent(currentPage)}` });
};

const fetchVerification = async () => {
  try {
    const API_BASE = API_BASE_URL;
    
    // Fetch order to check status and deadline
    const orderRes = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}`,
      method: 'GET',
      header: { Authorization: `Bearer ${getToken()}` }
    });

    if (orderRes.statusCode === 403) {
        accessDenied.value = true;
        loading.value = false;
        return;
    }
    
    const orderData = orderRes.data as any;
    if (orderData.success) {
      order.value = orderData.order;
      if (order.value.verification_deadline) {
        isExpired.value = new Date() > new Date(order.value.verification_deadline);
      }
    } else {
        uni.showToast({ title: orderData.message || '加载失败', icon: 'none' });
    }

    if (!accessDenied.value) {
        // Fetch verifications
        const res = await uni.request({
            url: `${API_BASE}/orders-v2/${orderId.value}/verifications`,
            method: 'GET',
            header: { Authorization: `Bearer ${getToken()}` }
        });
        
        const data = res.data as any;
        if (data.success && data.verifications) {
            // Get the latest service_start verification
            verification.value = data.verifications
            .filter((v: any) => v.type === 'service_start' && v.submitted_by === 'provider')
            .pop();
        }
    }
  } catch (e) {
    console.error('Fetch verification error:', e);
    // uni.showToast({ title: 'System Error', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const previewPhoto = (index: number) => {
  uni.previewImage({
    current: index,
    urls: verification.value?.photos || []
  });
};

const handleConfirm = () => {
  if (isExpired.value || order.value?.deposit_transferred_at) return;
  showConfirmModal.value = true;
};

const executeConfirm = async () => {
  confirming.value = true;
  try {
    const API_BASE = API_BASE_URL;
    const res = await uni.request({
      url: `${API_BASE}/orders-v2/${orderId.value}/confirm-start`,
      method: 'POST',
      header: { Authorization: `Bearer ${getToken()}` }
    });

    const data = res.data as any;
    if (data.success) {
      uni.showToast({ title: '已放行定金', icon: 'success' });
      showConfirmModal.value = false;
      setTimeout(() => {
        fetchVerification(); // Refresh state
      }, 1500);
    } else {
      uni.showToast({ title: data.message || '确认失败', icon: 'none' });
    }
  } catch (e: any) {
    uni.showToast({ title: '确认失败', icon: 'none' });
  } finally {
    confirming.value = false;
  }
};

const handleRefuseSubmit = async () => {
  if (!refuseReason.value.trim()) return;
  
  refusing.value = true;
  try {
    const data = await ordersV2Api.refuseStart(orderId.value, refuseReason.value);

    if (data.success) {
      uni.showToast({ title: '已提交不信任反馈', icon: 'success' });
      showRefuseModal.value = false;
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/index/index?tab=profile' });
      }, 1500);
    } else {
      uni.showToast({ title: data.message || '操作失败', icon: 'none' });
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' });
  } finally {
    refusing.value = false;
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

.loading-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-text { color: #9ca3af; font-size: 15px; }

.content {
  flex: 1;
  padding: 16px;
}

.info-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}
.info-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.info-title { font-size: 16px; font-weight: 600; color: #111827; }
.info-time { font-size: 13px; color: #9ca3af; }

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 12px;
}

.photos-section {
  margin-bottom: 16px;
}
.photos-scroll {
  white-space: nowrap;
}
.photos-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
}
.photo-img {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  flex-shrink: 0;
}

.description-section {
  margin-bottom: 16px;
}
.description-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
}
.description-text {
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
}

.notice-card {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}
.notice-text {
  flex: 1;
  font-size: 13px;
  color: #92400e;
  line-height: 1.4;
}

.notice-card.expired {
  background: #fef2f2;
  border-color: #fecaca;
}
.notice-card.expired .notice-text {
  color: #991b1b;
}

.notice-card.success {
  background: #ecfdf5;
  border-color: #d1fae5;
}
.notice-card.success .notice-text {
  color: #065f46;
}

.direct-start-box {
  margin-bottom: 16px;
}
.direct-desc {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}

.footer {
  padding: 20px 24px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background: #ffffff;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.btn-group {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
}
.refuse-btn {
  flex: 1;
  height: 54px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 16px;
  color: #e11d48;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(225, 29, 72, 0.05);
}
.refuse-btn:active {
  transform: scale(0.97);
  background: #ffe4e6;
}
.confirm-btn {
  flex: 2;
  height: 54px;
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  border: none;
  border-radius: 16px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
}
.confirm-btn:active {
  transform: scale(0.97);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}
.btn-disabled {
  background: #f3f4f6 !important;
  border-color: #e5e7eb !important;
  color: #9ca3af !important;
  box-shadow: none !important;
  pointer-events: none !important;
}

/* Modal */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  width: 85%;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}
.modal-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
}
.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}
.modal-body {
  padding: 20px;
}
.reason-input {
  width: 100%;
  height: 120px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  box-sizing: border-box;
}
.modal-footer {
  display: flex;
  border-top: 1px solid #f3f4f6;
}
.modal-btn {
  flex: 1;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  background: transparent;
  border: none;
  border-radius: 0;
}
.modal-btn.cancel {
  color: #6b7280;
  border-right: 1px solid #f3f4f6;
}
.modal-btn.confirm {
  color: #10b981;
  font-weight: 700;
}
.modal-btn.confirm.btn-disabled {
  color: #d1d5db !important;
  pointer-events: none !important;
}
.modal-btn:active {
  background-color: #f9fafb;
}

/* Access Denied Styles */
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  text-align: center;
}
.error-title {
  font-size: 20px;
  font-weight: bold;
  color: #111827;
  margin-top: 16px;
  margin-bottom: 8px;
}
.error-desc {
  font-size: 14px;
  color: #6b7280;
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
  border: 1px solid #d1d5db;
  color: #374151;
  background: white;
}
.action-btn.primary {
  background: #10b981;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}
</style>
