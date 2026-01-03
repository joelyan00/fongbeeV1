<template>
  <view class="page-container">
    <!-- Header -->
    <view class="custom-header" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="header-icon"><AppIcon name="chevron-left" :size="24" color="#374151" /></view>
       <text class="header-title">设置</text>
       <view class="header-placeholder"></view>
    </view>

    <view class="menu-section">
        <view class="menu-item" @click="goPage('/pages/user/profile-info')">
             <view class="menu-left">
                 <AppIcon name="user" :size="20" color="#4B5563" />
                 <text class="menu-text">个人信息</text>
             </view>
             <AppIcon name="chevron-right" :size="18" color="#9CA3AF" />
        </view>
        <view class="menu-item" @click="goPage('/pages/user/change-password')">
             <view class="menu-left">
                 <AppIcon name="lock" :size="20" color="#4B5563" />
                 <text class="menu-text">修改密码</text>
             </view>
             <AppIcon name="chevron-right" :size="18" color="#9CA3AF" />
        </view>
        <view class="menu-item menu-item-last" @click="goPage('/pages/user/notification-settings')">
             <view class="menu-left">
                 <AppIcon name="bell" :size="20" color="#4B5563" />
                 <text class="menu-text">消息通知设置</text>
             </view>
             <AppIcon name="chevron-right" :size="18" color="#9CA3AF" />
        </view>
    </view>

    <view class="logout-section">
        <button class="logout-btn" @click="handleLogout">
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
                uni.reLaunch({ url: '/pages/index/index' });
            }
        }
    })
};
</script>

<style scoped>
.page-container {
    background-color: #f9fafb;
    min-height: 100vh;
    padding-bottom: 40px;
}
.custom-header {
    background-color: #fff;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid #f3f4f6;
}
.header-icon {
    padding: 4px;
}
.header-title {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
}
.header-placeholder {
    width: 24px;
}
.menu-section {
    background-color: #fff;
    margin-top: 16px;
    border-radius: 12px;
    margin-left: 16px;
    margin-right: 16px;
    overflow: hidden;
}
.menu-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
}
.menu-item-last {
    border-bottom: none;
}
.menu-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
}
.menu-text {
    font-size: 15px;
    color: #1f2937;
    font-weight: 500;
}
.logout-section {
    margin-top: 32px;
    padding-left: 16px;
    padding-right: 16px;
}
.logout-btn {
    background-color: #fff;
    color: #ef4444;
    font-weight: 500;
    font-size: 15px;
    padding-top: 14px;
    padding-bottom: 14px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    width: 100%;
    text-align: center;
}
</style>
