<template>
  <view class="container">
    <view class="loading">
      <view class="spinner"></view>
      <text class="text">正在跳转...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';

onLoad((options) => {
  console.log('Register Page Redirect:', options);
  
  // Extract params
  // Legacy links use ?role_invite=user&ref=...&contact=...
  const roleInvite = options?.role_invite || options?.register;
  const refCode = options?.ref;
  const contact = options?.contact;
  
  // Construct target URL (Home page with register param)
  // Use /pages/index/index as the main entry
  let targetUrl = `/pages/index/index?register=${roleInvite || 'user'}`;
  
  if (refCode) targetUrl += `&ref=${refCode}`;
  if (contact) targetUrl += `&contact=${encodeURIComponent(contact)}`;
  
  // Redirect
  uni.reLaunch({
    url: targetUrl
  });
});
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.text {
  margin-top: 12px;
  color: #6b7280;
  font-size: 14px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
