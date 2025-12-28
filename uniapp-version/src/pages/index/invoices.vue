<template>
  <view class="min-h-screen bg-gray-50 pb-safe">
      <!-- Navbar -->
      <view class="bg-white px-4 py-3 pt-safe flex flex-row items-center border-b border-gray-100 sticky top-0 z-50">
          <view @click="handleBack" class="p-2 -ml-2 active:bg-gray-100 rounded-full">
              <AppIcon name="arrow-left" :size="24" color="#333"/>
          </view>
          <text class="text-lg font-bold text-gray-900 ml-2">开具发票</text>
      </view>

      <!-- Main Content -->
      <view class="p-4" style="padding-top: 24px;">
          <!-- Request Button -->
          <view class="bg-emerald-600 text-white p-4 rounded-xl flex flex-row items-center justify-between shadow-lg mb-6 active:opacity-90 transition-opacity" @click="handleRequestInvoice">
              <view>
                  <text class="font-bold text-lg block">申请开发票</text>
                  <text class="text-white-70 text-xs mt-1 block">支持按订单或金额开票</text>
              </view>
              <view class="bg-white-20 p-2 rounded-full">
                  <AppIcon name="plus" :size="24" color="white" />
              </view>
          </view>
          
          <text class="text-sm font-bold text-gray-500 mb-3 block px-1">开票记录</text>
          
          <!-- Empty State -->
          <view v-if="invoices.length === 0" class="flex flex-col items-center justify-center p-10">
              <view class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                   <AppIcon name="file-text" :size="32" color="#9ca3af" />
              </view>
              <text class="text-gray-400 text-sm">暂无开票记录</text>
          </view>

          <!-- List (Mock) -->
          <view v-else class="flex flex-col gap-3">
              <view v-for="inv in invoices" :key="inv.id" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50">
                  <view class="flex flex-row justify-between items-start mb-2">
                      <text class="font-bold text-gray-900 text-base">{{ inv.title }}</text>
                      <text class="font-bold text-gray-900 text-base">CAD ${{ inv.amount }}</text>
                  </view>
                  <view class="flex flex-row justify-between items-center text-xs text-gray-500">
                      <text>{{ inv.date }}</text>
                      <view class="px-2 py-1 rounded bg-green-50 text-emerald-600 font-medium" v-if="inv.status === 'issued'">已开具</view>
                      <view class="px-2 py-1 rounded bg-orange-50 text-orange-600 font-medium" v-else>处理中</view>
                  </view>
              </view>
          </view>

      </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '@/components/Icons.vue';

const invoices = ref<any[]>([
    // Mock data for display
    { id: 1, title: '家庭清洁服务费', amount: '120.00', date: '2025-12-20 14:30', status: 'issued' },
    { id: 2, title: '管道维修服务费', amount: '85.50', date: '2025-11-15 09:20', status: 'issued' }
]);

const handleBack = () => uni.navigateBack();

const handleRequestInvoice = () => {
    uni.showToast({ title: '功能开发中', icon: 'none' });
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.pt-safe { padding-top: 44px; }
.pb-safe { padding-bottom: 40px; }
.bg-emerald-600 { background-color: #059669; }
.text-white { color: white; }
.text-white-70 { color: rgba(255,255,255,0.7); }
.bg-white-20 { background-color: rgba(255,255,255,0.2); }
.bg-green-50 { background-color: #ecfdf5; }
.bg-orange-50 { background-color: #fff7ed; }
.text-emerald-600 { color: #059669; }
.text-orange-600 { color: #ea580c; }
.active-bg-gray-50:active { background-color: #f9fafb; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }

.p-2 { padding: 8px; }
.p-4 { padding: 16px; }
.p-10 { padding: 40px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.px-1 { padding-left: 4px; padding-right: 4px; }

.gap-3 { gap: 12px; }
.mb-6 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
.mt-1 { margin-top: 4px; }

.rounded-xl { border-radius: 12px; }
.rounded-full { border-radius: 9999px; }
.rounded { border-radius: 4px; }

.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

.border-b { border-bottom-width: 1px; }
.border { border-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }

.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.text-lg { font-size: 18px; }
.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }

.text-gray-900 { color: #111827; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }

.block { display: block; }

.sticky { position: sticky; }
.top-0 { top: 0; }
.z-50 { z-index: 50; }
</style>
