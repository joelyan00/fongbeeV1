<template>
  <view class="loading-container">
    <view class="loading-spinner"></view>
    <text class="loading-text">加载中...</text>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ordersV2Api } from '@/services/api';

onLoad(async (options) => {
  // URL format: /pages/pr?orderNo=ORD20260114569562
  const orderNo = options?.orderNo;
  
  if (!orderNo) {
    uni.showToast({ title: '无效链接', icon: 'error' });
    return;
  }
  
  try {
    // Get order by order_no to get the id and token
    const res = await ordersV2Api.getOrderByNo(orderNo);
    
    if (res.success && res.order) {
      // Redirect to provider-response page with full params
      uni.redirectTo({
        url: `/pages/order/provider-response?id=${res.order.id}&token=${res.order.provider_access_token}`
      });
    } else {
      uni.showToast({ title: '订单不存在', icon: 'error' });
    }
  } catch (error) {
    console.error('Failed to load order:', error);
    uni.showToast({ title: '加载失败', icon: 'error' });
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 16px;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
