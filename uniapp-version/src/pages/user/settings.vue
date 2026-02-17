<template>
  <view class="page-container" style="background-color: #f9fafb; min-height: 100vh; padding-bottom: 40px;">
    <!-- Header aligned with Capsule Button -->
    <view class="header-light" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #f3f4f6;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: (capsuleWidth + 16) + 'px'}">
       <view class="header-row" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important;" :style="{height: navBarHeight + 'px'}">
         <view @click="goBack" class="header-back" style="width: 40px; display: flex; align-items: center; justify-content: flex-start;" :style="{height: navBarHeight + 'px'}"><AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" /></view>
         <text class="header-title" style="font-size: 18px; font-weight: bold; color: #1f2937; position: absolute; left: 50%; transform: translateX(-50%);">设置</text>
         <view class="header-placeholder" style="width: 40px;"></view>
       </view>
    </view>
    
    <!-- Spacer to push content below fixed header -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px'}"></view>

    <view class="menu-section" style="background-color: #fff; margin-top: 16px; border-radius: 12px; margin-left: 16px; margin-right: 16px; overflow: hidden;">
        <view class="menu-item" @click="goPage('/pages/user/profile-info')" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 16px; border-bottom: 1px solid #f3f4f6;">
             <view class="menu-left" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 12px;">
                 <AppIcon name="user" :size="20" color="#4B5563" />
                 <text class="menu-text" style="font-size: 15px; color: #1f2937; font-weight: 500; margin-left: 12px;">个人信息</text>
             </view>
             <AppIcon name="chevron-right" :size="18" color="#9CA3AF" />
        </view>
        <view class="menu-item" @click="goPage('/pages/user/change-password')" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 16px; border-bottom: 1px solid #f3f4f6;">
             <view class="menu-left" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 12px;">
                 <AppIcon name="lock" :size="20" color="#4B5563" />
                 <text class="menu-text" style="font-size: 15px; color: #1f2937; font-weight: 500; margin-left: 12px;">修改密码</text>
             </view>
             <AppIcon name="chevron-right" :size="18" color="#9CA3AF" />
        </view>
        <view class="menu-item menu-item-last" @click="goPage('/pages/user/notification-settings')" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 16px;">
             <view class="menu-left" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 12px;">
                 <AppIcon name="bell" :size="20" color="#4B5563" />
                 <text class="menu-text" style="font-size: 15px; color: #1f2937; font-weight: 500; margin-left: 12px;">消息通知设置</text>
             </view>
             <AppIcon name="chevron-right" :size="18" color="#9CA3AF" />
        </view>
    </view>

    <!-- Logout Button -->
    <view class="logout-section" style="margin: 24px 16px;">
      <view class="logout-btn" @click="showLogoutModal = true" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: center !important; gap: 8px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
        <AppIcon name="log-out" :size="20" color="#ef4444" />
        <text class="logout-text" style="font-size: 16px; font-weight: 600; color: #ef4444; margin-left: 8px;">退出登录</text>
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

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);
const showLogoutModal = ref(false);

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
</style>


