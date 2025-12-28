<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <!-- Header -->
    <view class="bg-emerald-600 px-4 pt-12 pb-6">
      <view class="flex flex-row items-center gap-2 mb-4">
        <view class="w-8 h-8 flex items-center justify-center bg-white-20 rounded-lg" @click="handleBack">
            <AppIcon name="arrow-left" :size="20" color="#fff"/>
        </view>
        <text class="text-white text-lg font-bold">财务管理面板</text>
      </view>
      
      <!-- Total Assets Card -->
      <view class="bg-white rounded-2xl p-6 shadow-sm mt-4">
          <view class="flex flex-row items-center justify-between mb-2">
              <text class="text-gray-500 text-sm">Stripe 账户总余额 (资金池)</text>
              <AppIcon name="credit-card" :size="20" color="#059669"/>
          </view>
          <text class="text-3xl font-bold text-gray-900">${{ formatPrice(stats.stripe_balance) }}</text>
          <text class="text-xs text-emerald-600 mt-1">资金流安全托管中</text>
      </view>
    </view>

    <!-- Content -->
    <view class="px-4 -mt-4">
        <!-- Breakdown -->
        <view class="grid grid-cols-2 gap-3 mb-4">
             <!-- Liabilities -->
            <view class="bg-white rounded-xl p-4 shadow-sm">
                <text class="text-xs text-gray-500 block mb-1">待结算 (代管)</text>
                <text class="text-xl font-bold text-orange-500">${{ formatPrice(stats.escrow_balance) }}</text>
                <text class="text-xs text-gray-400 mt-1 block">服务商待提现 + 托管定金</text>
            </view>
            
            <!-- Revenue -->
             <view class="bg-white rounded-xl p-4 shadow-sm">
                <text class="text-xs text-gray-500 block mb-1">平台净收入</text>
                <text class="text-xl font-bold text-emerald-600">${{ formatPrice(stats.platform_revenue) }}</text>
                <text class="text-xs text-gray-400 mt-1 block">积分/会员销售总额</text>
            </view>
        </view>

        <!-- Bank Account Settings -->
        <view class="bg-white rounded-xl p-4 shadow-sm">
            <view class="flex flex-row items-center justify-between mb-4">
                 <text class="text-base font-bold text-gray-900">平台提现账户</text>
                 <text class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">已验证</text>
            </view>
            
             <view class="flex flex-row items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <view class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <text class="font-bold text-blue-600">RBC</text>
                </view>
                <view class="flex flex-col flex-1">
                    <text class="text-sm font-bold text-gray-800">Royal Bank of Canada</text>
                    <text class="text-xs text-gray-500">**** 8888</text>
                </view>
                <text class="text-emerald-600 text-sm font-medium" @click="handleEditBank">管理</text>
             </view>
             
             <view class="mt-4 pt-4 border-t border-gray-100">
                 <text class="text-xs text-gray-400 leading-relaxed">
                     说明：这里设置的是平台营收的提现账户。服务商的提现由 Stripe Connect 自动处理，不经过此账户。
                 </text>
             </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { adminApi } from '@/services/api';

const stats = ref({
    stripe_balance: 0,
    escrow_balance: 0,
    platform_revenue: 0
});

onMounted(async () => {
    try {
        const res = await adminApi.getFinanceSummary();
        stats.value = res;
    } catch (e) {
        console.error(e);
        // uni.showToast({ title: '加载财务数据失败', icon: 'none' }); 
        // Logic: if non-admin tries to access, they just get 0 or mock in dev
    }
});

const formatPrice = (p: number) => (p || 0).toFixed(2);

const handleBack = () => {
    uni.navigateBack();
};

const handleEditBank = () => {
    uni.showToast({ title: '跳转 Stripe 仪表盘...', icon: 'none' });
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-emerald-600 { background-color: #059669; }
.bg-white { background-color: #ffffff; }
.bg-white-20 { background-color: rgba(255,255,255,0.2); }
.bg-blue-100 { background-color: #dbeafe; }
.bg-gray-100 { background-color: #f3f4f6; }

.text-white { color: #ffffff; }
.text-gray-900 { color: #111827; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-emerald-600 { color: #059669; }
.text-orange-500 { color: #f97316; }
.text-blue-600 { color: #2563eb; }

.font-bold { font-weight: 700; }
.text-3xl { font-size: 30px; }
.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }

.p-4 { padding: 16px; }
.p-6 { padding: 24px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.pb-6 { padding-bottom: 24px; }
.pt-12 { padding-top: 48px; }
.mt-4 { margin-top: 16px; }
.mt-1 { margin-top: 4px; }
.-mt-4 { margin-top: -16px; }
.mb-4 { margin-bottom: 16px; }
.mb-2 { margin-bottom: 8px; }

.rounded-2xl { border-radius: 16px; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.border { border-width: 1px; }
.border-t { border-top-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }

.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
</style>
