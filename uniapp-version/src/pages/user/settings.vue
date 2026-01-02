<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between sticky top-0 z-10 border-b border-gray-100" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="p-1"><AppIcon name="chevron-left" :size="24" color="#374151" /></view>
       <text class="text-lg font-bold text-gray-800">设置</text>
       <view class="w-6"></view>
    </view>

    <view class="bg-white mt-4">
        <view class="flex flex-row items-center justify-between px-4 py-4 border-b border-gray-100 active:bg-gray-50" @click="goPage('/pages/user/profile-info')">
             <view class="flex flex-row items-center gap-3">
                 <AppIcon name="user" :size="20" color="#4B5563" />
                 <text class="text-gray-800 font-medium">个人信息</text>
             </view>
             <AppIcon name="chevron-right" :size="18" color="#9CA3AF" />
        </view>
        <view class="flex flex-row items-center justify-between px-4 py-4 border-b border-gray-100 active:bg-gray-50" @click="goPage('/pages/user/change-password')">
             <view class="flex flex-row items-center gap-3">
                 <AppIcon name="lock" :size="20" color="#4B5563" />
                 <text class="text-gray-800 font-medium">修改密码</text>
             </view>
             <AppIcon name="chevron-right" :size="18" color="#9CA3AF" />
        </view>
        <view class="flex flex-row items-center justify-between px-4 py-4 border-b border-gray-100 active:bg-gray-50" @click="goPage('/pages/user/notification-settings')">
             <view class="flex flex-row items-center gap-3">
                 <AppIcon name="bell" :size="20" color="#4B5563" />
                 <text class="text-gray-800 font-medium">消息通知设置</text>
             </view>
             <AppIcon name="chevron-right" :size="18" color="#9CA3AF" />
        </view>
    </view>

    <view class="mt-8 px-4">
        <button class="bg-white text-red-500 font-medium py-3 rounded-xl border border-gray-200" @click="handleLogout">
            退出登录
        </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { logout } from '@/services/api';

const safeAreaTop = ref(0);
onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
});
const goBack = () => uni.navigateBack();
const goPage = (url: string) => uni.navigateTo({ url });

const handleLogout = () => {
    uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res: any) => {
            if (res.confirm) {
                logout();
                // Relaunch to index to reset state
                uni.reLaunch({ url: '/pages/index/index' });
            }
        }
    })
};
</script>
