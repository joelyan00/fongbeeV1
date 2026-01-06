<template>
  <view class="min-h-screen bg-gray-900 pt-custom">
    <!-- Header -->
    <view class="flex flex-row items-center px-4 py-3 border-b border-gray-800">
      <view @click="goBack" class="w-10 h-10 flex items-center justify-center">
        <AppIcon name="arrow-left" :size="20" color="#ffffff" />
      </view>
      <text class="text-white font-bold text-lg ml-2">合同管理</text>
    </view>

    <!-- Filter Tabs -->
    <view class="px-4 py-3">
      <scroll-view scroll-x class="whitespace-nowrap">
        <view class="flex flex-row gap-2">
          <view 
            v-for="(tab, index) in tabs" 
            :key="index"
            @click="activeTab = index"
            :class="['px-4 py-2 rounded-full text-sm', activeTab === index ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400']"
          >
            <text>{{ tab }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Contract List -->
    <scroll-view scroll-y class="flex-1 px-4" style="height: calc(100vh - 120px);">
      <view v-if="loading" class="flex items-center justify-center py-20">
        <view class="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></view>
      </view>
      
      <view v-else-if="filteredContracts.length === 0" class="flex flex-col items-center justify-center py-20">
        <AppIcon name="file" :size="48" color="#4b5563" />
        <text class="text-gray-500 mt-4">暂无合同记录</text>
      </view>

      <view v-else class="flex flex-col gap-3 pb-6">
        <view v-for="contract in filteredContracts" :key="contract.id" class="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <view class="flex flex-row items-start justify-between mb-3">
            <view class="flex-1">
              <view class="flex flex-row items-center gap-2 mb-1">
                <AppIcon name="file" :size="18" color="#60a5fa" />
                <text class="text-white font-medium">{{ contract.title }}</text>
              </view>
              <text class="text-gray-400 text-xs block">合同编号：{{ contract.contractNo }}</text>
            </view>
            <view :class="['px-2 py-0.5 rounded text-[10px]', getStatusClass(contract.status)]">
              <text>{{ getStatusText(contract.status) }}</text>
            </view>
          </view>
          
          <view class="grid grid-cols-2 gap-2 mb-3">
            <view>
              <text class="text-xs text-gray-500 block">签订日期</text>
              <text class="text-sm text-gray-300">{{ contract.signDate }}</text>
            </view>
            <view>
              <text class="text-xs text-gray-500 block">到期日期</text>
              <text class="text-sm text-gray-300">{{ contract.expireDate }}</text>
            </view>
          </view>
          
          <view class="flex flex-row items-center justify-between pt-3 border-t border-gray-700">
            <text class="text-xs text-gray-500">{{ contract.type }}</text>
            <view class="flex flex-row gap-2">
              <view class="px-3 py-1 bg-gray-700 rounded-lg active:bg-gray-600">
                <text class="text-xs text-cyan-400">查看详情</text>
              </view>
              <view class="px-3 py-1 bg-gray-700 rounded-lg active:bg-gray-600">
                <text class="text-xs text-gray-300">下载</text>
              </view>
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
const activeTab = ref(0);
const tabs = ['全部', '服务合同', '框架协议', '保密协议'];

interface Contract {
  id: string;
  contractNo: string;
  title: string;
  type: string;
  status: 'active' | 'expired' | 'pending';
  signDate: string;
  expireDate: string;
}

const contracts = ref<Contract[]>([
  {
    id: '1',
    contractNo: 'CT20240101001',
    title: '家政服务合作协议',
    type: '服务合同',
    status: 'active',
    signDate: '2024-01-01',
    expireDate: '2025-01-01'
  },
  {
    id: '2',
    contractNo: 'CT20231201002',
    title: '平台服务框架协议',
    type: '框架协议',
    status: 'active',
    signDate: '2023-12-01',
    expireDate: '2024-12-01'
  },
  {
    id: '3',
    contractNo: 'CT20231115003',
    title: '保密及竞业禁止协议',
    type: '保密协议',
    status: 'active',
    signDate: '2023-11-15',
    expireDate: '2026-11-15'
  }
]);

const filteredContracts = computed(() => {
  if (activeTab.value === 0) return contracts.value;
  const types = ['', '服务合同', '框架协议', '保密协议'];
  return contracts.value.filter(c => c.type === types[activeTab.value]);
});

const getStatusClass = (status: string) => {
  switch(status) {
    case 'active': return 'bg-emerald-500/20 text-emerald-400';
    case 'pending': return 'bg-yellow-500/20 text-yellow-400';
    case 'expired': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const getStatusText = (status: string) => {
  switch(status) {
    case 'active': return '生效中';
    case 'pending': return '待签署';
    case 'expired': return '已过期';
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
