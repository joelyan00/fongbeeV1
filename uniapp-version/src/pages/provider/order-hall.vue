<template>
  <view class="order-hall">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="28" class="text-white"/>
      </view>
      <text class="title">接单大厅</text>
      <view class="refresh-btn" @click="loadOrders">
        <AppIcon name="refresh-cw" :size="22" class="text-white"/>
      </view>
    </view>

    <!-- Stats Bar -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ availableOrdersCount }}</text>
        <text class="stat-label">可接订单</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ newOrdersCount }}</text>
        <text class="stat-label">今日新增</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="goToQuoteHistory">
        <text class="stat-value stat-clickable">{{ quotedOrdersCount }}</text>
        <text class="stat-label">报价记录</text>
      </view>
    </view>

    <!-- Filter Tabs -->
    <view class="filter-tabs">
      <view 
        class="tab" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        全部
      </view>
      <view 
        class="tab" 
        :class="{ active: activeTab === 'nearby' }"
        @click="activeTab = 'nearby'"
      >
        附近
      </view>
      <view 
        class="tab" 
        :class="{ active: activeTab === 'new' }"
        @click="activeTab = 'new'"
      >
        最新
      </view>
    </view>

    <!-- Loading State -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Empty State -->
    <view v-else-if="filteredOrders.length === 0" class="empty-container">
      <view class="empty-icon">
        <AppIcon name="inbox" :size="48" class="text-gray-400"/>
      </view>
      <text class="empty-text">暂无可接订单</text>
      <text class="empty-subtext">符合您服务范围的订单会显示在这里</text>
    </view>

    <!-- Order List -->
    <scroll-view v-else scroll-y class="order-list">
      <view 
        v-for="order in filteredOrders" 
        :key="order.id"
        class="order-card"
        @click="viewOrderDetail(order)"
      >
        <!-- Order Header -->
        <view class="order-header">
          <view class="service-type">
            <view class="service-icon">
              <AppIcon name="clipboard" :size="18" class="text-teal-500"/>
            </view>
            <text class="service-name">{{ order.serviceName }}</text>
          </view>
          <view v-if="isNewOrder(order)" class="new-badge">NEW</view>
        </view>

        <!-- Order Number -->
        <text class="order-number">订单号: {{ order.orderNo }}</text>

        <!-- Order Info -->
        <view class="order-info">
          <view v-if="order.airport" class="info-row">
            <AppIcon name="plane" :size="14" class="info-icon"/>
            <text class="info-text">{{ order.airport }}</text>
          </view>
          <view v-if="order.date" class="info-row">
            <AppIcon name="calendar" :size="14" class="info-icon"/>
            <text class="info-text">{{ order.date }} {{ order.time || '' }}</text>
          </view>
          <view v-if="order.city" class="info-row">
            <AppIcon name="map-pin" :size="14" class="info-icon"/>
            <text class="info-text">{{ order.city }}</text>
          </view>
        </view>

        <!-- Order Footer -->
        <view class="order-footer">
          <text class="time-ago">{{ formatTimeAgo(order.createdAt) }}</text>
          <!-- Show "Already Quoted" badge if quoted, otherwise show grab button -->
          <view v-if="order.hasQuoted" class="quoted-badge">
            <AppIcon name="check" :size="14" class="quoted-icon"/>
            <text class="quoted-text">已报价</text>
          </view>
          <view v-else class="action-btn" @click.stop="viewOrderDetail(order)">
            <text class="action-text">立即抢单</text>
            <AppIcon name="arrow-right" :size="16" class="action-icon"/>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { submissionsApi } from '@/services/api';

// State
const loading = ref(true);
const orders = ref<any[]>([]);
const activeTab = ref('all');

// Computed
const newOrdersCount = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return orders.value.filter(o => new Date(o.createdAt) >= today && !o.hasQuoted).length;
});

const availableOrdersCount = computed(() => {
  return orders.value.filter(o => !o.hasQuoted).length;
});

const quotedOrdersCount = computed(() => {
  return orders.value.filter(o => o.hasQuoted).length;
});

const filteredOrders = computed(() => {
  let result = [...orders.value];
  
  if (activeTab.value === 'new') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    result = result.filter(o => new Date(o.createdAt) >= today);
  }
  
  // Sort by newest first
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return result;
});

// Navigate to quote history page
const goToQuoteHistory = () => {
  uni.navigateTo({
    url: '/pages/provider/my-quotes'
  });
};

// Methods
const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // If no history (e.g. refresh), go back to home/index
    uni.reLaunch({
      url: '/pages/index/index'
    });
  }
};

const loadOrders = async () => {
  loading.value = true;
  try {
    // Add timeout for slow API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await submissionsApi.getAvailable();
    clearTimeout(timeoutId);
    
    const submissions = response.submissions || [];
    
    // Transform submissions to order format
    orders.value = submissions.map((s: any) => {
      const formData = s.form_data || {};
      
      // Extract fields from form_data
      let airport = '';
      let date = '';
      let time = '';
      let city = '';
      let orderNo = formData._order_no || s.id.slice(0, 8);
      
      for (const key of Object.keys(formData)) {
        const field = formData[key];
        if (field && typeof field === 'object') {
          if (field.label?.includes('机场')) {
            airport = field.displayValue || field.value || '';
          }
          if (field.type === 'date' && !date) {
            date = field.displayValue || field.value || '';
          }
          if (field.type === 'time') {
            time = field.displayValue || field.value || '';
          }
          if (field.type === 'address' && field.value?.city) {
            city = field.value.city;
          }
        }
      }
      
      return {
        id: s.id,
        serviceName: s.form_templates?.name || '未知服务',
        orderNo,
        airport,
        date,
        time,
        city,
        createdAt: s.created_at,
        formData: s.form_data,
        status: s.status,
        hasQuoted: s.has_quoted || false
      };
    });
  } catch (error: any) {
    console.error('Failed to load orders:', error);
    // Show user-friendly error message
    if (error.name === 'AbortError') {
      uni.showToast({ title: '请求超时，请刷新重试', icon: 'none', duration: 3000 });
    } else {
      uni.showToast({ title: error.message || '加载失败，请检查网络', icon: 'none', duration: 3000 });
    }
    // Keep empty array so UI shows empty state instead of error
    orders.value = [];
  } finally {
    loading.value = false;
  }
};

const isNewOrder = (order: any) => {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return new Date(order.createdAt) > oneHourAgo;
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}天前`;
};

const viewOrderDetail = (order: any) => {
  // Store order data in global state or pass via URL
  uni.setStorageSync('currentOrderDetail', JSON.stringify(order));
  uni.navigateTo({
    url: '/pages/provider/order-detail'
  });
};

const grabOrder = async (order: any) => {
  uni.showModal({
    title: '确认抢单',
    content: `确定要接这个订单吗？\n\n服务: ${order.serviceName}\n订单号: ${order.orderNo}`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' });
          await submissionsApi.accept(order.id);
          uni.hideLoading();
          uni.showToast({ title: '抢单成功！', icon: 'success' });
          // Reload orders
          loadOrders();
        } catch (error: any) {
          uni.hideLoading();
          uni.showToast({ title: error.message || '抢单失败', icon: 'none' });
        }
      }
    }
  });
};

// Lifecycle
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.order-hall {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding-top: env(safe-area-inset-top);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.back-btn, .refresh-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 0 16px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #10b981;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

.filter-tabs {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 16px;
}

.tab {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}

.tab.active {
  color: #1e293b;
  background: #10b981;
  font-weight: 600;
}

.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-text {
  color: #94a3b8;
  font-size: 14px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-subtext {
  color: #64748b;
  font-size: 14px;
}

.order-list {
  flex: 1;
  padding: 0 0 100px;
  width: 100%;
}

.order-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  margin: 0 16px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.service-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.new-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}

.order-number {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
  display: block;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  color: #64748b;
}

.info-text {
  font-size: 13px;
  color: #cbd5e1;
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.time-ago {
  font-size: 12px;
  color: #64748b;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #10b981;
}

.action-text {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.action-icon {
  color: #fff;
}

.text-white { color: #fff; }
.text-gray-400 { color: #9ca3af; }
.text-teal-500 { color: #10b981; }

/* Quoted Badge */
.quoted-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.quoted-icon {
  color: #64748b;
}

.quoted-text {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

/* Clickable stat */
.stat-clickable {
  color: #3b82f6 !important;
  text-decoration: underline;
}
</style>
