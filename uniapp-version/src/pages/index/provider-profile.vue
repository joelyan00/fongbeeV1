<template>
  <view class="page-container">
    <PublicProviderProfilePage 
      v-if="providerId" 
      :provider-id="providerId" 
      @back="handleBack"
    />
    
    <!-- State: Error/Empty -->
    <view v-else class="empty-state">
        <AppIcon name="alert-circle" :size="48" color="#ccc"/>
        <text class="empty-text">未能加载服务商信息</text>
    </view>

    <!-- Bottom Action Bar (Hire) -->
    <view v-if="showHireButton" class="hire-bar">
         <view class="price-section">
             <text class="price-label">服务报价</text>
             <text class="price-value">${{ quotePrice }}</text>
         </view>
         <button 
            class="hire-btn"
            :disabled="hiring"
            @click="handleHire"
         >
            {{ hiring ? '处理中...' : '立即雇佣' }}
         </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppIcon from '@/components/Icons.vue';
import PublicProviderProfilePage from '@/components/PublicProviderProfilePage.vue';
import { quotesApi, ordersApi } from '@/services/api';

const providerId = ref('');
const orderId = ref('');
const quotePrice = ref('');
const quoteDeposit = ref('');
const quoteId = ref('');
const hasQuoted = ref(false);
const hiring = ref(false);

const showHireButton = computed(() => {
    return providerId.value && hasQuoted.value && quoteId.value;
});

onLoad((options) => {
    if (options && options.id) {
        providerId.value = options.id;
        if (options.orderId) orderId.value = options.orderId;
        if (options.hasQuoted === '1') hasQuoted.value = true;
        if (options.quotePrice) quotePrice.value = options.quotePrice;
        if (options.quoteDeposit) quoteDeposit.value = options.quoteDeposit;
        if (options.quoteId) quoteId.value = options.quoteId;
    }
});

function handleBack() {
    uni.navigateBack();
}

async function handleHire() {
    if (!quoteId.value) {
        uni.showToast({ title: '无有效报价单', icon: 'none' });
        return;
    }

    const price = Number(quotePrice.value);
    const deposit = Number(quoteDeposit.value) || 0;
    const balance = price - deposit;

    const content = `请确认以下订单内容：\n\n` +
                    `订单金额：$${price}\n` +
                    `定金：$${deposit} (将扣款到平台)\n\n` +
                    `等服务开始时，您确认后，定金$${deposit}将支付给服务商，\n` +
                    `等服务商完成后，再支付余额$${balance}。`;

    uni.showModal({
        title: '确认雇佣',
        content: content,
        confirmText: '确认',
        success: async (res) => {
            if (res.confirm) {
                 try {
                    hiring.value = true;
                    // 1. Accept Quote (Hire)
                    await quotesApi.accept(quoteId.value);
                    
                    // 2. Auto Pay Deposit (using default card)
                    const depositAmt = Number(quoteDeposit.value) || 0;
                    if (depositAmt > 0 && orderId.value) {
                         uni.showLoading({ title: '正在支付定金...' });
                         await ordersApi.payDeposit(orderId.value);
                         uni.showToast({ title: '雇佣成功且已付定金', icon: 'success' });
                    } else {
                         uni.showToast({ title: '雇佣成功', icon: 'success' });
                    }
                    
                    setTimeout(() => {
                         uni.navigateBack();
                    }, 1500);
                } catch (error: any) {
                    console.error('Hire/Pay error:', error);
                    const msg = error.message || '操作失败';
                    if (msg.includes('绑定支付卡片') || msg.includes('payment')) {
                         uni.showToast({ title: '已雇佣，请手动支付定金', icon: 'none' });
                         setTimeout(() => uni.navigateBack(), 2000);
                    } else {
                         uni.showToast({ title: msg, icon: 'none' });
                         hiring.value = false;
                    }
                }
            }
        }
    });
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #F5F7FA;
}

.empty-state {
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  padding-top: 100px;
}

.empty-text {
  font-size: 14px; 
  color: #999; 
  margin-top: 12px;
}

.hire-bar {
  position: fixed; 
  bottom: 0; 
  left: 0; 
  right: 0; 
  background-color: #FFFFFF; 
  padding: 12px 20px; 
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 15px rgba(0,0,0,0.06); 
  display: flex; 
  flex-direction: row; 
  align-items: center; 
  justify-content: space-between; 
  z-index: 100;
}

.price-section {
  display: flex; 
  flex-direction: column;
}

.price-label {
  font-size: 12px; 
  color: #666;
}

.price-value {
  font-size: 22px; 
  font-weight: 700; 
  color: #10b981;
}

.hire-btn {
  background-color: #10b981; 
  color: #fff; 
  font-size: 16px; 
  font-weight: 700; 
  padding: 0 32px; 
  height: 48px; 
  line-height: 48px; 
  border-radius: 24px; 
  border: none; 
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
}

.hire-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.hire-btn[disabled] {
  background-color: #a7f3d0;
  box-shadow: none;
}
</style>
