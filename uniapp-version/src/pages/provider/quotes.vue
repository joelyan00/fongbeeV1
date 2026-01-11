<template>
  <view class="min-h-screen bg-gray-900 pt-custom pb-20">
    <!-- Header -->
    <view class="px-4 py-3 flex flex-row items-center justify-between bg-gray-800 sticky top-0 z-10">
      <view class="flex flex-row items-center gap-2">
        <view @click="goBack" class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <AppIcon name="chevron-left" :size="20" color="#9ca3af" />
        </view>
        <text class="text-white font-bold text-lg">定制服务报价记录</text>
      </view>
    </view>

    <!-- Tab Filters -->
    <scroll-view scroll-x class="whitespace-nowrap px-4 py-3 border-b border-gray-700">
      <view class="flex flex-row gap-4">
        <view 
          v-for="tab in statusTabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['px-3 py-1.5 text-sm border-b-2', 
            activeTab === tab.key ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400']"
        >
          <text :class="activeTab === tab.key ? 'text-emerald-400 font-bold' : 'text-gray-400'">
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

    <!-- Quote List -->
    <view class="px-4 mt-2">
      <view v-if="loading" class="flex flex-col items-center justify-center py-20">
        <view class="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></view>
        <text class="text-gray-500 mt-4 text-sm">加载中...</text>
      </view>

      <view v-else-if="filteredQuotes.length === 0" class="flex flex-col items-center justify-center py-20">
        <view class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <AppIcon name="file-text" :size="40" color="#4b5563" />
        </view>
        <text class="text-gray-500">暂无报价记录</text>
      </view>

      <view v-else class="space-y-4">
        <view 
          v-for="quote in filteredQuotes" 
          :key="quote.id" 
          class="bg-gray-800 rounded-xl border border-gray-700 p-4"
        >
          <!-- Project Name -->
          <view class="flex flex-row items-center gap-2 mb-3">
            <text class="text-gray-500 text-sm">项目名称</text>
            <text class="text-emerald-400 font-medium">({{ quote.projectName }})</text>
          </view>

          <!-- Info Grid -->
          <view class="space-y-2 mb-3">
            <view class="flex flex-row items-center gap-2">
              <text class="text-gray-500 text-xs w-16">发布时间：</text>
              <text class="text-gray-300 text-sm">{{ quote.time }}</text>
            </view>
            <view class="flex flex-row items-center gap-2">
              <text class="text-gray-500 text-xs w-16">所在位置：</text>
              <text class="text-gray-300 text-sm">{{ quote.location }}</text>
            </view>
            <view class="flex flex-row items-center justify-between">
              <view class="flex flex-row items-center gap-2">
                <text class="text-gray-500 text-xs w-16">报价金额：</text>
                <text class="text-emerald-400 font-bold">¥ {{ quote.amount.toLocaleString() }}</text>
              </view>
              <text class="text-emerald-400 text-sm">{{ quote.statusText }}</text>
            </view>
          </view>

          <!-- Result / Actions -->
          <view class="border-t border-gray-700 pt-3 flex flex-row justify-end">
            <view v-if="quote.result === 'failed'" class="flex-1">
              <text class="text-gray-500 text-xs">{{ quote.resultText }}</text>
            </view>
            <view v-else class="flex flex-row gap-2">
              <view @click="cancelQuote(quote)" class="px-3 py-1.5 bg-gray-700 rounded-lg">
                <text class="text-gray-300 text-sm">取消报价</text>
              </view>
              <view @click="viewQuoteDetail(quote)" class="px-3 py-1.5 bg-emerald-500 rounded-lg">
                <text class="text-white text-sm font-bold">查看详情</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Pagination -->
    <view v-if="filteredQuotes.length > 0" class="px-4 py-6 flex flex-row items-center justify-center gap-3">
      <text class="text-gray-500 text-sm">共{{ quotes.length }}条</text>
      <view class="flex flex-row items-center gap-1">
        <view class="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
          <text class="text-gray-400">&lt;</text>
        </view>
        <view class="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
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
import { quotesApi } from '@/services/api';

interface Quote {
  id: string;
  projectName: string;
  time: string;
  location: string;
  status: string;
  statusText: string;
  amount: number;
  result: 'active' | 'failed' | 'ignored';
  resultText: string;
}

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'quoted', label: '已报价' },
  { key: 'ignored', label: '被忽略' },
];

const activeTab = ref('all');
const loading = ref(true);
const startDate = ref('');
const endDate = ref('');

// Mock data for now
const quotes = ref<Quote[]>([
  { 
    id: '1', 
    projectName: '高端任务', 
    time: '2025/07/28 17:40', 
    location: '世贸路1131号门厅', 
    status: 'pending', 
    statusText: '待定',
    amount: 25000,
    result: 'failed',
    resultText: '用户已选择其他服务商，已失败'
  },
  { 
    id: '2', 
    projectName: '复杂任务', 
    time: '2025/07/28 17:40', 
    location: '世贸路1131号门厅', 
    status: 'pending', 
    statusText: '待定',
    amount: 25000,
    result: 'active',
    resultText: ''
  },
]);

const filteredQuotes = computed(() => {
  // Filter by tab
  let result = quotes.value;
  if (activeTab.value === 'quoted') {
    result = result.filter(q => q.result !== 'ignored');
  } else if (activeTab.value === 'ignored') {
    result = result.filter(q => q.result === 'ignored');
  }
  return result;
});

const getTabCount = (key: string) => {
  if (key === 'all') return quotes.value.length;
  if (key === 'quoted') return quotes.value.filter(q => q.result !== 'ignored').length;
  if (key === 'ignored') return quotes.value.filter(q => q.result === 'ignored').length;
  return 0;
};

const fetchQuotes = async () => {
  loading.value = true;
  try {
    // In the future, replace with actual API call
    // const res = await quotesApi.getMyQuotes();
    // quotes.value = res.quotes;
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (e) {
    console.error('Fetch quotes error:', e);
    uni.showToast({ title: '获取报价记录失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const cancelQuote = (quote: Quote) => {
  uni.showModal({
    title: '确认取消',
    content: `确定要取消对"${quote.projectName}"的报价吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '功能开发中', icon: 'none' });
      }
    }
  });
};

const viewQuoteDetail = (quote: Quote) => {
  uni.showToast({ title: '功能开发中', icon: 'none' });
};

const goBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  fetchQuotes();
});
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.bg-emerald-500 { background-color: #10b981; }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-emerald-400 { color: #34d399; }
.border-gray-700 { border-color: #374151; }
.border-emerald-500 { border-color: #10b981; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }
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
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-1\.5 { padding-top: 6px; padding-bottom: 6px; }
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
