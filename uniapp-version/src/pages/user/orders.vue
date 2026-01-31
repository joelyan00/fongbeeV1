<template>
  <view class="min-h-screen bg-gray-50 pb-10" style="background-color: #f9fafb; min-height: 100vh; padding-bottom: 40px;">
    <!-- Header aligned with Capsule Button -->
    <view class="bg-white border-b border-gray-100" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #f3f4f6;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}">
      <view style="display: flex !important; flex-direction: row !important; align-items: center !important;" :style="{height: navBarHeight + 'px'}">
        <view @click="handleBack" style="width: 40px; display: flex; align-items: center; justify-content: flex-start;" :style="{height: navBarHeight + 'px'}">
          <AppIcon name="chevron-left" :size="24" class="text-gray-600"/>
        </view>
        <text style="font-weight: bold; font-size: 18px; flex: 1; text-align: center; padding-right: 40px; color: #1f2937;">我的服务订单</text>
      </view>
    </view>
    
    <!-- Spacer for fixed header -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px'}"></view>

    <!-- Status Tabs (Capsule Style) -->
    <scroll-view scroll-x class="tab-scroll bg-white py-3 px-2 border-b border-gray-100" style="background: #fff; padding: 12px 8px; border-bottom: 1px solid #f3f4f6;">
      <view class="flex flex-row gap-2" style="display: flex !important; flex-direction: row !important; gap: 8px;">
        <view 
          v-for="tab in statusTabs" 
          :key="tab.key"
          class="tab-capsule flex-shrink-0"
          :class="activeTab === tab.key ? 'tab-capsule-active' : 'tab-capsule-inactive'"
          @click="activeTab = tab.key"
          style="display: flex; align-items: center; gap: 4px; padding: 8px 16px; border-radius: 50px; flex-shrink: 0;"
          :style="{backgroundColor: activeTab === tab.key ? '#10b981' : '#f3f4f6', border: activeTab === tab.key ? 'none' : '1px solid #e5e7eb'}"
        >
          <text 
            class="tab-text"
            :class="activeTab === tab.key ? 'text-white' : 'text-gray-700'"
            style="font-size: 14px; font-weight: 500; white-space: nowrap;"
            :style="{color: activeTab === tab.key ? '#fff' : '#374151'}"
          >
            {{ tab.label }}
          </text>
          <view v-if="getTabCount(tab.key) > 0" class="tab-count" :class="activeTab === tab.key ? 'tab-count-active' : 'tab-count-inactive'" style="min-width: 20px; height: 20px; border-radius: 50px; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; padding: 0 6px;" :style="{backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#e5e7eb', color: activeTab === tab.key ? '#fff' : '#6b7280'}">
            {{ getTabCount(tab.key) }}
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Order List with extra horizontal padding for border visibility -->
    <view style="padding: 16px 20px;">
      <view v-if="loading" class="flex justify-center p-8" style="display: flex; justify-content: center; padding: 32px;">
        <text class="text-gray-400" style="color: #9ca3af;">加载中...</text>
      </view>
      <view v-else-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center mt-20" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 80px;">
        <view class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4" style="width: 80px; height: 80px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <AppIcon name="clipboard" :size="40" class="text-gray-300"/>
        </view>
        <text class="text-gray-400 font-medium" style="color: #9ca3af; font-weight: 500;">暂无订单</text>
        <view class="mt-6 px-6 py-2 bg-emerald-50 rounded-full" @click="goToServices" style="margin-top: 24px; padding: 8px 24px; background: #ecfdf5; border-radius: 50px;">
          <text class="text-emerald-600 text-sm font-bold" style="color: #059669; font-size: 14px; font-weight: 700;">去预订服务</text>
        </view>
      </view>
      
      <!-- Order Cards -->
      <view v-else class="flex flex-col gap-4" style="display: flex; flex-direction: column; gap: 16px;">
        <view 
          v-for="order in filteredOrders" 
          :key="order.id" 
          class="bg-white p-4 rounded-2xl shadow-sm border border-gray-50"
          @click="viewOrderDetail(order)"
        >
          <!-- Order Header -->
          <view class="flex flex-row justify-between items-center mb-3">
            <view class="flex flex-row items-center gap-2">
              <view :class="['px-2 py-1 rounded-lg text-xs font-bold', getStatusClass(order.status)]">
                {{ getStatusLabel(order.status) }}
              </view>
            </view>
            <text class="text-gray-400 text-xs">{{ order.order_no }}</text>
          </view>
          
          <!-- Order Content -->
          <view class="flex flex-row gap-3">
            <view class="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <image v-if="order.service_image" :src="order.service_image" mode="aspectFill" class="w-full h-full" />
              <view v-else class="w-full h-full flex items-center justify-center">
                <text class="text-2xl">🛠️</text>
              </view>
            </view>
            <view class="flex-1">
              <text class="font-bold text-gray-900 text-base line-clamp-1">{{ order.service_title || '标准服务' }}</text>
              <text class="text-gray-400 text-sm mt-1">{{ formatDate(order.created_at) }}</text>
            </view>
            <view class="flex flex-col items-end justify-center">
              <text class="text-red-500 font-bold text-lg">${{ order.total_amount }}</text>
              <text class="text-gray-400 text-xs">定金 ${{ order.deposit_amount }}</text>
            </view>
          </view>

          <!-- Order Footer with Actions -->
          <view class="mt-3 pt-3 border-t border-gray-50 flex flex-row justify-between items-center">
            <text class="text-gray-400 text-xs">{{ getRegretInfo(order) }}</text>
            <view class="flex flex-row gap-2">
              <view 
                v-if="order.status === 'created'"
                class="px-4 py-1 bg-emerald-500 rounded-lg"
                @click.stop="handlePayment(order)"
              >
                <text class="text-white text-sm font-bold">立即付款</text>
              </view>
              <view 
                v-if="['auth_hold', 'captured'].includes(order.status)"
                class="px-4 py-1 bg-gray-100 rounded-lg"
                @click.stop="handleCancel(order)"
              >
                <text class="text-gray-600 text-sm">取消订单</text>
              </view>
              <view 
                v-if="canObjectStart(order)"
                class="px-4 py-1 bg-red-50 rounded-lg border border-red-100"
                @click.stop="handleRefuseStart(order)"
              >
                <text class="text-red-600 text-sm font-bold">拒绝开工</text>
              </view>
              <view 
                v-if="order.status === 'pending_verification'"
                class="px-4 py-1 bg-emerald-500 rounded-lg"
                @click.stop="handleAccept(order)"
              >
                <text class="text-white text-sm font-bold">确认验收</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Action Modal -->
    <ActionModal
      v-model:visible="modalVisible"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :icon="modalConfig.icon"
      :icon-color="modalConfig.iconColor"
      :icon-bg-color="modalConfig.iconBgColor"
      :confirm-text="modalConfig.confirmText"
      :cancel-text="modalConfig.cancelText"
      :confirm-bg="modalConfig.confirmBg"
      :show-input="modalConfig.showInput"
      :placeholder="modalConfig.placeholder"
      @confirm="handleModalConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { ordersV2Api } from '../../services/api';
import AppIcon from '../../components/Icons.vue';
import ActionModal from '../../components/ActionModal.vue';
import { onLoad } from '@dcloudio/uni-app';

interface Order {
  id: string;
  order_no: string;
  status: string;
  service_type: string;
  total_amount: number;
  deposit_amount: number;
  created_at: string;
  cancel_deadline?: string;
  service_title?: string;
  service_image?: string;
  verification_deadline?: string;
  deposit_transferred_at?: string | null;
}

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

const statusTabs = [
  { key: 'all', label: '全部', statuses: [] },
  { key: 'pending_payment', label: '待付款', statuses: ['created'] },
  { key: 'pending_service', label: '待上门', statuses: ['auth_hold', 'captured'] },
  { key: 'in_progress', label: '服务中', statuses: ['in_progress'] },
  { key: 'pending_verify', label: '待验收', statuses: ['pending_verification'] },
  { key: 'completed', label: '已完成', statuses: ['verified', 'rated', 'completed'] },
];

const activeTab = ref('all');
const orders = ref<Order[]>([]);
const loading = ref(true);

// Action Modal State
const modalVisible = ref(false);
const activeOrder = ref<Order | null>(null);
const modalType = ref<'cancel' | 'accept' | 'refuse'>('cancel');
const modalConfig = reactive({
  title: '',
  message: '',
  icon: '',
  iconColor: '',
  iconBgColor: '',
  confirmText: '',
  cancelText: '不用了',
  confirmBg: '',
  showInput: false,
  placeholder: ''
});

// Read tab from URL parameters
onLoad((options) => {
  if (options?.tab && statusTabs.some(t => t.key === options.tab)) {
    activeTab.value = options.tab;
  }
});

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
    'auth_hold': '待上门',
    'captured': '待上门',
    'in_progress': '服务中',
    'pending_verification': '待验收',
    'verified': '已完成',
    'rated': '已评价',
    'completed': '已完成',
    'cancelled': '已取消',
  };
  return map[status] || status;
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    'created': 'bg-orange-100 text-orange-600',
    'auth_hold': 'bg-cyan-100 text-cyan-600',
    'captured': 'bg-cyan-100 text-cyan-600',
    'in_progress': 'bg-indigo-100 text-indigo-600',
    'pending_verification': 'bg-yellow-100 text-yellow-700',
    'verified': 'bg-green-100 text-green-600',
    'rated': 'bg-green-100 text-green-600',
    'completed': 'bg-gray-100 text-gray-600',
    'cancelled': 'bg-gray-100 text-gray-400',
  };
  return map[status] || 'bg-gray-100 text-gray-500';
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getRegretInfo = (order: Order) => {
  if (order.status === 'auth_hold' && order.cancel_deadline) {
    const deadline = new Date(order.cancel_deadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff > 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `反悔期剩余 ${hours}小时${mins}分`;
    }
  }
  return '';
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await ordersV2Api.getMyOrders({ role: 'user' });
    if (res.success && res.orders) {
      orders.value = res.orders;
    }
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  uni.navigateBack();
};

const goToServices = () => {
  uni.switchTab({ url: '/pages/index/standard-services' });
};

const viewOrderDetail = (order: Order) => {
  uni.navigateTo({ url: `/pages/index/custom-service-detail?id=${order.id}` });
};

const handlePayment = (order: Order) => {
  uni.showToast({ title: '跳转支付...', icon: 'none' });
};

const handleCancel = (order: Order) => {
  activeOrder.value = order;
  modalType.value = 'cancel';
  modalConfig.title = '取消订单';
  modalConfig.message = '确定要取消此订单吗？定金将原路退回。';
  modalConfig.icon = 'alert-triangle';
  modalConfig.iconColor = '#EF4444';
  modalConfig.iconBgColor = '#FEF2F2';
  modalConfig.confirmText = '确定取消';
  modalConfig.confirmBg = '#EF4444';
  modalConfig.showInput = false;
  modalVisible.value = true;
};

const handleAccept = (order: Order) => {
  activeOrder.value = order;
  modalType.value = 'accept';
  modalConfig.title = '确认验收';
  modalConfig.message = '确认服务已完成？确认后将完成订单并将资金结算给服务商。';
  modalConfig.icon = 'check-circle';
  modalConfig.iconColor = '#3D8E63';
  modalConfig.iconBgColor = '#F0FDF4';
  modalConfig.confirmText = '确认完成';
  modalConfig.confirmBg = 'linear-gradient(135deg, #3D8E63 0%, #2D6A4F 100%)';
  modalConfig.showInput = false;
  modalVisible.value = true;
};

const handleRefuseStart = (order: Order) => {
  activeOrder.value = order;
  modalType.value = 'refuse';
  modalConfig.title = '拒绝开工';
  modalConfig.message = '对服务商当前的开工状态有异议吗？拒绝后订单将退回待上门状态。';
  modalConfig.icon = 'shield-alert';
  modalConfig.iconColor = '#F59E0B';
  modalConfig.iconBgColor = '#FFFBEB';
  modalConfig.confirmText = '提交反馈';
  modalConfig.confirmBg = '#F59E0B';
  modalConfig.showInput = true;
  modalConfig.placeholder = '请输入反馈原因 (如：师傅人不在现场)';
  modalVisible.value = true;
};

const handleModalConfirm = async (inputValue: string | null) => {
  if (!activeOrder.value) return;
  
  try {
    uni.showLoading({ title: '处理中...' });
    if (modalType.value === 'cancel') {
      await ordersV2Api.cancel(activeOrder.value.id, { reason: '用户取消' });
      uni.showToast({ title: '订单已取消', icon: 'success' });
    } else if (modalType.value === 'accept') {
      await ordersV2Api.accept(activeOrder.value.id);
      uni.showToast({ title: '验收成功', icon: 'success' });
    } else if (modalType.value === 'refuse') {
      await ordersV2Api.refuseStart(activeOrder.value.id, inputValue || '用户对开工提出异议');
      uni.showToast({ title: '已提交反馈', icon: 'success' });
    }
    fetchOrders();
  } catch (e: any) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

const canObjectStart = (order: Order) => {
  if (order.status !== 'in_progress') return false;
  if (order.deposit_transferred_at) return false;
  if (!order.verification_deadline) return false;
  
  return new Date() < new Date(order.verification_deadline);
};

const handleRefuseStartLegacy = async (order: Order) => {
  // Keeping this as reference, logic moved to handleModalConfirm
};

onMounted(() => {
  // #ifdef MP-WEIXIN
  const menuBtn = uni.getMenuButtonBoundingClientRect();
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 44;
  navBarHeight.value = (menuBtn.top - (sysInfo.statusBarHeight || 0)) * 2 + menuBtn.height;
  capsuleWidth.value = sysInfo.windowWidth - menuBtn.left + 10;
  // #endif
  // #ifndef MP-WEIXIN
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 44;
  navBarHeight.value = 44;
  capsuleWidth.value = 0;
  // #endif
  
  fetchOrders();
});
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-10 { padding-bottom: 40px; }
.p-4 { padding: 16px; }
.p-8 { padding: 32px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.px-6 { padding-left: 24px; padding-right: 24px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.pt-3 { padding-top: 12px; }
.mr-4 { margin-right: 16px; }
.mt-1 { margin-top: 4px; }
.mt-3 { margin-top: 12px; }
.mt-6 { margin-top: 24px; }
.mt-20 { margin-top: 80px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.pr-12 { padding-right: 48px; }

.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-emerald-50 { background-color: #ecfdf5; }
.bg-emerald-500 { background-color: #10b981; }
.bg-orange-100 { background-color: #ffedd5; }
.bg-cyan-100 { background-color: #cffafe; }
.bg-indigo-100 { background-color: #e0e7ff; }
.bg-yellow-100 { background-color: #fef3c7; }
.bg-green-100 { background-color: #dcfce7; }

.text-gray-900 { color: #111827; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-gray-300 { color: #d1d5db; }
.text-white { color: #ffffff; }
.text-emerald-600 { color: #059669; }
.text-orange-600 { color: #ea580c; }
.text-cyan-600 { color: #0891b2; }
.text-indigo-600 { color: #4f46e5; }
.text-yellow-700 { color: #a16207; }
.text-green-600 { color: #16a34a; }
.text-red-500 { color: #ef4444; }

.text-lg { font-size: 18px; }
.text-base { font-size: 15px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.text-center { text-align: center; }

.rounded-full { border-radius: 9999px; }
.rounded-2xl { border-radius: 16px; }
.rounded-lg { border-radius: 8px; }

.border-b { border-bottom-width: 1px; }
.border-t { border-top-width: 1px; }
.border { border-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-50 { border-color: #f9fafb; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-1 { flex: 1; }
.flex-shrink-0 { flex-shrink: 0; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.w-8 { width: 32px; }
.w-20 { width: 80px; }
.w-full { width: 100%; }
.h-8 { height: 32px; }
.h-16 { height: 64px; }
.h-20 { height: 80px; }
.h-full { height: 100%; }

.tab-scroll { white-space: nowrap; }

/* Capsule Tab Styles */
.tab-capsule {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 50px;
  transition: all 0.2s;
}
.tab-capsule-active {
  background-color: #10b981;
}
.tab-capsule-inactive {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
}
.tab-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}
.tab-count {
  min-width: 20px;
  height: 20px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}
.tab-count-active {
  background-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}
.tab-count-inactive {
  background-color: #e5e7eb;
  color: #6b7280;
}
.flex-shrink-0 { flex-shrink: 0; }
.whitespace-nowrap { white-space: nowrap; }
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 1; }
.overflow-hidden { overflow: hidden; }
.sticky { position: sticky; }
.top-0 { top: 0; }
.z-10 { z-index: 10; }
</style>
