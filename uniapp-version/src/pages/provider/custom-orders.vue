<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" class="text-white"/>
      </view>
      <text class="header-title">定制服务订单管理</text>
      <view class="placeholder-btn"></view>
    </view>

    <!-- Tab Filters (Visual Optimization: Gradient Mask) -->
    <view class="tabs-wrapper">
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
      <!-- Gradient Mask Overlay -->
      <view class="scroll-mask"></view>
    </view>

    <!-- Date Filter (Styled) -->
    <view class="filter-section">
      <view class="filter-card">
        <AppIcon name="calendar" :size="16" color="#9ca3af" class="filter-icon" />
        <view class="date-picker-group">
          <picker mode="date" :value="startDate" @change="onStartDateChange" class="date-picker">
            <view class="date-input">
              <text :class="startDate ? 'text-value' : 'text-placeholder'">{{ startDate || '开始日期' }}</text>
            </view>
          </picker>
          <text class="date-separator">至</text>
          <picker mode="date" :value="endDate" @change="onEndDateChange" class="date-picker">
            <view class="date-input">
              <text :class="endDate ? 'text-value' : 'text-placeholder'">{{ endDate || '结束日期' }}</text>
            </view>
          </picker>
        </view>
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
              <AppIcon name="file-text" :size="48" color="#10b981" />
            </view>
          </view>
        </view>
        <text class="empty-title">暂无订单</text>
        <text class="empty-desc">当前筛选条件下没有订单记录</text>
      </view>

      <!-- Custom Order Cards -->
      <view v-else class="order-list">
        <view 
          v-for="order in filteredOrders" 
          :key="order.id" 
          class="order-card"
          @click="viewOrderDetail(order)"
        >
          <!-- Card Header: Title + Status -->
          <view class="card-header">
            <view class="header-main">
               <view :class="['project-tag', getPaymentTypeClass(order.paymentType)]">
                 <text :class="['project-text', getPaymentTypeTextClass(order.paymentType)]">{{ order.projectName }}</text>
               </view>
               <text class="date-text">{{ order.time.split(' ')[0] }}</text>
            </view>
            <text class="status-badge-text">{{ order.statusText }}</text>
          </view>

          <!-- Card Body: Info -->
          <view class="card-body">
            <view class="info-row">
              <view class="info-icon">
                <AppIcon name="map-pin" :size="14" color="#6b7280" />
              </view>
              <text class="info-value truncate">{{ order.location }}</text>
            </view>
            
            <view class="info-row mt-3">
              <text class="price-label">服务金额</text>
              <text :class="['price-value', getAmountClass(order.paymentType)]">
                $ {{ order.amount.toLocaleString() }}
              </text>
            </view>
          </view>

          <!-- Divider -->
          <view class="card-divider"></view>

          <!-- Card Footer: Actions -->
          <view class="card-footer">
             <view class="flex-spacer"></view>
             <view class="action-buttons">
                <view @click.stop="viewReviews(order)" class="btn btn-secondary">
                  <text class="btn-text btn-text-gray">查看评情</text>
                </view>
                <view @click.stop="viewOrderDetail(order)" class="btn btn-primary">
                  <text class="btn-text">查看详情</text>
                </view>
             </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';

interface CustomOrder {
  id: string;
  projectName: string;
  paymentType: 'simple' | 'deposit' | 'escrow';
  time: string;
  location: string;
  amount: number;
  status: string;
  statusText: string;
  hasReview: boolean;
}

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending_payment', label: '待付款' },
  { key: 'pending_visit', label: '待上门' },
  { key: 'in_service', label: '服务中' },
  { key: 'pending_acceptance', label: '待验收' },
  { key: 'completed', label: '已完成' },
  { key: 'after_sales', label: '售后' },
];

const activeTab = ref('all');
const loading = ref(true);
const startDate = ref('');
const endDate = ref('');
const listHeight = ref('calc(100vh - 300px)');

// Scroll indicator
const scrollPosition = ref(0);
const scrollThumbWidth = ref(30);

const onTabScroll = (e: any) => {
  const scrollLeft = e.detail.scrollLeft;
  const scrollWidth = e.detail.scrollWidth;
  const clientWidth = 375; 
  const maxScroll = scrollWidth - clientWidth;
  if (maxScroll > 0) {
    scrollPosition.value = (scrollLeft / maxScroll) * (100 - scrollThumbWidth.value);
  }
};

const orders = ref<CustomOrder[]>([
  { 
    id: '1', 
    projectName: '简单任务', 
    paymentType: 'simple',
    time: '2025/07/28 17:40', 
    location: '世博路1131号门厅', 
    amount: 25000,
    status: 'pending_payment',
    statusText: '用户待付款',
    hasReview: true
  },
  { 
    id: '2', 
    projectName: '定金支付', 
    paymentType: 'deposit',
    time: '2025/07/28 17:40', 
    location: '世博路1131号门厅', 
    amount: 25000,
    status: 'submitted',
    statusText: '用户已提交订单',
    hasReview: true
  },
   { 
    id: '4', 
    projectName: '担保支付', 
    paymentType: 'escrow',
    time: '2025/07/28 17:40', 
    location: '世博路1131号门厅', 
    amount: 25000,
    status: 'contracted',
    statusText: '用户已签章',
    hasReview: true
  },
]);

const filteredOrders = computed(() => {
  let result = orders.value;
  if (activeTab.value !== 'all') {
    if (activeTab.value === 'pending_payment') {
         result = result.filter(o => o.status === 'pending_payment' || o.statusText === '用户待付款');
    } else {
        result = result.filter(o => o.status === activeTab.value);
    }
  }
  return result;
});

const getTabCount = (key: string) => {
  if (key === 'all') return orders.value.length;
   if (key === 'pending_payment') return orders.value.filter(o => o.status === 'pending_payment' || o.statusText === '用户待付款').length;
  // Simplistic counts
  return orders.value.filter(o => o.status === key).length;
};

const onStartDateChange = (e: any) => {
  startDate.value = e.detail.value;
};

const onEndDateChange = (e: any) => {
  endDate.value = e.detail.value;
};

const getPaymentTypeClass = (type: string) => {
  if (type === 'deposit') return 'tag-deposit';
  if (type === 'simple') return 'tag-simple';
  if (type === 'escrow') return 'tag-escrow';
  return 'tag-simple';
};

const getPaymentTypeTextClass = (type: string) => {
   if (type === 'deposit') return 'text-deposit';
   if (type === 'simple') return 'text-simple';
   if (type === 'escrow') return 'text-escrow';
   return 'text-simple';
};

const getAmountClass = (type: string) => {
  return 'text-emerald-400';
};

const fetchOrders = async () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const viewReviews = (order: CustomOrder) => {
  uni.showToast({ title: '功能开发中', icon: 'none' });
};

const viewOrderDetail = (order: CustomOrder) => {
  uni.showToast({ title: '功能开发中', icon: 'none' });
};

const goBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  background: #111827;
  padding-top: env(safe-area-inset-top);
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
}

/* Standard Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  flex-shrink: 0;
  background: #1f2937;
  border-bottom: 1px solid #374151;
}

.back-btn, .placeholder-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.placeholder-btn {
  background: transparent;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
}




/* Tabs Wrapper for Visual Effect */
.tabs-wrapper {
  position: relative;
  margin: 16px 0;
}

.tabs-section {
  background: transparent;
  padding: 0;
  border: none;
  box-shadow: none;
  border-radius: 0;
}

/* Right Gradient Mask */
.scroll-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to right, rgba(17, 24, 39, 0), #111827);
  pointer-events: none;
  z-index: 10;
}

.tabs-scroll {
  white-space: nowrap;
  width: 100%;
}

.tabs-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 0 50px 0 20px; /* Increased padding */
  box-sizing: border-box;
  align-items: center;
}

/* Minimalist Chip Styles */
.tab-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center; /* Center content */
  gap: 6px;
  padding: 8px 0; /* Remove horizontal padding since we use width */
  width: 88px; /* Fixed width */
  border-radius: 100px; /* Reverted to 100px */
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
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}

.tab-label-active {
  color: #10b981;
  font-weight: 600;
}

.tab-badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-active {
  background: #10b981;
}

.badge-text {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 600;
}

.badge-active .badge-text {
  color: #ffffff;
}

/* Filter Section */
.filter-section {
  padding: 0 20px 16px 20px;
  box-sizing: border-box;
  width: 100%;
}

.filter-card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.filter-icon {
  margin-left: 4px;
  flex-shrink: 0;
}

.date-picker-group {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.date-picker {
  flex: 1;
}

.date-input {
  background: #111827;
  border: 1px solid #374151;
  border-radius: 8px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-value {
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
}

.text-placeholder {
  color: #d1d5db;
  font-size: 13px;
}

.date-separator {
  color: #9ca3af;
  font-size: 12px;
}

/* Order List */
.list-container {
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

/* Empty State */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.empty-circle {
  width: 100px;
  height: 100px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
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

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #9ca3af;
}

/* Order Cards */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px 20px 20px;
  box-sizing: border-box;
  width: 100%;
}

.order-card {
  background: #1f2937;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  border: 1px solid #374151;
  width: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid #374151;
}

.header-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex: 1;
  overflow: hidden;
}

.project-tag {
  padding: 4px 10px;
  border-radius: 6px;
}

/* Tag Variants */
.tag-simple {
  background: rgba(59, 130, 246, 0.15); /* Blue */
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.text-simple {
  color: #60a5fa;
}

.tag-deposit {
  background: rgba(168, 85, 247, 0.15); /* Purple */
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.text-deposit {
  color: #c084fc;
}

.tag-escrow {
  background: rgba(249, 115, 22, 0.15); /* Orange */
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.text-escrow {
  color: #fb923c;
}

.project-text {
  font-size: 12px;
  font-weight: 600;
}

.date-text {
  font-size: 12px;
  color: #d1d5db;
  font-weight: 500;
}

.status-badge-text {
  font-size: 13px;
  color: #10b981;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 8px;
}

.card-body {
  padding: 16px 20px;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.info-icon {
  width: 20px;
  display: flex;
  align-items: center;
}

.info-icon-text {
  font-size: 12px;
  color: #6b7280;
}

.info-value {
  font-size: 14px;
  color: #e5e7eb;
  flex: 1;
}

.price-label {
  font-size: 13px;
  color: #9ca3af;
  margin-right: 8px;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff !important;
}

.mt-3 {
  margin-top: 12px;
}

.card-divider {
  height: 1px;
  background: #374151;
  margin: 0 20px;
}

.card-footer {
  padding: 12px 20px;
  display: flex;
  flex-direction: row;
}

.flex-spacer {
  flex: 1;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #4b5563;
}

.btn-primary {
  background: #10b981;
  border: 1px solid #10b981;
}

.btn-text {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.btn-text-gray {
  color: #d1d5db;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
