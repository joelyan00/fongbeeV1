<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header-gradient" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="header-icon"><AppIcon name="chevron-left" :size="24" color="#ffffff" /></view>
       <text class="header-title">消息通知设置</text>
       <view class="header-action" @click="handleSave">
           <text class="header-action-text">保存</text>
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
.header-gradient {
    background: linear-gradient(180deg, #047857 0%, #059669 100%);
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
}
.header-icon {
    padding: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
}
.header-title {
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
}
.header-action {
    width: 40px;
    text-align: right;
}
.header-action-text {
    color: #ffffff;
    font-weight: bold;
    font-size: 14px;
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
