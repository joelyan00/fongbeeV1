<template>
  <view class="credits-balance-card">
    <view class="balance-header">
      <text class="balance-title">我的积分</text>
      <text class="refresh-btn" @click="refreshBalance">刷新</text>
    </view>
    
    <view class="balance-content">
      <view class="balance-item main">
        <text class="balance-label">总积分</text>
        <text class="balance-value">{{ balance.total || 0 }}</text>
      </view>
      
      <view v-if="balance.subscriptionInfo" class="balance-divider"></view>
      
      <view v-if="balance.subscriptionInfo" class="balance-details">
        <view class="balance-item">
          <text class="balance-label">订阅积分</text>
          <text class="balance-value small">{{ balance.subscription || 0 }}</text>
        </view>
        
        <view class="balance-item">
          <text class="balance-label">上架次数</text>
          <text class="balance-value small">{{ balance.listings || 0 }}</text>
        </view>
        
        <view class="balance-item">
          <text class="balance-label">购买积分</text>
          <text class="balance-value small">{{ balance.purchased || 0 }}</text>
        </view>
      </view>
    </view>
    
    <view v-if="showActions" class="balance-actions">
      <button class="action-btn primary" @click="handleBuyCredits">购买积分</button>
      <button v-if="!balance.subscriptionInfo" class="action-btn secondary" @click="handleSubscribe">
        订阅套餐
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { creditsApi } from '@/services/api';

interface Props {
  showActions?: boolean;
  autoRefresh?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  autoRefresh: false
});

const balance = ref({
  total: 0,
  purchased: 0,
  subscription: 0,
  listings: 0,
  subscriptionInfo: null as any
});

const loading = ref(false);

const fetchBalance = async () => {
  try {
    loading.value = true;
    const res = await creditsApi.getBalance();
    if (res.success) {
      balance.value = res.data;
    }
  } catch (error: any) {
    console.error('获取积分余额失败:', error);
    uni.showToast({
      title: error.message || '获取积分失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

const refreshBalance = () => {
  fetchBalance();
};

const handleBuyCredits = () => {
  uni.navigateTo({
    url: '/pages/provider/buy-credits'
  });
};

const handleSubscribe = () => {
  uni.navigateTo({
    url: '/pages/provider/subscription'
  });
};

onMounted(() => {
  fetchBalance();
  
  // Auto refresh if enabled
  if (props.autoRefresh) {
    setInterval(fetchBalance, 60000); // Refresh every minute
  }
});

// Expose refresh method for parent component
defineExpose({
  refreshBalance
});
</script>

<style scoped>
.credits-balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  margin: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.balance-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.refresh-btn {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
}

.balance-content {
  margin-bottom: 16px;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.balance-item.main {
  margin-bottom: 16px;
}

.balance-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.balance-value {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
}

.balance-value.small {
  font-size: 18px;
  font-weight: 600;
}

.balance-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 0;
}

.balance-details {
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.balance-details .balance-item {
  margin-bottom: 8px;
}

.balance-details .balance-item:last-child {
  margin-bottom: 0;
}

.balance-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
}

.action-btn.primary {
  background: #ffffff;
  color: #667eea;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}
</style>
