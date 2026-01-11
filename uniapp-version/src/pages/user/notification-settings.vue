<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header-light pt-safe">
       <view class="header-row">
         <view @click="goBack" class="header-back"><AppIcon name="chevron-left" :size="28" :style="{ color: '#059669' }" /></view>
         <text class="header-title">消息通知设置</text>
         <view class="header-action" @click="handleSave">
             <text class="header-action-text">保存</text>
         </view>
       </view>
    </view>

    <view class="settings-section">
        <view class="setting-item">
            <text class="setting-label">短信通知</text>
            <switch :checked="settings.sms" color="#10b981" @change="(e: any) => settings.sms = e.detail.value" />
        </view>
        <view class="setting-item">
            <text class="setting-label">邮件通知</text>
            <switch :checked="settings.email" color="#10b981" @change="(e: any) => settings.email = e.detail.value" />
        </view>
        <view class="setting-item setting-item-last">
            <text class="setting-label">站内消息</text>
            <switch :checked="settings.site" color="#10b981" @change="(e: any) => settings.site = e.detail.value" />
        </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import AppIcon from '@/components/Icons.vue';

const safeAreaTop = ref(0);
const settings = reactive({ sms: true, email: true, site: true });

onMounted(() => {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaTop.value = sysInfo.safeAreaInsets?.top || 20;
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
