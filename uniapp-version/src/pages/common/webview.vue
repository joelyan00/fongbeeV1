<template>
  <view>
    <web-view :src="url" @message="handleMessage"></web-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const url = ref('');

onLoad((options: any) => {
    if (options.url) {
        url.value = decodeURIComponent(options.url);
    }
});

const handleMessage = (e: any) => {
    console.log('WebView message:', e);
    // Handle messages from H5 if needed
    if (e.detail && e.detail.data) {
        const data = e.detail.data;
        // Example: Refresh list after success
        // const pages = getCurrentPages();
        // const prevPage = pages[pages.length - 2];
        // if (prevPage && prevPage.$vm.fetchCards) {
        //     prevPage.$vm.fetchCards();
        // }
    }
};
</script>

<style scoped>
</style>
