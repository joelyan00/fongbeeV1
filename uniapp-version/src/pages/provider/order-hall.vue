<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);">
    <!-- Global Navbar (Handles status bar + nav) -->
    <GlobalNavbar 
      title="任务大厅" 
      background-color="#0f172a" 
      title-color="#ffffff" 
      icon-color="#ffffff"
      :show-back="true"
      :custom-back="goBack"
      :fixed="true"
    >
      <template #right>
        <view style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255, 255, 255, 0.1);" @click="loadOrders">
          <AppIcon name="rotate-ccw" :size="20" color="#ffffff"/>
        </view>
      </template>
    </GlobalNavbar>

    <!-- Stats Bar -->
    <view style="display: flex; align-items: center; justify-content: center; padding: 20px; margin: 0 16px 16px; background: rgba(255, 255, 255, 0.05); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
      <view style="display: flex; flex-direction: column; align-items: center; flex: 1;">
        <text style="font-size: 28px; font-weight: 700; color: #10b981;">{{ availableOrdersCount }}</text>
        <text style="font-size: 12px; color: #94a3b8; margin-top: 4px;">可接订单</text>
      </view>
      <view style="width: 1px; height: 40px; background: rgba(255, 255, 255, 0.1);"></view>
      <view style="display: flex; flex-direction: column; align-items: center; flex: 1;">
        <text style="font-size: 28px; font-weight: 700; color: #10b981;">{{ newOrdersCount }}</text>
        <text style="font-size: 12px; color: #94a3b8; margin-top: 4px;">今日新增</text>
      </view>
      <view style="width: 1px; height: 40px; background: rgba(255, 255, 255, 0.1);"></view>
      <view style="display: flex; flex-direction: column; align-items: center; flex: 1;" @click="goToQuoteHistory">
        <text style="font-size: 28px; font-weight: 700; color: #3b82f6; text-decoration: underline;">{{ quotedOrdersCount }}</text>
        <text style="font-size: 12px; color: #94a3b8; margin-top: 4px;">报价记录</text>
      </view>
    </view>

    <!-- Filter Tabs -->
    <view style="display: flex; gap: 12px; padding: 0 16px; margin-bottom: 16px;">
      <view 
        :style="{
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          color: activeTab === 'all' ? '#1e293b' : '#94a3b8',
          background: activeTab === 'all' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
          fontWeight: activeTab === 'all' ? '600' : 'normal'
        }"
        @click="activeTab = 'all'"
      >
        全部
      </view>
      <view 
        :style="{
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          color: activeTab === 'nearby' ? '#1e293b' : '#94a3b8',
          background: activeTab === 'nearby' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
          fontWeight: activeTab === 'nearby' ? '600' : 'normal'
        }"
        @click="activeTab = 'nearby'"
      >
        附近
      </view>
      <view 
        :style="{
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          color: activeTab === 'new' ? '#1e293b' : '#94a3b8',
          background: activeTab === 'new' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
          fontWeight: activeTab === 'new' ? '600' : 'normal'
        }"
        @click="activeTab = 'new'"
      >
        最新
      </view>
    </view>

    <!-- Loading State -->
    <view v-if="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px;">
      <text style="color: #94a3b8; font-size: 14px;">加载中...</text>
    </view>

    <!-- Empty State -->
    <view v-else-if="filteredOrders.length === 0" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px;">
      <view style="width: 80px; height: 80px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <AppIcon name="clipboard" :size="48" color="#6b7280"/>
      </view>
      <text style="color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 8px;">暂无可接订单</text>
      <text style="color: #64748b; font-size: 14px;">符合您服务范围的订单会显示在这里</text>
    </view>

    <!-- Order List -->
    <scroll-view v-else scroll-y style="flex: 1; padding: 0 0 100px; width: 100%;">
      <view 
        v-for="order in filteredOrders" 
        :key="order.id"
        style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 16px; margin: 0 16px 12px; border: 1px solid rgba(255, 255, 255, 0.08);"
        @click="viewOrderDetail(order)"
      >
        <!-- Order Header -->
        <view style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <view style="display: flex; align-items: center; gap: 8px;">
            <view style="width: 32px; height: 32px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center;">
              <AppIcon name="clipboard" :size="18" color="#10b981"/>
            </view>
            <text style="font-size: 16px; font-weight: 600; color: #fff;">{{ order.serviceName }}</text>
          </view>
          <view v-if="isNewOrder(order)" style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.15);">NEW</view>
        </view>

        <!-- Order Number -->
        <text style="font-size: 12px; color: #64748b; margin-bottom: 12px; display: block;">订单号: {{ order.orderNo }}</text>

        <!-- Order Info -->
        <view style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
          <view v-if="order.airport" style="display: flex; align-items: center; gap: 8px;">
            <AppIcon name="plane" :size="14" color="#64748b"/>
            <text style="font-size: 13px; color: #cbd5e1;">{{ order.airport }}</text>
          </view>
          <view v-if="order.date" style="display: flex; align-items: center; gap: 8px;">
            <AppIcon name="calendar" :size="14" color="#64748b"/>
            <text style="font-size: 13px; color: #cbd5e1;">{{ order.date }} {{ order.time || '' }}</text>
          </view>
          <view v-if="order.city" style="display: flex; align-items: center; gap: 8px;">
            <AppIcon name="map-pin" :size="14" color="#64748b"/>
            <text style="font-size: 13px; color: #cbd5e1;">{{ order.city }}</text>
          </view>
        </view>

        <!-- Order Footer -->
        <view style="display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
          <text style="font-size: 12px; color: #64748b;">{{ formatTimeAgo(order.createdAt) }}</text>
          <!-- Show "Already Quoted" badge if quoted, otherwise show grab button -->
          <view v-if="order.hasQuoted" style="display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 16px; background: rgba(100, 116, 139, 0.2); border: 1px solid rgba(100, 116, 139, 0.3);">
            <AppIcon name="check" :size="14" color="#64748b"/>
            <text style="font-size: 12px; font-weight: 500; color: #64748b;">已报价</text>
          </view>
          <view v-else style="display: flex; align-items: center; gap: 4px; padding: 8px 12px; border-radius: 10px; background: #10b981;" @click.stop="viewOrderDetail(order)">
            <text style="font-size: 13px; font-weight: 600; color: #fff;">立即抢单</text>
            <AppIcon name="arrow-right" :size="16" color="#ffffff"/>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';
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
    // If no history (e.g. refresh), go back to provider workspace
    uni.reLaunch({
      url: '/pages/index/index?view=provider'
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
  /* Padding top is handled by GlobalNavbar placeholder */
}

/* Header styles removed, replaced by GlobalNavbar */

.refresh-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
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
