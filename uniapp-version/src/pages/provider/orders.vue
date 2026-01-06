<template>
  <view class="min-h-screen bg-gray-900 pt-custom pb-20">
    <!-- Header -->
    <view class="px-4 py-3 flex flex-row items-center justify-between bg-gray-800 sticky top-0 z-10">
      <view class="flex flex-row items-center gap-2">
        <view @click="goBack" class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <AppIcon name="chevron-left" :size="20" color="#9ca3af" />
        </view>
        <text class="text-white font-bold text-lg">标准服务订单管理</text>
      </view>
    </view>

    <!-- Tab Filters -->
    <scroll-view scroll-x class="whitespace-nowrap px-4 py-3 border-b border-gray-700">
      <view class="flex flex-row gap-3">
        <view 
          v-for="tab in statusTabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['px-3 py-1.5 rounded-full text-sm', 
            activeTab === tab.key ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300']"
        >
          <text :class="activeTab === tab.key ? 'text-white font-bold' : 'text-gray-300'">
            {{ tab.label }}({{ getTabCount(tab.key) }})
          </text>
        </view>
      </view>
    </scroll-view>

    <!-- Order List -->
    <view class="px-4 mt-4">
      <view v-if="loading" class="flex flex-col items-center justify-center py-20">
        <view class="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></view>
        <text class="text-gray-500 mt-4 text-sm">加载中...</text>
      </view>

      <view v-else-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center py-20">
        <view class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <AppIcon name="clipboard" :size="40" color="#4b5563" />
        </view>
        <text class="text-gray-500">暂无订单</text>
      </view>

      <view v-else class="space-y-4">
        <view 
          v-for="order in filteredOrders" 
          :key="order.id" 
          class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
        >
          <view class="flex flex-row">
            <!-- Service Image -->
            <view class="w-24 h-24 bg-cyan-500/20 flex-shrink-0 flex items-center justify-center">
              <image 
                v-if="order.service_image" 
                :src="order.service_image" 
                mode="aspectFill"
                class="w-full h-full"
              />
              <text v-else class="text-3xl">🛠️</text>
            </view>

            <!-- Order Info -->
            <view class="flex-1 p-3 flex flex-col justify-between">
              <view>
                <text class="text-white font-medium text-sm line-clamp-1">{{ order.service_title || order.service_type || '清洁服务' }}</text>
                <text class="text-gray-500 text-xs line-clamp-1 mt-1">{{ order.requirements || '暂无备注' }}</text>
              </view>
              <view class="flex flex-row items-center justify-between mt-2">
                <text class="text-red-500 font-bold">¥ {{ order.total_amount }}</text>
                <text :class="['text-xs', getStatusColor(order.status)]">{{ getStatusLabel(order.status) }}</text>
              </view>
            </view>
          </view>

          <!-- Action Buttons -->
          <view class="border-t border-gray-700 px-3 py-2 flex flex-row justify-end gap-2">
            <view 
              v-for="action in getOrderActions(order)" 
              :key="action.key"
              @click="handleAction(action.key, order)"
              :class="['px-3 py-1.5 rounded-lg text-xs', action.primary ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300']"
            >
              <text :class="action.primary ? 'text-white font-bold' : 'text-gray-300'">{{ action.label }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Verify Code Modal -->
    <view 
      v-if="showVerifyModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
      @click="showVerifyModal = false"
    >
      <view class="w-full max-w-sm bg-gray-800 rounded-2xl p-6 border border-gray-700" @click.stop>
        <view class="flex justify-between items-center mb-4">
          <text class="text-xl font-bold text-white">验证服务码</text>
          <view @click="showVerifyModal = false" class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <text class="text-gray-400">×</text>
          </view>
        </view>
        
        <text class="text-gray-400 text-sm block mb-4">请输入用户收到的 6 位短信验证码以解锁定金。</text>
        
        <input 
          type="number"
          v-model="verificationCode"
          placeholder="6位数字验证码"
          class="w-full text-center text-2xl tracking-widest font-mono bg-gray-700 border-2 border-gray-600 rounded-xl py-3 text-white mb-4"
          maxlength="6"
        />
        
        <view v-if="verifyError" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <text class="text-red-400 text-sm">{{ verifyError }}</text>
        </view>
        
        <view class="flex flex-row gap-3">
          <view @click="showVerifyModal = false" class="flex-1 py-3 bg-gray-700 rounded-xl flex items-center justify-center">
            <text class="text-gray-300">取消</text>
          </view>
          <view 
            @click="handleVerifyCode" 
            :class="['flex-1 py-3 rounded-xl flex items-center justify-center', verificationCode.length === 6 ? 'bg-cyan-500' : 'bg-gray-600']"
          >
            <view v-if="actionLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></view>
            <text v-else class="text-white font-bold">确认验证</text>
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

// Verify modal
const showVerifyModal = ref(false);
const selectedOrder = ref<Order | null>(null);
const verificationCode = ref('');
const verifyError = ref('');

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

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    'created': 'text-orange-400',
    'auth_hold': 'text-orange-400',
    'captured': 'text-cyan-400',
    'in_progress': 'text-indigo-400',
    'pending_verification': 'text-yellow-400',
    'rework': 'text-red-400',
    'verified': 'text-teal-400',
    'rated': 'text-teal-400',
    'completed': 'text-gray-400',
    'cancelled': 'text-gray-500',
  };
  return map[status] || 'text-gray-400';
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
  
  actions.push({ key: 'view', label: '查看详情', primary: false });
  
  return actions;
};

const handleAction = async (action: string, order: Order) => {
  switch (action) {
    case 'start':
      uni.showModal({
        title: '确认开始服务',
        content: '确定要开始服务吗？反悔期将结束，定金将不可退还。',
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
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.bg-gray-600 { background-color: #4b5563; }
.bg-cyan-500 { background-color: #06b6d4; }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-cyan-400 { color: #22d3ee; }
.text-orange-400 { color: #fb923c; }
.text-yellow-400 { color: #facc15; }
.text-red-400 { color: #f87171; }
.text-red-500 { color: #ef4444; }
.text-teal-400 { color: #34d399; }
.text-indigo-400 { color: #818cf8; }
.border-gray-700 { border-color: #374151; }
.border-gray-600 { border-color: #4b5563; }
.rounded-xl { border-radius: 12px; }
.rounded-2xl { border-radius: 16px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1; }
.flex-shrink-0 { flex-shrink: 0; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.px-6 { padding-left: 24px; padding-right: 24px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-1\.5 { padding-top: 6px; padding-bottom: 6px; }
.py-20 { padding-top: 80px; padding-bottom: 80px; }
.p-3 { padding: 12px; }
.p-6 { padding: 24px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mb-4 { margin-bottom: 16px; }
.pb-20 { padding-bottom: 80px; }
.w-8 { width: 32px; }
.h-8 { height: 32px; }
.w-10 { width: 40px; }
.h-10 { height: 40px; }
.w-20 { width: 80px; }
.h-20 { height: 80px; }
.w-24 { width: 96px; }
.h-24 { height: 96px; }
.w-5 { width: 20px; }
.h-5 { height: 20px; }
.w-full { width: 100%; }
.max-w-sm { max-width: 384px; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-mono { font-family: monospace; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.text-center { text-align: center; }
.tracking-widest { letter-spacing: 0.1em; }
.border { border-width: 1px; }
.border-2 { border-width: 2px; }
.border-t { border-top-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-4 { border-width: 4px; }
.overflow-hidden { overflow: hidden; }
.whitespace-nowrap { white-space: nowrap; }
.sticky { position: sticky; }
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.top-0 { top: 0; }
.z-10 { z-index: 10; }
.z-50 { z-index: 50; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 16px; }
.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
