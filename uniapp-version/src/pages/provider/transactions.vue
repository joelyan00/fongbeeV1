<template>
  <view class="min-h-screen bg-gray-900 pt-custom">
    <!-- Header -->
    <view class="flex flex-row items-center px-4 py-3">
      <view @click="goBack" class="w-10 h-10 flex items-center justify-center">
        <AppIcon name="arrow-left" :size="20" color="#ffffff" />
      </view>
      <text class="text-white font-bold text-lg ml-2">交易记录</text>
    </view>

    <!-- Filter Tabs -->
    <view class="px-4 py-3">
      <view class="flex flex-row gap-2">
        <view 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['px-4 py-2 rounded-full text-sm', activeTab === tab.key ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700']"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>
    </view>

    <!-- Transaction List -->
    <scroll-view scroll-y class="flex-1 px-4" style="height: calc(100vh - 160px);">
      <view v-if="loading" class="flex items-center justify-center py-20">
        <view class="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></view>
      </view>

      <view v-else-if="filteredTransactions.length === 0" class="flex flex-col items-center justify-center py-20">
        <AppIcon name="credit-card" :size="48" color="#4b5563" />
        <text class="text-gray-500 mt-4">暂无交易记录</text>
        <text class="text-gray-600 text-sm mt-2">当有交易时，将在这里显示</text>
      </view>

      <view v-else class="flex flex-col gap-3 pb-6">
        <view 
          v-for="tx in filteredTransactions" 
          :key="tx.id"
          class="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <view class="flex flex-row items-center justify-between">
            <view class="flex flex-row items-center gap-3">
              <view :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm', tx.type === 'income' ? 'bg-emerald-600' : tx.type === 'expense' ? 'bg-red-500' : 'bg-yellow-500']">
                {{ tx.type === 'income' ? '收' : tx.type === 'expense' ? '支' : '提' }}
              </view>
              <view>
                <text class="text-white font-medium block">{{ tx.title }}</text>
                <text class="text-xs text-gray-500">{{ tx.time }}</text>
              </view>
            </view>
            <view class="text-right">
              <text :class="['text-lg font-bold', tx.type === 'income' ? 'text-emerald-400' : 'text-red-400']">{{ tx.amount }}</text>
              <text class="text-xs text-gray-500 block">{{ tx.statusText }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';

const loading = ref(false);
const activeTab = ref('all');

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'income', label: '收入' },
  { key: 'expense', label: '支出' },
  { key: 'withdraw', label: '提现' },
];

// Mock transactions - replace with API data
const transactions = ref<any[]>([
  // { id: 1, type: 'income', title: '订单收入', amount: '+¥450.00', time: '2025/07/28 17:40', status: 'completed', statusText: '已完成' },
]);

const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') return transactions.value;
  return transactions.value.filter(tx => tx.type === activeTab.value);
});

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.text-white { color: #ffffff; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.border-gray-700 { border-color: #374151; }
.rounded-xl { border-radius: 12px; }
.rounded-full { border-radius: 9999px; }
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
