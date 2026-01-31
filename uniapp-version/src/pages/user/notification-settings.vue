<template>
  <view class="page-container" style="background-color: #f9fafb; min-height: 100vh; padding-bottom: 40px;">
    <!-- Header aligned with Capsule Button -->
    <view class="header-light" style="background: #ffffff; padding-left: 16px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid #f3f4f6;" :style="{paddingTop: statusBarHeight + 'px', paddingRight: capsuleWidth + 'px'}">
       <view class="header-row" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important;" :style="{height: navBarHeight + 'px'}">
         <view @click="goBack" class="header-back" style="width: 40px; display: flex; align-items: center; justify-content: flex-start;" :style="{height: navBarHeight + 'px'}"><AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" /></view>
         <text class="header-title" style="font-size: 18px; font-weight: bold; color: #1f2937; position: absolute; left: 50%; transform: translateX(-50%);">消息通知设置</text>
         <view class="header-action" @click="handleSave" style="width: 50px; display: flex; align-items: center; justify-content: center;">
             <text class="header-action-text" style="color: #059669; font-weight: bold; font-size: 14px;">保存</text>
         </view>
       </view>
    </view>
    
    <!-- Spacer to push content below fixed header -->
    <view :style="{height: (statusBarHeight + navBarHeight) + 'px'}"></view>

    <view class="settings-section" style="background-color: #fff; margin: 16px; border-radius: 12px; overflow: hidden;">
        <view class="setting-item" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 16px; border-bottom: 1px solid #f3f4f6;">
            <text class="setting-label" style="font-size: 15px; color: #1f2937; font-weight: 500;">短信通知</text>
            <switch :checked="settings.sms" color="#10b981" @change="(e: any) => settings.sms = e.detail.value" />
        </view>
        <view class="setting-item" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 16px; border-bottom: 1px solid #f3f4f6;">
            <text class="setting-label" style="font-size: 15px; color: #1f2937; font-weight: 500;">邮件通知</text>
            <switch :checked="settings.email" color="#10b981" @change="(e: any) => settings.email = e.detail.value" />
        </view>
        <view class="setting-item setting-item-last" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 16px;">
            <text class="setting-label" style="font-size: 15px; color: #1f2937; font-weight: 500;">站内消息</text>
            <switch :checked="settings.site" color="#10b981" @change="(e: any) => settings.site = e.detail.value" />
        </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import AppIcon from '@/components/Icons.vue';

// Header metrics for capsule alignment
const statusBarHeight = ref(44);
const navBarHeight = ref(44);
const capsuleWidth = ref(87);
const settings = reactive({ sms: true, email: true, site: true });

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

const handleSave = () => {
    uni.showLoading({ title: '保存中...' });
    setTimeout(() => {
        uni.hideLoading();
        uni.showToast({ title: '通知设置已保存', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 1000);
    }, 800);
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
.header-action {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.header-action-text {
    color: #059669;
    font-weight: bold;
    font-size: 14px;
}
.pt-safe {
    padding-top: env(safe-area-inset-top);
}
.settings-section {
    background-color: #fff;
    margin: 16px;
    border-radius: 12px;
    overflow: hidden;
}
.setting-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
}
.setting-item-last {
    border-bottom: none;
}
.setting-label {
    font-size: 15px;
    color: #1f2937;
    font-weight: 500;
}
</style>
