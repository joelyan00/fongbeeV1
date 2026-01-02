<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <!-- Header -->
    <view class="bg-white px-4 py-3 flex flex-row items-center justify-between sticky top-0 z-10 border-b border-gray-100" :style="{ paddingTop: safeAreaTop + 'px' }">
       <view @click="goBack" class="p-1"><AppIcon name="chevron-left" :size="24" color="#374151" /></view>
       <text class="text-lg font-bold text-gray-800">消息通知设置</text>
       <view class="w-10 flex items-end" @click="handleSave">
           <text class="text-emerald-600 font-bold text-sm">保存</text>
       </view>
    </view>

    <view class="bg-white mt-4">
        <view class="flex flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <text class="text-gray-800 font-medium">短信通知</text>
            <switch :checked="settings.sms" color="#10b981" @change="(e: any) => settings.sms = e.detail.value" />
        </view>
        <view class="flex flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <text class="text-gray-800 font-medium">邮件通知</text>
            <switch :checked="settings.email" color="#10b981" @change="(e: any) => settings.email = e.detail.value" />
        </view>
        <view class="flex flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <text class="text-gray-800 font-medium">站内消息</text>
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
