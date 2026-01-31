<template>
  <view class="min-h-screen bg-gray-50" style="background-color: #f9fafb; min-height: 100vh;">
    <!-- Header aligned with Capsule Button -->
    <view class="bg-white border-b border-gray-100" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #f3f4f6;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}">
      <view style="display: flex !important; flex-direction: row !important; align-items: center !important;" :style="{height: navBarHeight + 'px'}">
        <view @click="handleBack" style="width: 40px; height: 100%; display: flex; align-items: center; justify-content: flex-start;">
          <AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }"/>
        </view>
        <text style="font-weight: bold; font-size: 18px; flex: 1; text-align: center; padding-right: 40px; color: #1f2937;">消息通知</text>
      </view>
    </view>
    
    <!-- Spacer for fixed header -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px'}"></view>

    <!-- Empty State -->
    <view v-if="notifications.length === 0" class="flex flex-col items-center justify-center pt-20" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 80px;">
        <AppIcon name="bell-off" :size="48" color="#ccc"/>
        <text class="text-gray-400 text-sm mt-4" style="color: #9ca3af; font-size: 14px; margin-top: 16px;">暂无新消息</text>
    </view>

    <!-- List -->
    <view v-else style="padding: 16px 20px; display: flex; flex-direction: column; gap: 12px;">
        <view 
          v-for="note in notifications" 
          :key="note.id" 
          class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors" 
          @click="handleClick(note)"
          style="background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f3f4f6;"
        >
            <view class="flex flex-row justify-between items-start mb-2" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: flex-start; margin-bottom: 8px;">
                <view class="flex flex-row items-center gap-2" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 8px;">
                     <view v-if="!note.is_read" class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; flex-shrink: 0;"></view>
                     <text class="font-bold text-gray-900 text-base" :class="{'text-gray-600': note.is_read}" style="font-weight: 700; color: #111827; font-size: 16px;">{{ note.title || '系统通知' }}</text>
                </view>
                <text class="text-gray-400 text-xs flex-shrink-0 ml-2" style="font-size: 11px; color: #9ca3af; flex-shrink: 0; margin-left: 8px;">{{ formatDate(note.created_at) }}</text>
            </view>
            <text class="text-gray-600 text-sm leading-relaxed" style="color: #4b5563; font-size: 14px; line-height: 1.6;">{{ note.content }}</text>
            
            <view v-if="note.related_id" class="mt-3 flex flex-row justify-end" style="margin-top: 12px; display: flex !important; flex-direction: row !important; justify-content: flex-end !important;">
                <text class="text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded" style="color: #059669; font-size: 12px; font-weight: 500; background: #ecfdf5; padding: 4px 8px; border-radius: 4px;">点击查看详情 ></text>
            </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { notificationsApi } from '@/services/api';

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);

const notifications = ref<any[]>([]);

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
.header-light { background: #ffffff; border-bottom: 1px solid #f3f4f6; padding-left: 16px; padding-right: 16px; }
.header-row { display: flex; flex-direction: row; align-items: center; justify-content: space-between; height: 56px; }
.header-back { width: 40px; height: 56px; display: flex; align-items: center; justify-content: flex-start; margin-left: 6px; }
.header-title { font-size: 18px; font-weight: bold; color: #1f2937; line-height: 56px; }
.header-placeholder { width: 40px; }
.header-placeholder { width: 40px; }
</style>
