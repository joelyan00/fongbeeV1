<template>
  <view class="min-h-screen bg-gray-900 pt-custom">
    <!-- Header -->
    <view class="flex flex-row items-center px-4 py-3 border-b border-gray-800">
      <view @click="goBack" class="w-10 h-10 flex items-center justify-center">
        <AppIcon name="arrow-left" :size="20" color="#ffffff" />
      </view>
      <text class="text-white font-bold text-lg ml-2">已开具发票</text>
    </view>

    <!-- Filter Tabs -->
    <view class="px-4 py-3">
      <scroll-view scroll-x class="whitespace-nowrap">
        <view class="flex flex-row gap-2">
          <view 
            v-for="(tab, index) in tabs" 
            :key="index"
            @click="activeTab = index"
            :class="['px-4 py-2 rounded-full text-sm', activeTab === index ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400']"
          >
            <text>{{ tab }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Invoice List -->
    <scroll-view scroll-y class="flex-1 px-4" style="height: calc(100vh - 160px);">
      <view v-if="loading" class="flex items-center justify-center py-20">
        <view class="w-8 h-8 border-4 border-teal-500/30 border-t-emerald-500 rounded-full animate-spin"></view>
      </view>
      
      <view v-else-if="filteredInvoices.length === 0" class="flex flex-col items-center justify-center py-20">
        <AppIcon name="file-text" :size="48" color="#4b5563" />
        <text class="text-gray-500 mt-4">暂无发票记录</text>
      </view>

      <view v-else class="flex flex-col gap-3 pb-6">
        <view v-for="invoice in filteredInvoices" :key="invoice.id" class="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <view class="flex flex-row items-start justify-between">
            <view class="flex-1">
              <view class="flex flex-row items-center gap-2 mb-2">
                <text class="text-white font-medium">{{ invoice.title }}</text>
                <view :class="['px-2 py-0.5 rounded text-[10px]', getStatusClass(invoice.status)]">
                  <text>{{ getStatusText(invoice.status) }}</text>
                </view>
              </view>
              <text class="text-gray-400 text-xs block">发票号：{{ invoice.invoiceNo }}</text>
              <text class="text-gray-400 text-xs block mt-1">开票时间：{{ invoice.date }}</text>
            </view>
            <text class="text-xl font-bold text-teal-400">¥{{ invoice.amount }}</text>
          </view>
          
          <view class="flex flex-row items-center justify-between mt-3 pt-3 border-t border-gray-700">
            <text class="text-xs text-gray-500">{{ invoice.type }}</text>
            <view class="flex flex-row gap-2">
              <view class="px-3 py-1 bg-gray-700 rounded-lg active:bg-gray-600">
                <text class="text-xs text-teal-400">查看</text>
              </view>
              <view class="px-3 py-1 bg-gray-700 rounded-lg active:bg-gray-600">
                <text class="text-xs text-gray-300">下载</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Request Invoice Button -->
    <view class="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-gray-900 border-t border-gray-800">
      <view class="bg-teal-600 rounded-xl py-3 flex items-center justify-center active:bg-teal-700">
        <text class="text-white font-bold">申请开票</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';

const loading = ref(false);
const activeTab = ref(0);
const tabs = ['全部', '增值税普通发票', '增值税专用发票'];

interface Invoice {
  id: string;
  invoiceNo: string;
  title: string;
  amount: number;
  type: string;
  status: 'issued' | 'pending' | 'failed';
  date: string;
}

const invoices = ref<Invoice[]>([
  {
    id: '1',
    invoiceNo: 'INV20240105001',
    title: '服务费发票',
    amount: 2500,
    type: '增值税普通发票',
    status: 'issued',
    date: '2024-01-05'
  },
  {
    id: '2',
    invoiceNo: 'INV20240103002',
    title: '平台服务费',
    amount: 850,
    type: '增值税普通发票',
    status: 'issued',
    date: '2024-01-03'
  },
  {
    id: '3',
    invoiceNo: 'INV20240102003',
    title: '技术服务费',
    amount: 1200,
    type: '增值税专用发票',
    status: 'pending',
    date: '2024-01-02'
  }
]);

const filteredInvoices = computed(() => {
  if (activeTab.value === 0) return invoices.value;
  const types = ['', '增值税普通发票', '增值税专用发票'];
  return invoices.value.filter(i => i.type === types[activeTab.value]);
});

const getStatusClass = (status: string) => {
  switch(status) {
    case 'issued': return 'bg-teal-500/20 text-teal-400';
    case 'pending': return 'bg-yellow-500/20 text-yellow-400';
    case 'failed': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const getStatusText = (status: string) => {
  switch(status) {
    case 'issued': return '已开具';
    case 'pending': return '开具中';
    case 'failed': return '开具失败';
    default: return status;
  }
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.border-gray-700 { border-color: #374151; }
.border-gray-800 { border-color: #1f2937; }
.rounded-xl { border-radius: 12px; }
.rounded-full { border-radius: 9999px; }
.rounded-lg { border-radius: 8px; }
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
