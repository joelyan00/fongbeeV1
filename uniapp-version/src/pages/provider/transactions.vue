<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); width: 100%; overflow-x: hidden; box-sizing: border-box;">
    <!-- Global Navbar -->
    <GlobalNavbar 
      title="交易记录" 
      background-color="#0f172a" 
      title-color="#ffffff" 
      icon-color="#ffffff"
      :show-back="true"
      :custom-back="goBack"
      :fixed="true"
    />

    <!-- Filter Tabs -->
    <view style="padding: 16px;">
       <view style="display: flex; flex-direction: row; gap: 12px; justify-content: center; flex-wrap: wrap;">
         <view 
            v-for="tab in tabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            :style="{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 20px',
              borderRadius: '20px',
              background: activeTab === tab.key ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: activeTab === tab.key ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)'
            }"
          >
            <text :style="{
              fontSize: '14px',
              color: activeTab === tab.key ? '#10b981' : '#94a3b8',
              fontWeight: activeTab === tab.key ? '600' : '500'
            }">{{ tab.label }}</text>
          </view>
       </view>
    </view>

    <!-- Transaction List -->
    <scroll-view scroll-y style="padding: 0 16px; width: 100%; box-sizing: border-box;" :style="{ height: listHeight }">
      <!-- Loading State -->
      <view v-if="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0;">
        <view style="width: 36px; height: 36px; border: 3px solid #374151; border-top-color: #10b981; border-radius: 50%;"></view>
        <text style="margin-top: 12px; font-size: 14px; color: #9ca3af;">加载中...</text>
      </view>

      <!-- Empty State -->
      <view v-else-if="filteredTransactions.length === 0" style="display: flex; flex-direction: column; align-items: center; padding: 60px 20px;">
        <view style="width: 100px; height: 100px; background: rgba(16, 185, 129, 0.1); border-radius: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <view style="width: 70px; height: 70px; background: #1f2937; border: 1px solid #374151; border-radius: 35px; display: flex; align-items: center; justify-content: center;">
            <AppIcon name="credit-card" :size="48" color="#10b981" />
          </view>
        </view>
        <text style="font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">暂无交易记录</text>
        <text style="font-size: 14px; color: #9ca3af;">当有交易时，将在这里显示</text>
      </view>

      <!-- Transaction Cards -->
      <view v-else style="display: flex; flex-direction: column; gap: 12px; padding-bottom: 40px;">
        <view 
          v-for="tx in filteredTransactions" 
          :key="tx.id"
          style="background: #1f2937; border-radius: 16px; border: 1px solid #374151; overflow: hidden;"
        >
          <view style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 16px;">
            <view style="display: flex; flex-direction: row; align-items: center; gap: 12px;">
              <view :style="{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : tx.type === 'expense' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'
              }">
                <text :style="{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: tx.type === 'income' ? '#10b981' : tx.type === 'expense' ? '#ef4444' : '#3b82f6'
                }">{{ tx.type === 'income' ? '收' : tx.type === 'expense' ? '支' : '提' }}</text>
              </view>
              <view style="display: flex; flex-direction: column; gap: 4px;">
                <text style="font-size: 15px; font-weight: 600; color: #ffffff;">{{ tx.title }}</text>
                <text style="font-size: 12px; color: #6b7280;">{{ tx.time }}</text>
              </view>
            </view>
            <view style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <text :style="{
                fontSize: '16px',
                fontWeight: '700',
                color: tx.type === 'income' ? '#10b981' : '#ef4444'
              }">{{ tx.amount }}</text>
              <text style="font-size: 12px; color: #6b7280;">{{ tx.statusText }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import GlobalNavbar from '@/components/GlobalNavbar.vue';

const loading = ref(false);
const activeTab = ref('all');
const listHeight = ref('calc(100vh - 160px)'); // Adjusted for smaller header

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'income', label: '收入' },
  { key: 'expense', label: '支出' },
  { key: 'withdraw', label: '提现' },
];

// Mock transactions
const transactions = ref<any[]>([
  // { id: 1, type: 'income', title: '订单收入', amount: '+$450.00', time: '2025/07/28 17:40', status: 'completed', statusText: '已完成' },
]);

const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') return transactions.value;
  return transactions.value.filter(tx => tx.type === activeTab.value);
});

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding-top: env(safe-area-inset-top);
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  flex-shrink: 0;
}

.back-btn, .placeholder-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.placeholder-btn {
  background: transparent;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
}

/* Tabs Wrapper (Fixed Center Layout) */
.tabs-wrapper {
  margin: 16px 0;
  padding: 0 16px;
}

/* Tabs Row - Fixed 4 items layout */
.tabs-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between; /* Distribute evenly */
  align-items: center;
  gap: 8px; /* Small gap between items */
  width: 100%;
}

/* Minimalist Chip Styles */
.tab-item {
  flex: 1; /* Each item takes equal width */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  height: 36px;
  border-radius: 100px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  background: #1f2937;
  border: 1px solid #374151;
}

.tab-inactive {
  background: transparent;
  border-color: #374151;
}

.tab-active {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.tab-label {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}

.tab-label-active {
  color: #10b981;
  font-weight: 600;
}

/* List Container */
.list-container {
  padding: 0 20px 20px 20px;
  width: 100%;
  box-sizing: border-box;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb; /* Standard color */
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #9ca3af;
}

/* Empty State */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.empty-illustration {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.empty-circle {
  width: 100px;
  height: 100px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 10px;
  left: 10px;
}

.empty-icon-wrap {
  width: 70px;
  height: 70px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
}

.empty-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.deco-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background: #10b981;
}

.deco-1 { top: 0; right: 20px; opacity: 0.3; }
.deco-2 { bottom: 20px; right: 0; width: 8px; height: 8px; opacity: 0.5; }
.deco-3 { top: 40px; left: 0; width: 6px; height: 6px; opacity: 0.4; }

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
}

/* Transaction List */
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
}

.transaction-card {
  background: #1f2937;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #374151;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.card-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.tx-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.tx-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tx-icon-income {
  background: rgba(16, 185, 129, 0.15); /* More subtle */
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.tx-icon-expense {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.tx-icon-withdraw {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.tx-icon-text {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.tx-title {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tx-time {
  font-size: 12px;
  color: #6b7280;
  display: block;
}

.tx-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.tx-amount {
  font-size: 18px;
  font-weight: 700;
}

.tx-amount-income {
  color: #10b981;
}

.tx-amount-expense {
  color: #ef4444;
}

.tx-status {
  font-size: 11px;
  color: #6b7280;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
