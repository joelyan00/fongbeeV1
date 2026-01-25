<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header-light pt-safe">
       <view class="header-row">
         <view @click="goBack" class="header-back"><AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" /></view>
         <text class="header-title">设置</text>
         <view class="header-placeholder"></view>
       </view>
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

    <!-- Logout Button -->
    <view class="logout-section">
      <view class="logout-btn" @click="showLogoutModal = true">
        <AppIcon name="log-out" :size="20" color="#ef4444" />
        <text class="logout-text">退出登录</text>
      </view>
    </view>

    <!-- Custom Logout Modal -->
    <ActionModal
      v-model:visible="showLogoutModal"
      title="确认退出"
      message="是否确认退出当前账号？"
      icon="log-out"
      icon-color="#ef4444"
      icon-bg-color="#fef2f2"
      confirm-text="退出登录"
      cancel-text="取消"
      confirm-bg="#ef4444"
      @confirm="confirmLogout"
    />

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import ActionModal from '@/components/ActionModal.vue';
import { logout } from '@/services/api';

const safeAreaTop = ref(0);
const showLogoutModal = ref(false);

onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
});

const goBack = () => uni.navigateBack();
const goPage = (url: string) => uni.navigateTo({ url });

const confirmLogout = () => {
  logout();
  uni.showToast({ title: '已退出登录', icon: 'success' });
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/index/index' });
  }, 500);
};

</script>

<style scoped>
.page-container {
    background-color: #f9fafb;
    min-height: 100vh;
    padding-bottom: 40px;
}
.header-light {
    background: #ffffff;
    padding-left: 16px;
    padding-right: 16px;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid #f3f4f6;
}
.header-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 56px;
}
.header-back {
    width: 40px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: 6px;
}
.header-title {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
    line-height: 56px;
}
.header-placeholder {
    width: 40px;
}
.pt-safe {
    padding-top: env(safe-area-inset-top);
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

/* Logout Section */
.logout-section {
    margin: 24px 16px;
}
.logout-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
}
.logout-text {
    font-size: 16px;
    font-weight: 600;
    color: #ef4444;
}

.logout-text {
    font-size: 16px;
    font-weight: 600;
    color: #ef4444;
}
</style>


