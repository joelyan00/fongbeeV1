<template>
  <view class="min-h-screen bg-gray-900 pt-custom">
    <!-- Header -->
    <view class="flex flex-row items-center px-4 py-3">
      <view @click="goBack" class="w-10 h-10 flex items-center justify-center">
        <AppIcon name="arrow-left" :size="20" color="#ffffff" />
      </view>
      <text class="text-white font-bold text-lg ml-2">收件箱</text>
    </view>

    <!-- Filter Tabs -->
    <view class="px-4 py-3">
      <view class="flex flex-row gap-2">
        <view 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['px-4 py-2 rounded-full text-sm relative', activeTab === tab.key ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700']"
        >
          <text>{{ tab.label }}</text>
          <view v-if="tab.count > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <text class="text-[10px] text-white">{{ tab.count }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Message List -->
    <scroll-view scroll-y class="flex-1 px-4" style="height: calc(100vh - 160px);">
      <view v-if="loading" class="flex items-center justify-center py-20">
        <view class="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></view>
      </view>

      <view v-else-if="filteredMessages.length === 0" class="flex flex-col items-center justify-center py-20">
        <AppIcon name="message-square" :size="48" color="#4b5563" />
        <text class="text-gray-500 mt-4">暂无消息</text>
        <text class="text-gray-600 text-sm mt-2">当有新消息时，将在这里显示</text>
      </view>

      <view v-else class="flex flex-col gap-3 pb-6">
        <view 
          v-for="msg in filteredMessages" 
          :key="msg.id"
          :class="['bg-gray-800 rounded-xl p-4 border', msg.read ? 'border-gray-700' : 'border-emerald-600']"
          @click="openMessage(msg)"
        >
          <view class="flex flex-row items-start gap-3">
            <view :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm', msg.type === 'order' ? 'bg-emerald-600' : msg.type === 'system' ? 'bg-blue-500' : 'bg-pink-500']">
              {{ msg.type === 'order' ? '订' : msg.type === 'system' ? '系' : '消' }}
            </view>
            <view class="flex-1 min-w-0">
              <view class="flex flex-row items-center justify-between mb-1">
                <text class="text-white font-medium">{{ msg.title }}</text>
                <text class="text-xs text-gray-500">{{ msg.time }}</text>
              </view>
              <text class="text-sm text-gray-400 truncate block">{{ msg.preview }}</text>
            </view>
            <view v-if="!msg.read" class="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></view>
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
  { key: 'all', label: '全部', count: 0 },
  { key: 'unread', label: '未读', count: 0 },
  { key: 'order', label: '订单', count: 0 },
  { key: 'system', label: '系统', count: 0 },
];

// Mock messages - replace with API data
const messages = ref<any[]>([
  // { id: 1, type: 'order', title: '新订单通知', preview: '您有一个新的订单需要处理...', time: '10分钟前', read: false },
]);

const filteredMessages = computed(() => {
  if (activeTab.value === 'all') return messages.value;
  if (activeTab.value === 'unread') return messages.value.filter(m => !m.read);
  return messages.value.filter(m => m.type === activeTab.value);
});

const goBack = () => {
  uni.navigateBack();
};

const openMessage = (msg: any) => {
  msg.read = true;
  console.log('Open message:', msg);
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
