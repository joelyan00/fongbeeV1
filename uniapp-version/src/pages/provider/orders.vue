<template>
  <view class="page-container">
    <!-- Gradient Header -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view @click="goBack" class="back-btn">
          <AppIcon name="arrow-left" :size="22" color="#ffffff" />
        </view>
        <view class="header-info">
          <text class="header-title">标准服务订单管理</text>
        </view>
      </view>
    </view>

    <!-- Tab Filters (Minimalist Chips) -->
    <view class="tabs-section">
      <scroll-view 
        scroll-x 
        :show-scrollbar="false" 
        class="tabs-scroll"
        @scroll="onTabScroll"
      >
        <view class="tabs-row">
          <view 
            v-for="tab in statusTabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="['tab-item', activeTab === tab.key ? 'tab-active' : 'tab-inactive']"
          >
            <text :class="['tab-label', activeTab === tab.key ? 'tab-label-active' : '']">{{ tab.label }}</text>
            <view v-if="getTabCount(tab.key) > 0" :class="['tab-badge', activeTab === tab.key ? 'badge-active' : '']">
              <text class="badge-text">{{ getTabCount(tab.key) }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Order List -->
    <scroll-view scroll-y class="list-container" :style="{ height: listHeight }">
      <!-- Loading State -->
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- Empty State -->
      <view v-else-if="filteredOrders.length === 0" class="empty-container">
        <view class="empty-illustration">
          <view class="empty-circle">
            <view class="empty-icon-wrap">
              <AppIcon name="clipboard" :size="48" color="#10b981" />
            </view>
          </view>
        </view>
        <text class="empty-title">暂无订单</text>
        <text class="empty-desc">当前筛选条件下没有订单</text>
      </view>

      <!-- Order Cards -->
      <view v-else class="order-list">
        <view 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="order-card"
          @click="handleAction('view', order)"
        >
          <!-- Card Header with Status -->
          <view class="card-header">
            <view :class="['status-tag', `status-${order.status}`]">
              <view class="status-dot"></view>
              <text class="status-text">{{ getStatusLabel(order.status) }}</text>
            </view>
            <text class="order-no">{{ order.order_no }}</text>
          </view>
          
          <!-- Card Body -->
          <view class="card-body">
            <view class="order-image-wrap">
              <image v-if="order.service_image" :src="order.service_image" mode="aspectFill" class="order-image" />
              <view v-else class="order-placeholder">
                <text class="placeholder-emoji">🛠️</text>
              </view>
            </view>
            <view class="order-info">
              <text class="order-title">{{ order.service_title || order.service_type || '清洁服务' }}</text>
              <text class="order-desc">{{ order.requirements || '暂无备注' }}</text>
              <view class="price-row">
                <text class="price-label">订单金额</text>
                <view class="price-value-wrap">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ order.total_amount }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- Card Footer -->
          <view class="card-footer">
            <text class="create-time">{{ formatDate(order.created_at) }}</text>
            <view class="action-buttons">
              <view 
                v-for="action in getOrderActions(order)" 
                :key="action.key"
                @click.stop="handleAction(action.key, order)"
                :class="['btn', action.primary ? 'btn-primary' : 'btn-secondary']"
              >
                <text :class="['btn-text', action.primary ? '' : 'btn-text-gray']">{{ action.label }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Verify Code Modal -->
    <view 
      v-if="showVerifyModal" 
      class="modal-overlay"
      @click="showVerifyModal = false"
    >
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">验证服务码</text>
          <view @click="showVerifyModal = false" class="modal-close">
            <AppIcon name="x" :size="20" color="#6b7280" />
          </view>
        </view>
        
        <text class="modal-desc">请输入用户收到的 6 位短信验证码以解锁定金。</text>
        
        <input 
          type="number"
          v-model="verificationCode"
          placeholder="6位数字验证码"
          class="verify-input"
          maxlength="6"
        />
        
        <view v-if="verifyError" class="error-box">
          <text class="error-text">{{ verifyError }}</text>
        </view>
        
        <view class="modal-actions">
          <view @click="showVerifyModal = false" class="modal-btn modal-btn-cancel">
            <text class="btn-cancel-text">取消</text>
          </view>
          <view 
            @click="handleVerifyCode" 
            :class="['modal-btn modal-btn-confirm', verificationCode.length === 6 ? '' : 'btn-disabled']"
          >
            <view v-if="actionLoading" class="loading-spinner-sm"></view>
            <text v-else class="btn-confirm-text">确认验证</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { ordersV2Api } from '@/services/api';

interface Order {
  id: string;
  order_no: string;
  status: string;
  service_type: string;
  total_amount: number;
  deposit_amount: number;
  created_at: string;
  service_title?: string;
  service_image?: string;
  requirements?: string;
  quantity?: number;
}

const statusTabs = [
  { key: 'all', label: '全部', statuses: [] },
  { key: 'pending_payment', label: '待付款', statuses: ['created', 'auth_hold'] },
  { key: 'pending_service', label: '待上门', statuses: ['captured'] },
  { key: 'pending_verify', label: '待验收', statuses: ['pending_verification'] },
  { key: 'in_progress', label: '服务中', statuses: ['in_progress'] },
  { key: 'completed', label: '已完成', statuses: ['verified', 'rated', 'completed'] },
  { key: 'cancelled', label: '已取消', statuses: ['cancelled', 'cancelled_by_provider', 'cancelled_forfeit'] },
];

const activeTab = ref('all');
const orders = ref<Order[]>([]);
const loading = ref(true);
const actionLoading = ref(false);
const listHeight = ref('calc(100vh - 280px)');

// Scroll indicator
const scrollPosition = ref(0);
const scrollThumbWidth = ref(30);

// Verify modal
const showVerifyModal = ref(false);
const selectedOrder = ref<Order | null>(null);
const verificationCode = ref('');
const verifyError = ref('');

const onTabScroll = (e: any) => {
  const scrollLeft = e.detail.scrollLeft;
  const scrollWidth = e.detail.scrollWidth;
  const clientWidth = 375; // approximate screen width
  const maxScroll = scrollWidth - clientWidth;
  if (maxScroll > 0) {
    scrollPosition.value = (scrollLeft / maxScroll) * (100 - scrollThumbWidth.value);
  }
};

const filteredOrders = computed(() => {
  const tab = statusTabs.find(t => t.key === activeTab.value);
  if (!tab || tab.key === 'all') return orders.value;
  return orders.value.filter(o => tab.statuses.includes(o.status));
});

const getTabCount = (key: string) => {
  const tab = statusTabs.find(t => t.key === key);
  if (!tab || key === 'all') return orders.value.length;
  return orders.value.filter(o => tab.statuses.includes(o.status)).length;
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'created': '待付款',
    'auth_hold': '待付款',
    'captured': '待上门',
    'in_progress': '服务中',
    'pending_verification': '待验收',
    'rework': '需返工',
    'verified': '已完成',
    'rated': '已评价',
    'completed': '已完成',
    'cancelled': '已取消',
    'cancelled_by_provider': '商家取消',
    'cancelled_forfeit': '违约取消',
  };
  return map[status] || status;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getOrderActions = (order: Order) => {
  const actions = [];
  
  switch (order.status) {
    case 'created':
    case 'auth_hold':
      actions.push({ key: 'modify', label: '修改订金', primary: true });
      break;
    case 'captured':
      actions.push({ key: 'start', label: '开始服务', primary: true });
      break;
    case 'in_progress':
      actions.push({ key: 'verify', label: '服务验收', primary: true });
      break;
    case 'pending_verification':
      actions.push({ key: 'accept', label: '发起验收', primary: true });
      break;
    case 'verified':
    case 'completed':
      actions.push({ key: 'recontact', label: '重新接触', primary: true });
      break;
  }
  
  actions.push({ key: 'view', label: '详情', primary: false });
  
  return actions;
};

const handleAction = async (action: string, order: Order) => {
  switch (action) {
    case 'start':
      uni.showModal({
        title: '确认开始服务',
        content: '确定要开始服务吗？反悔期将结束，定金将不可退还。',
        confirmColor: '#10b981',
        success: async (res) => {
          if (res.confirm) {
            try {
              actionLoading.value = true;
              await ordersV2Api.startService(order.id);
              uni.showToast({ title: '服务已开始', icon: 'success' });
              fetchOrders();
            } catch (e: any) {
              uni.showToast({ title: e.message || '操作失败', icon: 'none' });
            } finally {
              actionLoading.value = false;
            }
          }
        }
      });
      break;
    case 'verify':
      selectedOrder.value = order;
      verificationCode.value = '';
      verifyError.value = '';
      showVerifyModal.value = true;
      break;
    case 'accept':
      uni.showModal({
        title: '确认发起验收',
        content: '确定服务已完成并申请验收吗？',
        confirmColor: '#10b981',
        success: async (res) => {
          if (res.confirm) {
            try {
              actionLoading.value = true;
              await ordersV2Api.requestAcceptance(order.id, '');
              uni.showToast({ title: '验收申请已发送', icon: 'success' });
              fetchOrders();
            } catch (e: any) {
              uni.showToast({ title: e.message || '操作失败', icon: 'none' });
            } finally {
              actionLoading.value = false;
            }
          }
        }
      });
      break;
    case 'view':
      uni.navigateTo({
        url: `/pages/provider/order-detail?id=${order.id}`
      });
      break;
    default:
      uni.showToast({ title: '功能开发中', icon: 'none' });
  }
};

const handleVerifyCode = async () => {
  if (!selectedOrder.value || verificationCode.value.length !== 6) return;
  
  actionLoading.value = true;
  verifyError.value = '';
  
  try {
    await ordersV2Api.verifyCode(selectedOrder.value.id, verificationCode.value);
    uni.showToast({ title: '验证成功！定金已解锁', icon: 'success' });
    showVerifyModal.value = false;
    fetchOrders();
  } catch (e: any) {
    verifyError.value = e.message || '验证失败';
  } finally {
    actionLoading.value = false;
  }
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await ordersV2Api.getMyOrders({ role: 'provider' });
    if (res.success && res.orders) {
      orders.value = res.orders;
    }
  } catch (e) {
    console.error('Fetch orders error:', e);
    uni.showToast({ title: '获取订单失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
/* Page Container - Dark Theme */
.page-container {
  min-height: 100vh;
  background: #111827;
  padding-top: env(safe-area-inset-top);
}

/* Header */
.header {
  position: relative;
  border-bottom: 1px solid #374151;
  background: #1f2937;
}

.header-bg {
  display: block; /* Visually consistent gradient background */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.header-content {
  position: relative;
  z-index: 10;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 60px; /* Aligned with service management */
}

.back-btn {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info {
  margin-left: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  display: block;
}

/* Removed Subtitle */

/* Tabs Section */
.tabs-section {
  background: transparent;
  margin: 16px 0;
  padding: 0;
  border: none;
  box-shadow: none;
  border-radius: 0;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 0 16px;
}

/* Minimalist Chip Styles */
.tab-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid transparent;
  flex-shrink: 0;
  transition: all 0.2s ease;
  background: #1f2937;
  border: 1px solid #374151;
}

.tab-inactive {
  background: transparent;
  border-color: #374151;
}

.tab-active {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.tab-label {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}

.tab-label-active {
  color: #10b981;
  font-weight: 600;
}

.tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: rgba(255,255,255,0.1);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-active {
  background: #10b981;
}

.badge-text {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 600;
}

.badge-active .badge-text {
  color: #ffffff;
}

/* List Container */
.list-container {
  padding: 0 16px;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner-sm {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #9ca3af;
}

/* Empty State */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.empty-illustration {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.empty-circle {
  width: 100px;
  height: 100px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 10px;
  left: 10px;
}

.empty-icon-wrap {
  width: 70px;
  height: 70px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #9ca3af;
}

/* Order Cards */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.order-card {
  background: #1f2937;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  border: 1px solid #374151;
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid #374151;
}

.status-tag {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
}

.status-created, .status-auth_hold { background: #fef3c7; }
.status-captured { background: #cffafe; }
.status-in_progress { background: #e0e7ff; }
.status-pending_verification { background: #fef9c3; }
.status-verified, .status-rated, .status-completed { background: #d1fae5; }
.status-cancelled, .status-cancelled_by_provider, .status-cancelled_forfeit { background: #f3f4f6; }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
}

.status-created .status-dot, .status-auth_hold .status-dot { background: #f59e0b; }
.status-captured .status-dot { background: #06b6d4; }
.status-in_progress .status-dot { background: #6366f1; }
.status-pending_verification .status-dot { background: #eab308; }
.status-verified .status-dot, .status-rated .status-dot, .status-completed .status-dot { background: #10b981; }
.status-cancelled .status-dot, .status-cancelled_by_provider .status-dot, .status-cancelled_forfeit .status-dot { background: #9ca3af; }

.status-text {
  font-size: 12px;
  font-weight: 500;
}

.status-created .status-text, .status-auth_hold .status-text { color: #b45309; }
.status-captured .status-text { color: #0891b2; }
.status-in_progress .status-text { color: #4f46e5; }
.status-pending_verification .status-text { color: #a16207; }
.status-verified .status-text, .status-rated .status-text, .status-completed .status-text { color: #059669; }
.status-cancelled .status-text, .status-cancelled_by_provider .status-text, .status-cancelled_forfeit .status-text { color: #6b7280; }

.order-no {
  font-size: 11px;
  color: #9ca3af;
  font-family: monospace;
}

.card-body {
  display: flex;
  flex-direction: row;
  gap: 14px;
  padding: 16px;
}

.order-image-wrap {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.order-image {
  width: 100%;
  height: 100%;
}

.order-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(16, 185, 129, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-emoji {
  font-size: 28px;
}

.order-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.order-title {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-desc {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-row {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
}

.price-label {
  font-size: 12px;
  color: #9ca3af;
}

.price-value-wrap {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  color: #10b981;
  font-weight: 600;
}

.price-value {
  font-size: 18px;
  color: #ffffff;
  font-weight: 700;
  margin-left: 2px;
}

/* Card Footer */
.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #374151;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.create-time {
  font-size: 12px;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: #10b981;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #4b5563;
}

.btn-text {
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
}

.btn-text-gray {
  color: #d1d5db;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 85%;
  max-width: 320px;
  background: #1f2937;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #374151;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.modal-close {
  padding: 4px;
}

.modal-desc {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 20px;
  line-height: 1.5;
}

.verify-input {
  width: 100%;
  height: 48px;
  background: #111827;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 0 16px;
  color: #ffffff;
  font-size: 16px;
  text-align: center;
  letter-spacing: 4px;
  margin-bottom: 24px;
}

.error-box {
  margin-top: -16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.error-text {
  color: #ef4444;
  font-size: 12px;
}

.modal-actions {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.modal-btn-cancel {
  background: #374151;
  color: #d1d5db;
}

.modal-btn-confirm {
  background: #10b981;
  color: #ffffff;
}

.btn-disabled {
  opacity: 0.5;
  pointer-events: none;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
