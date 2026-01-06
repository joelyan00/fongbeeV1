<template>
  <view class="transactions-page">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="arrow-left" :size="20" color="#fff" />
      </view>
      <text class="title">交易记录</text>
      <view class="placeholder"></view>
    </view>

    <!-- Filter Tabs -->
    <view class="filter-tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- Transaction List -->
    <scroll-view 
      scroll-y 
      class="transaction-list"
      v-if="filteredTransactions.length > 0"
    >
      <view 
        v-for="tx in filteredTransactions" 
        :key="tx.id"
        class="transaction-item"
      >
        <view :class="['icon', tx.type]">
          {{ tx.type === 'income' ? '收' : tx.type === 'expense' ? '支' : '提' }}
        </view>
        <view class="content">
          <view class="top-row">
            <text class="tx-title">{{ tx.title }}</text>
            <text :class="['amount', tx.type]">{{ tx.amount }}</text>
          </view>
          <view class="bottom-row">
            <text class="time">{{ tx.time }}</text>
            <text :class="['status', tx.status]">{{ tx.statusText }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Empty State -->
    <view v-else class="empty-state">
      <AppIcon name="credit-card" :size="48" color="#ccc" />
      <text class="empty-text">暂无交易记录</text>
      <text class="empty-sub">当有交易时，将在这里显示</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const activeTab = ref('all');

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'income', label: '收入' },
  { key: 'expense', label: '支出' },
  { key: 'withdraw', label: '提现' },
];

// Mock transactions - replace with API data
const transactions = ref<any[]>([
  // { id: 1, type: 'income', title: '订单收入', amount: '+¥450.00', time: '2025/07/28 17:40', status: 'completed', statusText: '已完成' },
  // { id: 2, type: 'withdraw', title: '提现到银行卡', amount: '-¥1,000.00', time: '2025/07/27 14:20', status: 'pending', statusText: '处理中' },
  // { id: 3, type: 'income', title: '订单收入', amount: '+¥180.00', time: '2025/07/26 10:00', status: 'completed', statusText: '已完成' },
]);

const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') return transactions.value;
  return transactions.value.filter(tx => tx.type === activeTab.value);
});

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.transactions-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  padding: 60rpx 32rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.placeholder {
  width: 60rpx;
}

.filter-tabs {
  background: #fff;
  display: flex;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab.active {
  color: #22c55e;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 4rpx;
  background: #22c55e;
  border-radius: 2rpx;
}

.transaction-list {
  flex: 1;
  background: #fff;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.icon.income {
  background: #22c55e;
}

.icon.expense {
  background: #ef4444;
}

.icon.withdraw {
  background: #f59e0b;
}

.content {
  flex: 1;
  min-width: 0;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.tx-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.amount {
  font-size: 30rpx;
  font-weight: bold;
}

.amount.income {
  color: #22c55e;
}

.amount.expense,
.amount.withdraw {
  color: #ef4444;
}

.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time {
  font-size: 24rpx;
  color: #999;
}

.status {
  font-size: 24rpx;
}

.status.completed {
  color: #999;
}

.status.pending {
  color: #f59e0b;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-top: 32rpx;
}

.empty-sub {
  font-size: 26rpx;
  color: #bbb;
  margin-top: 16rpx;
}
</style>
