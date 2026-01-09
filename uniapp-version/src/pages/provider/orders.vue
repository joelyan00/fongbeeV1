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
          <text class="header-subtitle">管理您的订单，提供优质服务</text>
        </view>
      </view>
    </view>

    <!-- Tab Filters with Scroll Indicator -->
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
            :class="['tab-item', activeTab === tab.key ? 'tab-active' : '']"
          >
            <text :class="['tab-label', activeTab === tab.key ? 'tab-label-active' : '']">{{ tab.label }}</text>
            <view v-if="getTabCount(tab.key) > 0" :class="['tab-badge', activeTab === tab.key ? 'badge-active' : '']">
              <text class="badge-text">{{ getTabCount(tab.key) }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- Scroll Indicator -->
      <view class="scroll-indicator-container">
        <view class="scroll-track">
          <view class="scroll-thumb" :style="{ width: scrollThumbWidth + '%', left: scrollPosition + '%' }"></view>
        </view>
        <text class="scroll-hint">← 左右滑动查看更多 →</text>
      </view>
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
/* Page Container - Light Theme */
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdf4 0%, #f9fafb 100%);
  padding-top: env(safe-area-inset-top);
}

/* Header */
.header {
  position: relative;
  padding-bottom: 20px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
  border-radius: 0 0 24px 24px;
}

.header-content {
  position: relative;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info {
  margin-left: 12px;
  flex: 1;
}

.header-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  display: block;
}

.header-subtitle {
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  margin-top: 4px;
  display: block;
}

/* Tabs Section */
.tabs-section {
  background: #ffffff;
  margin: 0 16px;
  border-radius: 16px;
  padding: 16px 0 12px 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-top: -10px;
  position: relative;
  z-index: 5;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 0 16px;
}

.tab-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f3f4f6;
  border-radius: 20px;
  flex-shrink: 0;
}

.tab-active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.tab-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.tab-label-active {
  color: #ffffff;
  font-weight: 600;
}

.tab-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #e5e7eb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-active {
  background: rgba(255,255,255,0.3);
}

.badge-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.badge-active .badge-text {
  color: #ffffff;
}

/* Scroll Indicator */
.scroll-indicator-container {
  padding: 12px 16px 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.scroll-track {
  width: 60px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.scroll-thumb {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 2px;
  transition: left 0.1s ease-out;
}

.scroll-hint {
  font-size: 11px;
  color: #9ca3af;
}

/* List Container */
.list-container {
  padding: 16px;
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
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
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
  background: #ffffff;
  border-radius: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #6b7280;
}

/* Order Cards */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.order-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  border: 1px solid #f3f4f6;
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f3f4f6;
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
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
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
  color: #111827;
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
  color: #ef4444;
  font-weight: 600;
}

.price-value {
  font-size: 20px;
  color: #ef4444;
  font-weight: 700;
  margin-left: 2px;
}

.card-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.create-time {
  font-size: 12px;
  color: #9ca3af;
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
  gap: 4px;
  padding: 8px 14px;
  border-radius: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-secondary {
  background: #f3f4f6;
}

.btn-text {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.btn-text-gray {
  color: #6b7280;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}

.modal-content {
  width: 100%;
  max-width: 360px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
}

.modal-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.modal-close {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-desc {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
  display: block;
}

.verify-input {
  width: 100%;
  text-align: center;
  font-size: 24px;
  letter-spacing: 0.2em;
  font-family: monospace;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
  color: #111827;
}

.error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 16px;
}

.error-text {
  font-size: 13px;
  color: #dc2626;
}

.modal-actions {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-btn-cancel {
  background: #f3f4f6;
}

.modal-btn-confirm {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-disabled {
  opacity: 0.5;
}

.btn-cancel-text {
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
}

.btn-confirm-text {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
