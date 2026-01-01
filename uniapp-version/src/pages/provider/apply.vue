<template>
  <ProviderApplyPage 
    @back="handleBack" 
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
import ProviderApplyPage from '@/components/ProviderApplyPage.vue';

const handleBack = () => {
    uni.navigateBack();
};

const handleSuccess = () => {
    uni.showToast({ title: '申请已提交', icon: 'success' });
    setTimeout(() => {
        uni.reLaunch({ url: '/pages/index/index' });
    }, 1500);
};
</script>
