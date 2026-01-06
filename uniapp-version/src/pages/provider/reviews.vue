<template>
  <view class="min-h-screen bg-gray-900 pt-custom">
    <!-- Header -->
    <view class="flex flex-row items-center px-4 py-3 border-b border-gray-800">
      <view @click="goBack" class="w-10 h-10 flex items-center justify-center">
        <AppIcon name="arrow-left" :size="20" color="#ffffff" />
      </view>
      <text class="text-white font-bold text-lg ml-2">收到的评论</text>
    </view>

    <!-- Stats Summary -->
    <view class="px-4 py-4">
      <view class="bg-gray-800 rounded-xl p-4 flex flex-row items-center justify-between border border-gray-700">
        <view class="flex flex-col items-center flex-1">
          <text class="text-2xl font-bold text-yellow-400">4.8</text>
          <text class="text-xs text-gray-400 mt-1">平均评分</text>
        </view>
        <view class="w-px h-10 bg-gray-700"></view>
        <view class="flex flex-col items-center flex-1">
          <text class="text-2xl font-bold text-white">{{ reviews.length }}</text>
          <text class="text-xs text-gray-400 mt-1">评论数量</text>
        </view>
        <view class="w-px h-10 bg-gray-700"></view>
        <view class="flex flex-col items-center flex-1">
          <text class="text-2xl font-bold text-emerald-400">98%</text>
          <text class="text-xs text-gray-400 mt-1">好评率</text>
        </view>
      </view>
    </view>

    <!-- Filter Tabs -->
    <view class="px-4">
      <scroll-view scroll-x class="whitespace-nowrap">
        <view class="flex flex-row gap-2">
          <view 
            v-for="(tab, index) in tabs" 
            :key="index"
            @click="activeTab = index"
            :class="['px-4 py-2 rounded-full text-sm', activeTab === index ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400']"
          >
            <text>{{ tab }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Reviews List -->
    <scroll-view scroll-y class="flex-1 px-4 mt-4" style="height: calc(100vh - 280px);">
      <view v-if="loading" class="flex items-center justify-center py-20">
        <view class="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></view>
      </view>
      
      <view v-else-if="filteredReviews.length === 0" class="flex flex-col items-center justify-center py-20">
        <AppIcon name="star" :size="48" color="#4b5563" />
        <text class="text-gray-500 mt-4">暂无评论</text>
      </view>

      <view v-else class="flex flex-col gap-4 pb-6">
        <view v-for="review in filteredReviews" :key="review.id" class="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <!-- User info -->
          <view class="flex flex-row items-center justify-between mb-3">
            <view class="flex flex-row items-center gap-3">
              <view class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <text class="text-gray-400">{{ review.userName.charAt(0) }}</text>
              </view>
              <view>
                <text class="text-white font-medium block">{{ review.userName }}</text>
                <text class="text-xs text-gray-500">{{ review.orderType }}</text>
              </view>
            </view>
            <text class="text-xs text-gray-500">{{ review.date }}</text>
          </view>
          
          <!-- Rating -->
          <view class="flex flex-row items-center gap-1 mb-2">
            <view v-for="star in 5" :key="star">
              <AppIcon 
                name="star" 
                :size="16" 
                :color="star <= review.rating ? '#fbbf24' : '#4b5563'" 
              />
            </view>
            <text class="text-sm text-yellow-400 ml-1">{{ review.rating.toFixed(1) }}</text>
          </view>
          
          <!-- Content -->
          <text class="text-gray-300 text-sm leading-relaxed">{{ review.content }}</text>
          
          <!-- Reply -->
          <view v-if="review.reply" class="mt-3 bg-gray-700/50 rounded-lg p-3">
            <text class="text-xs text-gray-400 block mb-1">您的回复：</text>
            <text class="text-sm text-gray-300">{{ review.reply }}</text>
          </view>
          
          <!-- Reply Button -->
          <view v-else class="mt-3 flex justify-end">
            <view class="px-3 py-1 bg-gray-700 rounded-lg active:bg-gray-600">
              <text class="text-xs text-emerald-400">回复</text>
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
const tabs = ['全部', '好评', '中评', '差评', '待回复'];

interface Review {
  id: string;
  userName: string;
  orderType: string;
  rating: number;
  content: string;
  date: string;
  reply?: string;
}

const reviews = ref<Review[]>([
  {
    id: '1',
    userName: '张三',
    orderType: '搬家服务',
    rating: 5,
    content: '服务非常专业，搬运过程中很小心，没有任何损坏。师傅态度也很好，准时到达。推荐！',
    date: '2024-01-05',
    reply: '感谢您的好评，我们会继续努力提供优质服务！'
  },
  {
    id: '2',
    userName: '李四',
    orderType: '清洁服务',
    rating: 4,
    content: '整体比较满意，清洁很到位，就是时间稍微长了一点。',
    date: '2024-01-03'
  },
  {
    id: '3',
    userName: '王五',
    orderType: '维修服务',
    rating: 5,
    content: '维修师傅很专业，问题一下子就找到了，修好后还给我讲解了日常维护注意事项。',
    date: '2024-01-02',
    reply: '谢谢您的认可！'
  }
]);

const filteredReviews = computed(() => {
  switch(activeTab.value) {
    case 1: return reviews.value.filter(r => r.rating >= 4);
    case 2: return reviews.value.filter(r => r.rating === 3);
    case 3: return reviews.value.filter(r => r.rating < 3);
    case 4: return reviews.value.filter(r => !r.reply);
    default: return reviews.value;
  }
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
