<template>
  <view class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <view class="header-gradient pt-safe px-4 pb-4">
          <view class="flex flex-row items-center justify-between py-3">
              <view @click="handleBack" class="w-10 h-10 flex items-center justify-center bg-white-20 rounded-full active:opacity-70">
                  <AppIcon name="arrow-left" :size="24" color="#ffffff"/>
              </view>
              <text class="text-lg font-bold text-white">消息通知</text>
              <view class="w-10"></view>
          </view>
      </view>

      <!-- Empty State -->
      <view v-if="notifications.length === 0" class="flex flex-col items-center justify-center pt-20">
          <AppIcon name="bell-off" :size="48" color="#ccc"/>
          <text class="text-gray-400 text-sm mt-4">暂无新消息</text>
      </view>

      <!-- List -->
      <view v-else class="p-4 flex flex-col gap-3">
          <view 
            v-for="note in notifications" 
            :key="note.id" 
            class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors" 
            @click="handleClick(note)"
          >
              <view class="flex flex-row justify-between items-start mb-2">
                  <view class="flex flex-row items-center gap-2">
                       <view v-if="!note.is_read" class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></view>
                       <text class="font-bold text-gray-900 text-base" :class="{'text-gray-600': note.is_read}">{{ note.title || '系统通知' }}</text>
                  </view>
                  <text class="text-gray-400 text-xs flex-shrink-0 ml-2" style="font-size: 11px;">{{ formatDate(note.created_at) }}</text>
              </view>
              <text class="text-gray-600 text-sm leading-relaxed">{{ note.content }}</text>
              
              <view v-if="note.type === 'quote_received'" class="mt-3 flex flex-row justify-end">
                  <text class="text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded">点击查看详情 ></text>
              </view>
          </view>
      </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue'; // Check path
import { notificationsApi } from '@/services/api';

const notifications = ref<any[]>([]);

onMounted(() => {
    fetchData();
});

const fetchData = async () => {
    try {
        const res = await notificationsApi.getList();
        notifications.value = res.notifications || [];
    } catch (e) {
        console.error(e);
        uni.showToast({ title: '加载失败', icon: 'none' });
    }
};

const handleBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        // Fallback to Profile tab (Mine)
        uni.reLaunch({ url: '/pages/index/index?tab=profile' });
    }
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const handleClick = (note: any) => {
    // Mark read
    if (!note.is_read) {
        note.is_read = true;
        notificationsApi.markAsRead(note.id).catch(err => console.error('Mark read failed', err));
    }

    // If quote received, go to order detail
    if (note.type === 'quote_received' && note.related_id) {
         uni.navigateTo({ url: `/pages/index/custom-service-detail?id=${note.related_id}` });
    }
}
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.pt-safe { padding-top: env(safe-area-inset-top); }
.pb-4 { padding-bottom: 16px; }
.fixed { position: fixed; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.justify-between { justify-content: space-between; }
.p-2 { padding: 8px; }
.p-4 { padding: 16px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-3 { padding-top: 12px; padding-bottom: 16px; }
.rounded-xl { border-radius: 12px; }
.rounded-full { border-radius: 9999px; }
.shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.text-gray-900 { color: #111827; }
.text-gray-600 { color: #4b5563; }
.text-gray-400 { color: #9ca3af; }
.text-red-500 { color: #ef4444; }
.text-white { color: #ffffff; }
.bg-white { background-color: #ffffff; }
.bg-white-20 { background-color: rgba(255, 255, 255, 0.2); }
.bg-red-500 { background-color: #ef4444; }
.font-bold { font-weight: 700; }
.text-lg { font-size: 18px; }
.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.border-b { border-bottom-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.w-10 { width: 40px; }
.h-10 { height: 40px; }
.header-gradient { background: linear-gradient(180deg, #047857 0%, #059669 100%); }
</style>
