<template>
  <view class="min-h-screen bg-gray-900 pt-custom pb-20">
    <!-- Header -->
    <view class="px-4 py-3 flex flex-row items-center justify-between bg-gray-800 sticky top-0 z-10">
      <view class="flex flex-row items-center gap-2">
        <view @click="goBack" class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <AppIcon name="chevron-left" :size="20" color="#9ca3af" />
        </view>
        <text class="text-white font-bold text-lg">定制服务订单管理</text>
      </view>
    </view>

    <!-- Tab Filters -->
    <scroll-view scroll-x class="whitespace-nowrap px-4 py-3 border-b border-gray-700">
      <view class="flex flex-row gap-3">
        <view 
          v-for="tab in statusTabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['px-3 py-1.5 text-sm border-b-2', 
            activeTab === tab.key ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400']"
        >
          <text :class="activeTab === tab.key ? 'text-cyan-400 font-bold' : 'text-gray-400'">
            {{ tab.label }}({{ getTabCount(tab.key) }})
          </text>
        </view>
      </view>
    </scroll-view>

    <!-- Date Filter -->
    <view class="px-4 py-3 flex flex-row items-center gap-3">
      <AppIcon name="calendar" :size="16" color="#9ca3af" />
      <view class="flex-1 flex flex-row items-center gap-2">
        <input 
          type="date" 
          v-model="startDate"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          placeholder="开始日期"
        />
        <text class="text-gray-500">至</text>
        <input 
          type="date" 
          v-model="endDate"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          placeholder="结束日期"
        />
      </view>
    </view>

    <!-- Order List -->
    <view class="px-4 mt-2">
      <view v-if="loading" class="flex flex-col items-center justify-center py-20">
        <view class="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></view>
        <text class="text-gray-500 mt-4 text-sm">加载中...</text>
      </view>

      <view v-else-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center py-20">
        <view class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <AppIcon name="file-text" :size="40" color="#4b5563" />
        </view>
        <text class="text-gray-500">暂无订单记录</text>
      </view>

      <view v-else class="space-y-4">
        <view 
          v-for="order in filteredOrders" 
          :key="order.id" 
          class="bg-gray-800 rounded-xl border border-gray-700 p-4"
        >
          <!-- Project Name with Tag -->
          <view class="flex flex-row items-center gap-2 mb-3">
            <text class="text-gray-500 text-sm">项目名称</text>
            <view :class="['px-2 py-0.5 rounded', getPaymentTypeClass(order.paymentType)]">
              <text :class="getPaymentTypeTextClass(order.paymentType)" class="text-xs font-medium">
                {{ order.projectName }}
              </text>
            </view>
          </view>

          <!-- Info Grid -->
          <view class="space-y-2 mb-3">
            <view class="flex flex-row items-center gap-2">
              <text class="text-gray-500 text-xs w-16">发布时间：</text>
              <text class="text-gray-300 text-sm">{{ order.time }}</text>
            </view>
            <view class="flex flex-row items-center gap-2">
              <text class="text-gray-500 text-xs w-16">所在位置：</text>
              <text class="text-gray-300 text-sm">{{ order.location }}</text>
            </view>
            <view class="flex flex-row items-center justify-between">
              <view class="flex flex-row items-center gap-2">
                <text class="text-gray-500 text-xs w-16">服务金额：</text>
                <text :class="getAmountClass(order.paymentType)" class="font-bold">
                  ¥ {{ order.amount.toLocaleString() }}
                </text>
              </view>
              <text class="text-cyan-400 text-sm">{{ order.statusText }}</text>
            </view>
          </view>

          <!-- Actions -->
          <view class="border-t border-gray-700 pt-3 flex flex-row justify-end gap-2">
            <view @click="viewReviews(order)" class="px-3 py-1.5 bg-gray-700 rounded-lg">
              <text class="text-gray-300 text-sm">查看评情</text>
            </view>
            <view @click="viewOrderDetail(order)" class="px-3 py-1.5 bg-cyan-500 rounded-lg">
              <text class="text-white text-sm font-bold">查看详情</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Pagination -->
    <view v-if="filteredOrders.length > 0" class="px-4 py-6 flex flex-row items-center justify-center gap-3">
      <text class="text-gray-500 text-sm">共{{ orders.length }}条</text>
      <view class="flex flex-row items-center gap-1">
        <view class="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
          <text class="text-gray-400">&lt;</text>
        </view>
        <view class="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center">
          <text class="text-white font-bold">1</text>
        </view>
        <view class="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
          <text class="text-gray-400">&gt;</text>
        </view>
      </view>
    </view>
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
  { key: 'pending_payment', label: '待客户待付款' },
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

// Mock data matching design
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
    id: '3', 
    projectName: '定金支付', 
    paymentType: 'deposit',
    time: '2025/07/28 17:40', 
    location: '世博路1131号门厅', 
    amount: 25000,
    status: 'pending_contract',
    statusText: '用户待签章',
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
  { 
    id: '5', 
    projectName: '担保支付', 
    paymentType: 'escrow',
    time: '2025/07/28 17:40', 
    location: '世博路1131号门厅', 
    amount: 25000,
    status: 'submitted',
    statusText: '用户已提交订单',
    hasReview: true
  },
  { 
    id: '6', 
    projectName: '担保支付', 
    paymentType: 'escrow',
    time: '2025/07/28 17:40', 
    location: '世博路1131号门厅', 
    amount: 25000,
    status: 'pending_contract',
    statusText: '用户待签章',
    hasReview: true
  },
]);

const filteredOrders = computed(() => {
  let result = orders.value;
  if (activeTab.value !== 'all') {
    result = result.filter(o => o.status === activeTab.value || 
      (activeTab.value === 'pending_payment' && o.statusText === '用户待付款') ||
      (activeTab.value === 'submitted' && o.statusText === '用户已提交订单')
    );
  }
  return result;
});

const getTabCount = (key: string) => {
  if (key === 'all') return orders.value.length;
  if (key === 'pending_payment') return orders.value.filter(o => o.statusText === '用户待付款').length;
  if (key === 'pending_visit') return 1;
  if (key === 'in_service') return 1;
  if (key === 'pending_acceptance') return 1;
  if (key === 'completed') return 1;
  if (key === 'after_sales') return 1;
  return 0;
};

const getPaymentTypeClass = (type: string) => {
  if (type === 'deposit') return 'bg-cyan-900/50';
  return 'bg-orange-900/50';
};

const getPaymentTypeTextClass = (type: string) => {
  if (type === 'deposit') return 'text-cyan-400';
  return 'text-orange-400';
};

const getAmountClass = (type: string) => {
  if (type === 'deposit') return 'text-cyan-400';
  return 'text-orange-400';
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    // In the future, replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (e) {
    console.error('Fetch orders error:', e);
    uni.showToast({ title: '获取订单记录失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
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
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.bg-cyan-500 { background-color: #06b6d4; }
.bg-cyan-900\/50 { background-color: rgba(22, 78, 99, 0.5); }
.bg-orange-900\/50 { background-color: rgba(124, 45, 18, 0.5); }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-cyan-400 { color: #22d3ee; }
.text-orange-400 { color: #fb923c; }
.border-gray-700 { border-color: #374151; }
.border-cyan-500 { border-color: #06b6d4; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }
.rounded { border-radius: 4px; }
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-1\.5 { padding-top: 6px; padding-bottom: 6px; }
.py-0\.5 { padding-top: 2px; padding-bottom: 2px; }
.py-6 { padding-top: 24px; padding-bottom: 24px; }
.py-20 { padding-top: 80px; padding-bottom: 80px; }
.p-4 { padding: 16px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.pb-20 { padding-bottom: 80px; }
.pt-3 { padding-top: 12px; }
.w-8 { width: 32px; }
.h-8 { height: 32px; }
.w-10 { width: 40px; }
.h-10 { height: 40px; }
.w-16 { width: 64px; }
.w-20 { width: 80px; }
.h-20 { height: 80px; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.border { border-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-b-2 { border-bottom-width: 2px; }
.border-t { border-top-width: 1px; }
.border-4 { border-width: 4px; }
.border-transparent { border-color: transparent; }
.whitespace-nowrap { white-space: nowrap; }
.sticky { position: sticky; }
.top-0 { top: 0; }
.z-10 { z-index: 10; }
.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 8px; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 16px; }
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
